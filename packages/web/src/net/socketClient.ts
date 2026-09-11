import { io, Socket } from 'socket.io-client';
import type { GameState, Move, PlayerColor } from '@thayam/rules-engine';

export interface RoomStatePayload {
  roomId: string;
  gameState: GameState;
  players: Record<string, PlayerColor>;
}

class SocketClient {
  private socket: Socket | null = null;
  private isConnected = false;
  private roomId: string | null = null;
  private myColor: PlayerColor | null = null;

  public connect(url?: string): Socket {
    if (this.socket) return this.socket;

    const serverUrl =
      url ||
      (typeof window !== 'undefined'
        ? `http://${window.location.hostname}:4001`
        : 'http://localhost:4001');

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public getRoomId(): string | null {
    return this.roomId;
  }

  public getMyColor(): PlayerColor | null {
    return this.myColor;
  }

  public joinRoom(roomId: string, color: PlayerColor) {
    if (!this.socket) this.connect();
    this.roomId = roomId;
    this.myColor = color;
    this.socket?.emit('join_room', { roomId, color });
  }

  public rollDice() {
    if (!this.socket || !this.roomId) return;
    this.socket.emit('roll_dice', { roomId: this.roomId });
  }

  public makeMove(move: Move) {
    if (!this.socket || !this.roomId) return;
    this.socket.emit('make_move', { roomId: this.roomId, move });
  }

  public onRoomState(cb: (payload: RoomStatePayload) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('room_state', cb);
  }

  public onMoveRejected(cb: (err: { error: string }) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('move_rejected', cb);
  }

  public onPlayerDisconnected(cb: (data: { socketId: string }) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('player_disconnected', cb);
  }
}

export const socketClient = new SocketClient();
