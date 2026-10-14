import React from 'react';
import { Sparkles, Terminal, Activity, RotateCcw, Volume2, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenApiDocs: () => void;
  onResetSeedData: () => void;
  isResetting: boolean;
  healthStatus: {
    status: string;
    model: string;
    gemini_key_configured: boolean;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenApiDocs,
  onResetSeedData,
  isResetting,
  healthStatus,
}) => {
  return (
    <header className="border-b border-stone-800 bg-stone-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 text-stone-950 font-black text-xl tracking-wider">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
                Hospit<span className="text-amber-400 font-extrabold">AI</span>
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Emotional Workforce Engine
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Ambient Frontline Hotel Voice Intelligence • Noise & Small Talk Suppression
            </p>
          </div>
        </div>

        {/* Model & System Health Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-stone-400">Model:</span>
            <span className="font-mono font-medium text-amber-400">
              {healthStatus?.model || 'gemini-2.5-flash'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-stone-400">API Status:</span>
            <span className="text-stone-200">
              {healthStatus?.gemini_key_configured ? 'Key Active' : 'Fallback Engine Ready'}
            </span>
          </div>

          {/* Action buttons */}
          <button
            onClick={onOpenApiDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-700/80 text-xs font-medium transition cursor-pointer"
            title="Inspect backend REST API specification and cURL test commands"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>API & cURL</span>
          </button>

          <button
            onClick={onResetSeedData}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium transition cursor-pointer disabled:opacity-50"
            title="Reload realistic hotel operational scenario data"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-stone-400 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
