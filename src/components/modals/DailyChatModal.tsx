import React, { useState, useEffect, useRef } from 'react';
import {
  DailyChatMessage,
  subscribeToDailyChat,
  sendDailyChatMessage,
} from '../../firebase/firebaseConfig';
import { MessageSquare, Send, X, Sparkles, Flame, Trophy } from 'lucide-react';

interface DailyChatModalProps {
  isOpen: boolean;
  dateStr: string;
  userScore: number;
  onClose: () => void;
}

export const DailyChatModal: React.FC<DailyChatModalProps> = ({
  isOpen,
  dateStr,
  userScore,
  onClose,
}) => {
  const [messages, setMessages] = useState<DailyChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('lumina_player_name') || 'PrismSeeker';
  });
  const [includeScore, setIncludeScore] = useState(userScore > 0);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Attach real-time listener to Firestore
    const unsubscribe = subscribeToDailyChat(dateStr, (newMsgs) => {
      setMessages(newMsgs);
    });

    return () => unsubscribe();
  }, [isOpen, dateStr]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    localStorage.setItem('lumina_player_name', playerName.trim());
    await sendDailyChatMessage(
      dateStr,
      playerName.trim(),
      inputText.trim(),
      includeScore && userScore > 0 ? userScore : undefined
    );
    setInputText('');
    setIsSending(false);
  };

  const quickTips = [
    'Focus on 3x3 square zones first! 💎',
    'Save the Prism Hammer for corners! 🔨',
    'Chaining combos is key to top 5! 🔥',
    'Good luck everyone! ✨',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-pop-in">
      <div className="flex flex-col w-full max-w-md h-[85vh] max-h-[640px] rounded-2xl border border-slate-800 bg-slate-900/95 p-4 sm:p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                <span>Daily Challenge Chat</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h2>
              <span className="text-[11px] text-slate-400 font-mono-nums">
                Live Community · {dateStr}
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

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 text-xs">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
              <Sparkles className="h-6 w-6 text-indigo-400 mb-1" />
              <span className="text-slate-300 font-medium">Daily Chat is Open!</span>
              <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                Share hints, solve strategies, and celebrate today’s highest scores with other players.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-200">{msg.playerName}</span>
                  {msg.scoreBadge && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-300 font-mono-nums font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                      <Trophy className="h-3 w-3 text-amber-400" />
                      {msg.scoreBadge.toLocaleString()} pts
                    </span>
                  )}
                </div>
                <p className="text-slate-300 break-words leading-relaxed">{msg.text}</p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Tips row */}
        <div className="flex gap-1.5 overflow-x-auto py-1.5 scrollbar-none">
          {quickTips.map((tip) => (
            <button
              key={tip}
              type="button"
              onClick={() => setInputText(tip)}
              className="text-[10px] whitespace-nowrap rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-slate-400 hover:border-indigo-500 hover:text-white transition-colors shrink-0"
            >
              {tip}
            </button>
          ))}
        </div>

        {/* Sender Form */}
        <form onSubmit={handleSend} className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your Name"
              maxLength={24}
              className="w-32 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
            {userScore > 0 && (
              <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeScore}
                  onChange={(e) => setIncludeScore(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-500"
                />
                <span>Attach Score ({userScore.toLocaleString()})</span>
              </label>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type tip or celebration message..."
              maxLength={280}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className={`flex items-center justify-center rounded-xl px-4 text-xs font-bold transition-all ${
                inputText.trim()
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
