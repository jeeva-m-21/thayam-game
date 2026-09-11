import React, { useState } from 'react';
import type { PlayerColor } from '@thayam/rules-engine';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string, color: PlayerColor) => void;
  currentRoomId: string | null;
  assignedColor: PlayerColor | null;
  isConnected: boolean;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  onJoinRoom,
  currentRoomId,
  assignedColor,
  isConnected,
}) => {
  const [roomId, setRoomId] = useState('THAYAM1');
  const [selectedColor, setSelectedColor] = useState<PlayerColor>('red');

  if (!isOpen) return null;

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TH-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomId(code);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      onJoinRoom(roomId.trim().toUpperCase(), selectedColor);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-floor-oxide border-2 border-brass-bright rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-kolam-chalk/15 bg-stone-ink/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <h2 className="text-lg font-display font-bold text-brass-bright">
              Online Multiplayer Arena
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-kolam-chalk/10 hover:bg-kolam-chalk/20 text-kolam-chalk flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-2 bg-stone-ink/30 border-b border-kolam-chalk/10 flex items-center justify-between text-xs">
          <span className="text-kolam-chalk/60">Server Status:</span>
          <div className="flex items-center gap-1.5 font-medium">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={isConnected ? 'text-emerald-400' : 'text-red-400'}>
              {isConnected ? 'Connected to Fly/Local Fastify' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleJoin} className="p-6 flex flex-col gap-5">
          {currentRoomId ? (
            <div className="p-4 bg-stone-ink/60 rounded-xl border border-brass/40 flex flex-col gap-2 text-center">
              <span className="text-xs text-kolam-chalk/70 uppercase tracking-widest">Active Match Room</span>
              <span className="text-2xl font-mono font-black text-brass-bright">{currentRoomId}</span>
              <p className="text-xs text-kolam-chalk/80">
                Playing as <span className="font-bold uppercase text-brass">{assignedColor}</span>
              </p>
            </div>
          ) : (
            <>
              {/* Room Code input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-kolam-chalk/80">
                  Room Code / Match ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    placeholder="e.g. THAYAM1"
                    maxLength={10}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-stone-ink/80 border border-kolam-chalk/20 font-mono text-brass-bright font-bold uppercase tracking-wider focus:outline-none focus:border-brass-bright"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 py-2 rounded-xl bg-kolam-chalk/10 hover:bg-kolam-chalk/20 border border-kolam-chalk/20 text-xs font-semibold text-kolam-chalk"
                  >
                    🎲 New
                  </button>
                </div>
              </div>

              {/* Color selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-kolam-chalk/80">
                  Select Your Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['red', 'green', 'yellow', 'blue'] as const).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        selectedColor === color
                          ? 'border-brass-bright bg-kolam-chalk/20 text-brass-bright shadow'
                          : 'border-kolam-chalk/15 bg-stone-ink/40 text-kolam-chalk/60 hover:text-kolam-chalk'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            color === 'red'
                              ? '#B2312F'
                              : color === 'green'
                              ? '#4B7A46'
                              : color === 'yellow'
                              ? '#D9A22A'
                              : '#2E4C74',
                        }}
                      />
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action button */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-kolam-chalk/20 text-kolam-chalk/70 text-xs font-semibold hover:text-kolam-chalk"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConnected}
              className="px-6 py-2 bg-brass-bright text-stone-ink font-bold text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {currentRoomId ? 'Rejoin / Switch' : 'Join Match Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
