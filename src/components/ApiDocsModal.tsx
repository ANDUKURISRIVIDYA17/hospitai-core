import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2, Server } from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const curlExample = `curl -X POST "http://localhost:3000/api/extract-tasks" \\
  -H "Content-Type: application/json" \\
  -d '{
    "transcript": "Good afternoon Mr. Henderson! The weather in London was just dreadful this morning. Before you head up, the bathtub faucet in room 418 started dripping and the drain is gurgling like it might overflow. Could we get engineering up to room 418 immediately with a pipe snake? Also enjoy dinner tonight!",
    "location": "Front Desk Terminal 1",
    "model": "gemini-2.5-flash"
  }'`;

  const responseExample = `{
  "success": true,
  "task": {
    "task_type": "Maintenance",
    "room_number": "418",
    "urgency": "Immediate",
    "notes": "Inspect and repair dripping bathtub faucet and gurgling bathroom drain at risk of overflowing with pipe snake."
  },
  "clean_json": "{\\n  \\"task_type\\": \\"Maintenance\\",\\n  \\"room_number\\": \\"418\\",\\n  \\"urgency\\": \\"Immediate\\",\\n  \\"notes\\": \\"...\\"\\n}",
  "analysis": {
    "guest_sentiment": "Anxious / Concerned",
    "guest_sentiment_score": -0.4,
    "staff_empathy_score": 9.2,
    "small_talk_detected": [
      "London rainy weather",
      "Dinner recommendations"
    ],
    "is_actionable": true,
    "department_category": "Engineering & Maintenance",
    "recommended_staff_role": "Maintenance Technician",
    "estimated_duration_mins": 25
  },
  "execution_time_ms": 340,
  "model": "gemini-2.5-flash"
}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                HospitAI Backend API Specification
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Gemini 2.5 Flash
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Frontline ambient conversation transcript ingestion endpoint & clean JSON output
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs text-stone-300">
          {/* Endpoint definition */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-amber-500 text-stone-950">
                POST
              </span>
              <span className="font-mono text-stone-200 text-xs">/api/extract-tasks</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Consumes ambient hotel voice transcript text, filters out chit-chat, weather talk, and greetings,
              and generates clean structured JSON with keys: <code>task_type</code>, <code>room_number</code>,{' '}
              <code>urgency</code>, and <code>notes</code>.
            </p>
          </div>

          {/* cURL Example */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                cURL Request Example
              </span>
              <button
                onClick={() => copyToClipboard(curlExample, 'curl')}
                className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {copiedSection === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'curl' ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-amber-200/90 overflow-x-auto leading-relaxed">
              {curlExample}
            </pre>
          </div>

          {/* Response Example */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                Response (Clean JSON Output)
              </span>
              <button
                onClick={() => copyToClipboard(responseExample, 'resp')}
                className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {copiedSection === 'resp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'resp' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-300 overflow-x-auto leading-relaxed">
              {responseExample}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
