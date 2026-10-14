import React from 'react';
import { VolumeX, Flame, HeartHandshake, CheckCircle2, Clock, Layers } from 'lucide-react';

interface MetricsBarProps {
  metrics: {
    total: number;
    actionable: number;
    noise_filtered_items: number;
    small_talk_ratio_pct: number;
    immediate_urgency: number;
    high_urgency: number;
    pending: number;
    in_progress: number;
    completed: number;
    average_empathy_score: number;
  };
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Processed */}
      <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-400 text-xs">
          <span>Transcripts</span>
          <Layers className="w-4 h-4 text-stone-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-stone-100">{metrics.total}</span>
          <span className="text-[11px] text-stone-400 font-mono">ambient</span>
        </div>
        <div className="mt-1 text-[11px] text-stone-400">
          {metrics.actionable} actionable tasks
        </div>
      </div>

      {/* Small Talk Filtered Out */}
      <div className="bg-stone-900/80 border border-amber-900/30 rounded-xl p-3.5 flex flex-col justify-between bg-gradient-to-br from-stone-900/90 to-amber-950/20">
        <div className="flex items-center justify-between text-amber-300 text-xs">
          <span>Small Talk Filtered</span>
          <VolumeX className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400">{metrics.noise_filtered_items}</span>
          <span className="text-[11px] text-amber-300/80 font-mono">topics stripped</span>
        </div>
        <div className="mt-1 text-[11px] text-stone-400">
          {metrics.small_talk_ratio_pct}% non-operational banter
        </div>
      </div>

      {/* Immediate Urgency */}
      <div className="bg-stone-900/80 border border-rose-900/40 rounded-xl p-3.5 flex flex-col justify-between bg-gradient-to-br from-stone-900/90 to-rose-950/20">
        <div className="flex items-center justify-between text-rose-300 text-xs">
          <span>Immediate Urgency</span>
          <Flame className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-400">{metrics.immediate_urgency}</span>
          <span className="text-[11px] text-rose-300/80 font-mono">P0 priority</span>
        </div>
        <div className="mt-1 text-[11px] text-stone-400">
          {metrics.high_urgency} high priority
        </div>
      </div>

      {/* Frontline Staff Empathy Rating */}
      <div className="bg-stone-900/80 border border-emerald-900/40 rounded-xl p-3.5 flex flex-col justify-between bg-gradient-to-br from-stone-900/90 to-emerald-950/20">
        <div className="flex items-center justify-between text-emerald-300 text-xs">
          <span>Staff Empathy Score</span>
          <HeartHandshake className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-emerald-400">{metrics.average_empathy_score}</span>
          <span className="text-xs text-stone-400">/ 10</span>
        </div>
        <div className="mt-1 text-[11px] text-stone-400">
          Frontline composure rating
        </div>
      </div>

      {/* Pending Dispatch */}
      <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-400 text-xs">
          <span>Pending Dispatch</span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400">{metrics.pending}</span>
          <span className="text-[11px] text-stone-400 font-mono">unassigned</span>
        </div>
        <div className="mt-1 text-[11px] text-stone-400">
          {metrics.in_progress} in progress
        </div>
      </div>

      {/* Resolved Tasks */}
      <div className="bg-stone-900/80 border border-stone-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-stone-400 text-xs">
          <span>Completed</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400">{metrics.completed}</span>
          <span className="text-[11px] text-stone-400 font-mono">resolved</span>
        </div>
        <div className="mt-1 text-[11px] text-stone-400">
          Automated archive
        </div>
      </div>
    </div>
  );
};
