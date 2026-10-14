import React from 'react';

interface AudioWaveformProps {
  isRecording?: boolean;
  isProcessing?: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isRecording, isProcessing }) => {
  const bars = [16, 28, 44, 20, 36, 52, 24, 40, 18, 32, 48, 22, 38, 14, 30, 46, 26, 34, 18, 28];

  return (
    <div className="flex items-center gap-1 h-8 px-2 py-1 bg-stone-950/70 border border-stone-800/80 rounded-lg">
      <div className="flex items-center gap-1.5 mr-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isRecording
              ? 'bg-rose-500 animate-ping'
              : isProcessing
              ? 'bg-amber-400 animate-pulse'
              : 'bg-emerald-500'
          }`}
        />
        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
          {isRecording ? 'Listening' : isProcessing ? 'Filtering Noise' : 'Ambient Array Online'}
        </span>
      </div>
      <div className="flex items-center gap-0.5 h-6">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              isRecording
                ? 'bg-rose-400 animate-pulse'
                : isProcessing
                ? 'bg-amber-400 animate-bounce'
                : 'bg-stone-700'
            }`}
            style={{
              height: isRecording || isProcessing ? `${Math.max(6, (height * (i % 3 + 1)) % 24 + 4)}px` : '4px',
              animationDelay: `${i * 45}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
