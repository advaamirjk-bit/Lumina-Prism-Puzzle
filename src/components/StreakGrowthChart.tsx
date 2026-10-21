import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { ThirtyDayStreakGrowthItem } from '../utils/storage';
import { TrendingUp, Flame, Calendar, Award, ShieldCheck } from 'lucide-react';

interface StreakGrowthChartProps {
  growthData: ThirtyDayStreakGrowthItem[];
  currentStreak: number;
  streakShieldsCount: number;
}

interface GrowthTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ThirtyDayStreakGrowthItem }>;
}

const GrowthCustomTooltip: React.FC<GrowthTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-2xl backdrop-blur-md min-w-[140px]">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1.5">
          <span className="font-bold text-white">
            {data.dayName}, {data.dateLabel}
          </span>
          {data.isToday && (
            <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/40">
              Today
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1 text-slate-400">
              <Flame className="h-3 w-3 text-amber-400 fill-amber-400" />
              Streak:
            </span>
            <span className="font-mono-nums font-bold text-amber-300">
              {data.streak} Days
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Activity:</span>
            <span
              className={`font-semibold ${
                data.status === 'harvested'
                  ? 'text-emerald-400'
                  : data.status === 'played'
                  ? 'text-cyan-400'
                  : data.status === 'login'
                  ? 'text-indigo-400'
                  : 'text-slate-500'
              }`}
            >
              {data.statusText}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/80">
            <span>XP Bonus:</span>
            <span className="font-mono-nums text-indigo-300 font-semibold">
              +{data.xpBonus} XP
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const StreakGrowthChart: React.FC<StreakGrowthChartProps> = ({
  growthData,
  currentStreak,
  streakShieldsCount,
}) => {
  const activeDays = growthData.filter((d) => d.activityScore >= 50).length;
  const maxStreakIn30 = Math.max(...growthData.map((d) => d.streak), currentStreak);
  const nextMilestone =
    currentStreak < 7 ? 7 : currentStreak < 14 ? 14 : currentStreak < 21 ? 21 : 30;

  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-3.5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            30-Day Activity & Streak Growth Trend
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono-nums">
          <span className="text-slate-400">Active:</span>
          <span className="font-bold text-amber-300">
            {activeDays}/30 Days
          </span>
        </div>
      </div>

      {/* Recharts Area Growth Chart */}
      <div className="h-34 w-full">
        <ResponsiveContainer width="100%" height={136}>
          <AreaChart
            data={growthData}
            margin={{ top: 10, right: 8, left: -22, bottom: 0 }}
          >
            <defs>
              <linearGradient id="streakGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.65} />
                <stop offset="60%" stopColor="#d97706" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#78350f" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="activityLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />

            <XAxis
              dataKey="dateLabel"
              axisLine={false}
              tickLine={false}
              interval={4}
              tick={{ fontSize: 9, fill: '#64748b' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: '#64748b' }}
              domain={[0, Math.max(8, maxStreakIn30 + 2)]}
            />

            <Tooltip
              content={<GrowthCustomTooltip />}
              cursor={{ stroke: 'rgba(245, 158, 11, 0.4)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />

            {/* 7-day milestone guide */}
            <ReferenceLine
              y={7}
              stroke="rgba(16, 185, 129, 0.35)"
              strokeDasharray="3 3"
              label={{
                value: '7d',
                position: 'right',
                fill: '#10b981',
                fontSize: 8,
              }}
            />

            <Area
              type="monotone"
              dataKey="streak"
              stroke="url(#activityLineGradient)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#streakGrowthGradient)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
        <div className="flex flex-col rounded-lg bg-slate-900/60 p-1.5 border border-slate-800">
          <span className="text-slate-400">Peak Streak</span>
          <span className="font-mono-nums font-bold text-amber-300 text-xs mt-0.5">
            {maxStreakIn30} Days
          </span>
        </div>
        <div className="flex flex-col rounded-lg bg-slate-900/60 p-1.5 border border-slate-800">
          <span className="text-slate-400">Next Target</span>
          <span className="font-mono-nums font-bold text-emerald-400 text-xs mt-0.5">
            Day {nextMilestone}
          </span>
        </div>
        <div className="flex flex-col rounded-lg bg-slate-900/60 p-1.5 border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-cyan-400 inline" />
            Shields
          </span>
          <span className="font-mono-nums font-bold text-cyan-300 text-xs mt-0.5">
            {streakShieldsCount} Equipped
          </span>
        </div>
      </div>
    </div>
  );
};
