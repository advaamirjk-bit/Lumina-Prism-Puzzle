import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { DayStreakHistoryItem } from '../utils/storage';
import { Flame, Check, Calendar, Activity, Zap } from 'lucide-react';

interface StreakProgressBarChartProps {
  history: DayStreakHistoryItem[];
  currentStreak: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DayStreakHistoryItem }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1 mb-1">
          <span className="font-bold text-white">
            {data.dayLabel} ({data.dayOfMonth})
          </span>
          {data.isToday && (
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/40">
              Today
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400">Status:</span>
            <span
              className={`font-semibold ${
                data.claimed
                  ? 'text-emerald-400'
                  : data.played
                  ? 'text-cyan-400'
                  : data.loggedIn
                  ? 'text-indigo-400'
                  : 'text-slate-500'
              }`}
            >
              {data.statusText}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono-nums">
            <span>Login: {data.loggedIn ? '✓' : '—'}</span>
            <span>Played: {data.played ? '✓' : '—'}</span>
            <span>Harvested: {data.claimed ? '✓' : '—'}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const StreakProgressBarChart: React.FC<StreakProgressBarChartProps> = ({
  history,
  currentStreak,
}) => {
  const getBarColor = (item: DayStreakHistoryItem) => {
    if (item.isToday) {
      if (item.claimed) return '#10b981'; // vibrant emerald
      if (item.played) return '#f59e0b'; // amber flame
      return '#38bdf8'; // bright sky
    }
    if (item.claimed) return '#10b981'; // emerald
    if (item.played) return '#06b6d4'; // cyan
    if (item.loggedIn) return '#6366f1'; // indigo
    return '#1e293b'; // slate-800
  };

  const playedDaysCount = history.filter((h) => h.played || h.claimed).length;

  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-3.5 mb-4">
      {/* Chart Title & Subhead */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            7-Day Streak & Activity History
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono-nums">
          <span className="text-slate-400">Activity:</span>
          <span className="font-bold text-amber-300">
            {playedDaysCount}/7 Days
          </span>
        </div>
      </div>

      {/* Visual Recharts Bar Graph */}
      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={history}
            margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
          >
            <XAxis
              dataKey="dayLabel"
              axisLine={false}
              tickLine={false}
              tick={({ x, y, payload }) => {
                const item = history.find((h) => h.dayLabel === payload.value);
                const isToday = item?.isToday;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={12}
                      textAnchor="middle"
                      fill={isToday ? '#fbbf24' : '#94a3b8'}
                      fontSize={10}
                      fontWeight={isToday ? 'bold' : 'normal'}
                    >
                      {payload.value}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
            <Bar dataKey="progress" radius={[5, 5, 2, 2]} isAnimationActive={true}>
              {history.map((entry) => (
                <Cell
                  key={entry.dateStr}
                  fill={getBarColor(entry)}
                  stroke={entry.isToday ? '#f59e0b' : 'transparent'}
                  strokeWidth={entry.isToday ? 1.5 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Day Markers */}
      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Harvested</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            <span>Played</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>Logged In</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-800 border border-slate-700" />
            <span>Rest</span>
          </div>
        </div>

        <div className="flex items-center gap-1 font-mono-nums text-amber-300">
          <Flame className="h-3 w-3 fill-amber-400" />
          <span>{currentStreak}d Streak</span>
        </div>
      </div>
    </div>
  );
};
