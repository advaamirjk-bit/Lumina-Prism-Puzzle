import React from 'react';
import { MultiplayerRoom } from '../firebase/firebaseConfig';
import { Swords, ShieldAlert, Zap, LogOut } from 'lucide-react';

interface MultiplayerDuelHUDProps {
  room: MultiplayerRoom;
  isHost: boolean;
  onLeaveDuel: () => void;
}

export const MultiplayerDuelHUD: React.FC<MultiplayerDuelHUDProps> = ({
  room,
  isHost,
  onLeaveDuel,
}) => {
  const myName = isHost ? room.hostName : room.guestName || 'You';
  const myHp = isHost ? room.hostHp : room.guestHp || 0;
  const myScore = isHost ? room.hostScore : room.guestScore || 0;
  const myCombo = isHost ? room.hostCombo : room.guestCombo || 1;

  const oppName = isHost ? room.guestName || 'Waiting...' : room.hostName;
  const oppHp = isHost ? room.guestHp ?? 100 : room.hostHp;
  const oppScore = isHost ? room.guestScore ?? 0 : room.hostScore;
  const oppCombo = isHost ? room.guestCombo ?? 1 : room.hostCombo;
  const oppGridStr = isHost
    ? room.guestGridSummary || '0'.repeat(81)
    : room.hostGridSummary || '0'.repeat(81);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-2.5 px-2 mb-2">
      {/* Room Badge & Exit Strip */}
      <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold font-mono">
            <Swords className="h-3.5 w-3.5 text-rose-400" />
            <span>ROOM: {room.roomId}</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Status: {room.status === 'in_progress' ? '⚔ BATTLE ACTIVE' : 'WAITING FOR OPPONENT'}
          </span>
        </div>

        <button
          type="button"
          onClick={onLeaveDuel}
          title="Exit 1v1 Room"
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
        >
          <LogOut className="h-3 w-3" />
          <span>Leave Room</span>
        </button>
      </div>

      {/* Duel Health & Score Clash Bar */}
      <div className="grid grid-cols-2 gap-3 items-center rounded-xl border border-slate-800 bg-slate-950/80 p-3 shadow-md">
        {/* You */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <span>{myName}</span>
              <span className="text-[9px] text-emerald-400 font-normal">(You)</span>
            </span>
            <span className="text-xs font-mono-nums font-bold text-emerald-300">
              {myHp}/100 HP
            </span>
          </div>

          {/* Health Bar */}
          <div className="h-2.5 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-300 ${
                myHp > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : myHp > 20
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-rose-600 to-rose-500 animate-pulse'
              }`}
              style={{ width: `${Math.max(0, myHp)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-nums">
            <span>Score: {myScore.toLocaleString()}</span>
            {myCombo > 1 && <span className="text-amber-400 font-bold">x{myCombo}</span>}
          </div>
        </div>

        {/* Opponent */}
        <div className="flex flex-col border-l border-slate-800 pl-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1 truncate">
              <span>{oppName}</span>
              <span className="text-[9px] text-rose-400 font-normal">(Rival)</span>
            </span>
            <span className="text-xs font-mono-nums font-bold text-rose-300">
              {oppHp}/100 HP
            </span>
          </div>

          {/* Opponent Health Bar */}
          <div className="h-2.5 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-1.5">
            <div
              className={`h-full transition-all duration-300 ${
                oppHp > 50
                  ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                  : oppHp > 20
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                  : 'bg-gradient-to-r from-red-700 to-rose-600 animate-pulse'
              }`}
              style={{ width: `${Math.max(0, oppHp)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-nums">
            <span>Score: {oppScore.toLocaleString()}</span>
            {oppCombo > 1 && <span className="text-amber-400 font-bold">x{oppCombo}</span>}
          </div>
        </div>
      </div>

      {/* Combat Attack Log Banner */}
      {room.lastAttackText && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300">
          <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{room.lastAttackText}</span>
        </div>
      )}

      {/* Opponent Live Radar Mini-Board */}
      <div className="flex items-center justify-between rounded-xl border border-slate-800/90 bg-slate-950/60 p-2.5">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Opponent Mini-Radar
          </span>
          <span className="text-xs text-slate-300">
            {oppName}'s 9x9 Lattice
          </span>
        </div>

        {/* 9x9 miniature radar matrix */}
        <div className="grid grid-cols-9 gap-0.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
          {oppGridStr.split('').map((cellChar, idx) => (
            <div
              key={idx}
              className={`h-2 w-2 rounded-xs transition-colors ${
                cellChar === '1'
                  ? 'bg-rose-400 shadow-xs'
                  : 'bg-slate-950'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
