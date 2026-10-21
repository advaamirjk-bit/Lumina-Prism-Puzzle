import React, { useState, useEffect } from 'react';
import {
  MultiplayerRoom,
  createMultiplayerRoom,
  joinMultiplayerRoom,
  fetchOpenMultiplayerRooms,
} from '../../firebase/firebaseConfig';
import { Swords, Plus, LogIn, Users, X, RefreshCw, Copy, Check } from 'lucide-react';

interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  currentRoom: MultiplayerRoom | null;
  playerId: string;
  onEnterRoom: (roomId: string, isHost: boolean) => void;
  onClose: () => void;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  isOpen,
  currentRoom,
  playerId,
  onEnterRoom,
  onClose,
}) => {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('lumina_player_name') || 'PrismDuelist';
  });
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [openRooms, setOpenRooms] = useState<MultiplayerRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadRooms = async () => {
    setIsLoading(true);
    const rooms = await fetchOpenMultiplayerRooms();
    setOpenRooms(rooms.filter((r) => r.status === 'waiting'));
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Room Creation
  const handleCreateRoom = async () => {
    if (!playerName.trim()) return;
    setIsLoading(true);
    localStorage.setItem('lumina_player_name', playerName.trim());

    // Generate random 6-character room code (e.g. DUEL-482)
    const code = `DUEL-${Math.floor(100 + Math.random() * 900)}`;
    const success = await createMultiplayerRoom(code, playerName.trim(), playerId);
    setIsLoading(false);

    if (success) {
      onEnterRoom(code, true);
    } else {
      setStatusMessage('Failed to create room. Please try again.');
    }
  };

  // Handle Join by Code
  const handleJoinByCode = async (codeToJoin: string) => {
    const cleanCode = codeToJoin.trim().toUpperCase();
    if (!cleanCode || !playerName.trim()) return;

    setIsLoading(true);
    localStorage.setItem('lumina_player_name', playerName.trim());

    const success = await joinMultiplayerRoom(cleanCode, playerName.trim(), playerId);
    setIsLoading(false);

    if (success) {
      onEnterRoom(cleanCode, false);
    } else {
      setStatusMessage(`Room ${cleanCode} not found or duel in progress.`);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-pop-in">
      <div className="flex flex-col w-full max-w-md max-h-[90vh] rounded-2xl border border-slate-800 bg-slate-900/95 p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Swords className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Prism Duel: 1v1 Arena</h2>
              <span className="text-xs text-slate-400">
                Real-Time Synchronized Multiplayer
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Player Name Input */}
        <div className="my-3.5 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
          <span className="text-xs text-slate-400 font-medium">Player Tag:</span>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your duel name"
            maxLength={20}
            className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none"
          />
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-center text-xs text-rose-300">
            {statusMessage}
          </div>
        )}

        {/* If user is already in a waiting room */}
        {currentRoom ? (
          <div className="flex flex-col rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 mb-4 text-center">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
              Active Room: {currentRoom.roomId}
            </span>
            <div className="flex items-center justify-center gap-2 my-2">
              <span className="font-mono-nums text-2xl font-black text-white">
                {currentRoom.roomId}
              </span>
              <button
                type="button"
                onClick={() => copyCode(currentRoom.roomId)}
                title="Copy Room Code"
                className="rounded-lg p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {currentRoom.guestId
                ? `${currentRoom.guestName} joined! Duel in progress.`
                : 'Waiting for challenger to join with code...'}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2">
                <span className="text-[10px] text-slate-500 block">Host (Player 1)</span>
                <span className="font-bold text-white">{currentRoom.hostName}</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2">
                <span className="text-[10px] text-slate-500 block">Challenger (Player 2)</span>
                <span className="font-bold text-slate-300">
                  {currentRoom.guestName || 'Waiting...'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              Enter Battle Screen
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Action 1: Create Match */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:from-rose-500 hover:to-amber-500 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create Duel Arena</span>
              </button>
            </div>

            {/* Action 2: Join by Room Code */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Join with Room Code:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. DUEL-482"
                  maxLength={12}
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none uppercase"
                />
                <button
                  type="button"
                  onClick={() => handleJoinByCode(joinCodeInput)}
                  disabled={isLoading || !joinCodeInput.trim()}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                    joinCodeInput.trim()
                      ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Join</span>
                </button>
              </div>
            </div>

            {/* Open Waiting Rooms List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Open Arenas ({openRooms.length})
                </span>
                <button
                  type="button"
                  onClick={loadRooms}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-0.5">
                {openRooms.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
                    No open arenas waiting. Click "Create Duel Arena" above to host a duel!
                  </div>
                ) : (
                  openRooms.map((room) => (
                    <div
                      key={room.roomId}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-rose-400" />
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {room.hostName}'s Arena
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Code: {room.roomId}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleJoinByCode(room.roomId)}
                        className="rounded-lg bg-rose-600/80 hover:bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        Fight!
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
