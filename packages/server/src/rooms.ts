import { FastifyInstance } from 'fastify';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createGame, applyRoll, applyMove, rollDice, DEFAULT_BOARD } from '@thayam/rules-engine';
import type { GameState, Move, PlayerColor } from '@thayam/rules-engine';

interface Room {
  id: string;
  players: Record<string, PlayerColor>; // socketId -> color
  gameState: GameState;
  reconnectGrace: Record<string, NodeJS.Timeout>;
}

const rooms: Record<string, Room> = {};

export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    socket.on('join_room', ({ roomId, color }: { roomId: string; color: PlayerColor }) => {
      socket.join(roomId);
      if (!rooms[roomId]) {
        rooms[roomId] = {
          id: roomId,
          players: {},
          gameState: createGame(DEFAULT_BOARD, ['red', 'green']),
          reconnectGrace: {},
        };
      }

      const room = rooms[roomId];
      room.players[socket.id] = color;
      io.to(roomId).emit('room_state', {
        roomId,
        gameState: room.gameState,
        players: room.players,
      });
    });

    socket.on('roll_dice', ({ roomId }: { roomId: string }) => {
      const room = rooms[roomId];
      if (!room || room.gameState.phase !== 'waiting-for-roll') return;

      const playerColor = room.players[socket.id];
      const activeColor = room.gameState.turnOrder[room.gameState.currentPlayerIndex];
      if (playerColor !== activeColor) return; // Disallow out-of-turn rolls

      const roll = rollDice();
      room.gameState = applyRoll(room.gameState, roll);
      io.to(roomId).emit('room_state', {
        roomId,
        gameState: room.gameState,
        players: room.players,
      });
    });

    socket.on('make_move', ({ roomId, move }: { roomId: string; move: Move }) => {
      const room = rooms[roomId];
      if (!room || room.gameState.phase !== 'waiting-for-move') return;

      const playerColor = room.players[socket.id];
      if (playerColor !== move.playerColor) return;

      try {
        room.gameState = applyMove(room.gameState, move);
        io.to(roomId).emit('room_state', {
          roomId,
          gameState: room.gameState,
          players: room.players,
        });
      } catch (err) {
        socket.emit('move_rejected', { error: (err as Error).message });
      }
    });

    socket.on('disconnect', () => {
      for (const [roomId, room] of Object.entries(rooms)) {
        if (room.players[socket.id]) {
          delete room.players[socket.id];
          io.to(roomId).emit('player_disconnected', { socketId: socket.id });
        }
      }
    });
  });
}
