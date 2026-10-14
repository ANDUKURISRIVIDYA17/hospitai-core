import React, { useState } from 'react';
import { X, Layers, Sparkles, RefreshCw, CheckCircle2, Play } from 'lucide-react';

interface BatchProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunBatch: (items: Array<{ transcript: string; location: string }>) => Promise<void>;
  isProcessing: boolean;
}

const MULTI_ZONE_HOTEL_STREAM = [
  {
    location: 'Zone 1: Front Desk Main Lobby',
    transcript:
      'Welcome to the hotel! Terrible rain on the M25 today, took ages! Could we please have our luggage for Room 310 brought up right away and two extra hypoallergenic pillows sent up before 5 PM? Also, is the indoor heated pool still open until 10? Great!',
  },
  {
    location: 'Zone 2: 4th Floor Housekeeping Staging',
    transcript:
      'Morning Rosa, did you watch the latest episode of that murder mystery show? So scary! Hey, the guest in 405 knocked on the cart, said their shower head is leaking hot water onto the bathroom floor and they need maintenance with a wrench immediately.',
  },
  {
    location: 'Zone 3: Poolside Cabana Bar',
    transcript:
      'Hey Carlos, beautiful sunshine this afternoon! For Cabana 2, could you deliver 1 fruit platter, chilled coconut water, and 4 fresh beach towels? Thanks buddy, catch you after shift for tacos!',
  },
  {
    location: 'Zone 4: Ground Floor Elevator Bank',
    transcript:
      'Good morning ladies! Nice weather today. Have a wonderful shopping trip on 5th Avenue, take care now!',
  },
];

export const BatchProcessingModal: React.FC<BatchProcessingModalProps> = ({
  isOpen,
  onClose,
  onRunBatch,
  isProcessing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">
                Multi-Channel Ambient Hotel Ingestion
              </h3>
              <p className="text-xs text-stone-400">
                Simulate 4 concurrent hotel microphone arrays processed in parallel via Gemini 2.5 Flash
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {MULTI_ZONE_HOTEL_STREAM.map((ch, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800/90 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {ch.location}
                </span>
                <span className="text-[10px] font-mono text-stone-400">Channel #{i + 1}</span>
              </div>
              <p className="text-xs text-stone-300 italic leading-relaxed">
                "{ch.transcript}"
              </p>
            </div>
          ))}
        </div>

        {/* Footer & Trigger */}
        <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            HospitAI will filter small talk from all 4 channels and dispatch clean task JSON.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => onRunBatch(MULTI_ZONE_HOTEL_STREAM)}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition flex items-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Multi-Channel Stream...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Multi-Zone Ingestion</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
