import React, { useState } from 'react';
import { Copy, Check, Download, AlertCircle, Sparkles, VolumeX, Heart, ShieldAlert, Compass } from 'lucide-react';

interface CleanJsonViewerProps {
  task: {
    task_type: string;
    room_number: string;
    urgency: 'Immediate' | 'High' | 'Medium' | 'Low' | string;
    notes: string;
  } | null;
  analysis?: {
    guest_sentiment: string;
    guest_sentiment_score: number;
    staff_empathy_score: number;
    small_talk_detected: string[];
    is_actionable: boolean;
    department_category: string;
    recommended_staff_role: string;
    estimated_duration_mins: number;
  } | null;
  rawJsonString?: string;
  executionTimeMs?: number;
  modelUsed?: string;
  onDispatchTask?: () => void;
}

export const CleanJsonViewer: React.FC<CleanJsonViewerProps> = ({
  task,
  analysis,
  rawJsonString,
  executionTimeMs,
  modelUsed,
  onDispatchTask,
}) => {
  const [copied, setCopied] = useState(false);

  if (!task) {
    return (
      <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[420px]">
        <div className="w-14 h-14 rounded-2xl bg-stone-800/60 border border-stone-700/50 flex items-center justify-center text-stone-500 mb-4">
          <Sparkles className="w-7 h-7 text-amber-500/70" />
        </div>
        <h3 className="text-base font-semibold text-stone-300">Clean JSON Output Ready</h3>
        <p className="text-xs text-stone-500 max-w-sm mt-1.5 leading-relaxed">
          Select or paste an ambient frontline hotel transcript on the left, then click{' '}
          <strong className="text-stone-300">Extract Clean JSON</strong> to process with Gemini 2.5 Flash.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] font-mono text-stone-400">
          <span className="px-2.5 py-1 rounded bg-stone-850 border border-stone-700/50">"task_type"</span>
          <span className="px-2.5 py-1 rounded bg-stone-850 border border-stone-700/50">"room_number"</span>
          <span className="px-2.5 py-1 rounded bg-stone-850 border border-stone-700/50">"urgency"</span>
          <span className="px-2.5 py-1 rounded bg-stone-850 border border-stone-700/50">"notes"</span>
        </div>
      </div>
    );
  }

  // Generate clean 4-key JSON string strictly matching user prompt requirement
  const cleanObject = {
    task_type: task.task_type,
    room_number: task.room_number,
    urgency: task.urgency,
    notes: task.notes,
  };
  const displayJson = rawJsonString || JSON.stringify(cleanObject, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([displayJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospitai-task-${task.room_number || 'clean'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Immediate':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'High':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Medium':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      default:
        return 'bg-stone-500/15 text-stone-300 border-stone-500/30';
    }
  };

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 flex flex-col h-full shadow-xl">
      {/* Header & Actions */}
      <div className="flex items-center justify-between pb-3.5 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
            Target Output JSON
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Clean 4-Key Schema
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {executionTimeMs !== undefined && (
            <span className="text-[11px] font-mono text-stone-400 bg-stone-950 px-2 py-1 rounded border border-stone-800">
              {executionTimeMs}ms
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs transition cursor-pointer"
            title="Copy clean JSON to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs transition cursor-pointer"
            title="Download JSON file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Structured Key Inspector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3">
        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2.5">
          <span className="text-[10px] font-mono uppercase text-stone-500 block">task_type</span>
          <span className="text-xs font-semibold text-stone-200 truncate block mt-0.5" title={task.task_type}>
            {task.task_type}
          </span>
        </div>

        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2.5">
          <span className="text-[10px] font-mono uppercase text-stone-500 block">room_number</span>
          <span className="text-xs font-semibold text-amber-400 truncate block mt-0.5">
            {task.room_number || 'N/A'}
          </span>
        </div>

        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2.5">
          <span className="text-[10px] font-mono uppercase text-stone-500 block">urgency</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border inline-block mt-0.5 ${getUrgencyBadge(task.urgency)}`}>
            {task.urgency}
          </span>
        </div>

        <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-2.5">
          <span className="text-[10px] font-mono uppercase text-stone-500 block">actionable</span>
          <span className={`text-xs font-semibold inline-block mt-0.5 ${analysis?.is_actionable ? 'text-emerald-400' : 'text-stone-400'}`}>
            {analysis?.is_actionable ? 'Yes (Dispatch)' : 'False (Pure Banter)'}
          </span>
        </div>
      </div>

      {/* Syntax Highlighted JSON Code Box */}
      <div className="relative flex-1 bg-stone-950 rounded-xl border border-stone-800/90 p-4 font-mono text-xs overflow-x-auto my-2">
        <pre className="text-amber-200/90 leading-relaxed font-mono whitespace-pre-wrap">
          {displayJson}
        </pre>
      </div>

      {/* Small Talk Filtered Out Banner */}
      {analysis?.small_talk_detected && analysis.small_talk_detected.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3 my-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-medium mb-1.5">
            <VolumeX className="w-3.5 h-3.5" />
            <span>Ignored Small Talk & Ambient Noise:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.small_talk_detected.map((noise, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-stone-900/90 text-stone-300 border border-stone-800 text-[11px]"
              >
                ✓ Stripped: {noise}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* HospitAI Emotional Workforce Insights Panel */}
      {analysis && (
        <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3 my-2 text-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="font-semibold text-stone-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Emotional Workforce Insights
            </span>
            <span className="text-[11px] text-stone-500 font-mono">
              Role: {analysis.recommended_staff_role}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800">
              <span className="text-stone-500 block">Guest Sentiment</span>
              <span className="font-medium text-stone-200 mt-0.5 block truncate">
                {analysis.guest_sentiment}
              </span>
            </div>
            <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800">
              <span className="text-stone-500 block">Staff Empathy Score</span>
              <span className="font-semibold text-emerald-400 mt-0.5 block">
                {analysis.staff_empathy_score} / 10
              </span>
            </div>
            <div className="bg-stone-900/80 p-2 rounded-lg border border-stone-800">
              <span className="text-stone-500 block">Est. Time</span>
              <span className="font-medium text-stone-200 mt-0.5 block">
                ~{analysis.estimated_duration_mins} mins
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notes summary footer */}
      <div className="pt-2 text-xs text-stone-400 flex items-start gap-2 border-t border-stone-800/80 mt-1">
        <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <span className="italic">
          "{task.notes}"
        </span>
      </div>
    </div>
  );
};
