import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Play, Sparkles, RefreshCw, Send, Radio, FileText, ChevronRight } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';

interface PresetTranscript {
  id: string;
  title: string;
  category: string;
  room: string;
  location: string;
  transcript: string;
  smallTalkSummary: string;
}

const PRESET_CONVERSATIONS: PresetTranscript[] = [
  {
    id: 'preset-1',
    title: 'Plumbing Emergency & Weather Chit-Chat',
    category: 'Maintenance',
    room: 'Room 418',
    location: 'Front Desk Terminal 1',
    smallTalkSummary: 'London rain, Heathrow T2 baggage delays, Italian seafood pasta specials',
    transcript:
      'Good afternoon Mr. Henderson, welcome back! Oh gosh, did you fly through Heathrow? The rain there this morning was just dreadful, took my sister two hours to clear security. Dreadful weather! Before you head up though, the bathtub faucet in room 418 started dripping again and the housekeeper noticed the drain is gurgling like it might overflow. Could we get engineering up to room 418 immediately with a pipe snake? Also, hope you enjoy the restaurant downstairs, chef Marco is doing an Italian seafood pasta tonight that is to die for! Thank you!',
  },
  {
    id: 'preset-2',
    title: 'Hallway Housekeeping & Soccer Banter',
    category: 'Housekeeping',
    room: 'Room 602',
    location: '6th Floor Service Hallway Mic',
    smallTalkSummary: 'Real Madrid match, 90th min goal, lunch break scheduling',
    transcript:
      'Hi Maria, happy Tuesday! Did you catch that match last night? Real Madrid was incredible, what a goal in the 90th minute! Oh by the way, the gentleman in room 602 stopped me in the hallway. He has an urgent business presentation and requested four extra bottles of sparkling water, two sets of fresh bath towels, and an ergonomic desk chair if we have one in storage before 2:00 PM. But anyway, are you taking lunch at noon or one today?',
  },
  {
    id: 'preset-3',
    title: 'Room Service Late Night & Peanut Allergy',
    category: 'Room Service',
    room: 'Room 714',
    location: 'PBX / Dining Order Line',
    smallTalkSummary: 'Anniversary wishes, Paris autumn leaves, rooftop terrace hours',
    transcript:
      'Room service, how may I assist you this evening? Oh, happy anniversary to you both! Paris is so lovely this time of year with the autumn leaves. For room 714, could you send up one dairy-free club sandwich, hot truffle fries, and a chilled bottle of Pinot Noir? The guest has a severe peanut allergy, so please alert the kitchen. Oh, and how late is the rooftop terrace bar open tonight? Wonderful.',
  },
  {
    id: 'preset-4',
    title: 'Pure Ambient Small Talk (No Operational Task)',
    category: 'Social Banter',
    room: 'Lobby',
    location: 'Lobby Central Ambient Array',
    smallTalkSummary: 'Sunny morning weather, freshly roasted espresso beans, weekend plans',
    transcript:
      'Hey Tom, good morning! Beautiful sunny morning out there on the terrace, isn’t it? The espresso beans they roasted today smell fantastic. Have a great shift man, see you around the breakroom later!',
  },
  {
    id: 'preset-5',
    title: 'VIP Guest Executive Lockout (Urgent Recovery)',
    category: 'Guest Recovery',
    room: 'Suite 1201',
    location: 'Front Desk VIP Pod',
    smallTalkSummary: 'None (Pure guest distress)',
    transcript:
      'I have been standing here for 40 minutes and my keycard is not opening Presidential Suite 1201! I have an international board meeting conference call in eight minutes and my presentation laptop is locked inside. Please get a duty manager and security up to Suite 1201 right now!',
  },
  {
    id: 'preset-6',
    title: 'Concierge Valet & JFK Airport Transfer',
    category: 'Luggage / Concierge',
    room: 'Room 520',
    location: 'Concierge Ambient Desk',
    smallTalkSummary: 'Broadway musical review praise',
    transcript:
      'Good morning concierge! Yes, for room 520, the guests need their three large suitcases brought down to the valet and an airport limousine confirmed for JFK Terminal 4 departing at exactly 3:30 PM. They also wanted to say the Broadway tickets you recommended yesterday were magical, absolute masterpiece!',
  },
];

interface AmbientExtractorProps {
  onExtract: (payload: { transcript: string; location: string; model: string }) => Promise<void>;
  isLoading: boolean;
}

export const AmbientExtractor: React.FC<AmbientExtractorProps> = ({ onExtract, isLoading }) => {
  const [transcript, setTranscript] = useState(PRESET_CONVERSATIONS[0].transcript);
  const [selectedPresetId, setSelectedPresetId] = useState(PRESET_CONVERSATIONS[0].id);
  const [location, setLocation] = useState(PRESET_CONVERSATIONS[0].location);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const handleSelectPreset = (preset: PresetTranscript) => {
    setSelectedPresetId(preset.id);
    setTranscript(preset.transcript);
    setLocation(preset.location);
  };

  const handleToggleSpeech = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. You can type or select preset hotel conversations.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        if (currentText) {
          setTranscript((prev) => prev ? `${prev} ${currentText}` : currentText);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim() || isLoading) return;
    onExtract({
      transcript: transcript.trim(),
      location: location || 'Ambient Frontline Mic',
      model: 'gemini-2.5-flash',
    });
  };

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-100">Ambient Frontline Ingestion</h2>
            <p className="text-[11px] text-stone-400">Microphone stream & transcript processor</p>
          </div>
        </div>

        <AudioWaveform isRecording={isListening} isProcessing={isLoading} />
      </div>

      {/* Preset Selector Carousel */}
      <div className="py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-stone-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Preset Frontline Audio Transcripts:
          </span>
          <span className="text-[11px] text-stone-400">Click to load</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESET_CONVERSATIONS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl text-left border transition text-xs flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500/50 text-stone-100 ring-1 ring-amber-500/30'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full mb-1">
                  <span className="font-semibold text-amber-400 truncate text-[11px]">{preset.category}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-900 border border-stone-800 text-stone-400">
                    {preset.room}
                  </span>
                </div>
                <div className="text-[11px] font-medium leading-snug line-clamp-1">{preset.title}</div>
                <div className="text-[10px] text-stone-400 mt-1 line-clamp-1">
                  Banter: {preset.smallTalkSummary}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3 mt-1">
        {/* Location & Audio Channel context */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-400 shrink-0">Ambient Location Context:</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
          >
            <option value="Front Desk Terminal 1">Front Desk Terminal 1 (Check-in / Lobby)</option>
            <option value="6th Floor Service Hallway Mic">6th Floor Service Hallway Mic</option>
            <option value="PBX / Dining Order Line">PBX / Dining Order Line (In-Room Dining)</option>
            <option value="Lobby Central Ambient Array">Lobby Central Ambient Array (Social lounge)</option>
            <option value="Front Desk VIP Pod">Front Desk VIP Pod (Executive Guests)</option>
            <option value="Concierge Ambient Desk">Concierge Ambient Desk</option>
            <option value="Poolside Cabana Station #3">Poolside Cabana Station #3</option>
          </select>
        </div>

        {/* Transcript Textarea with Mic Button */}
        <div className="relative flex-1 min-h-[160px] bg-stone-950 rounded-xl border border-stone-800 focus-within:border-amber-500/80 transition flex flex-col">
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              setSelectedPresetId('');
            }}
            placeholder="Paste or speak frontline hotel conversation transcript here... HospitAI will suppress all pleasantries, greetings, and small talk to output clean JSON."
            className="w-full flex-1 p-3.5 bg-transparent text-stone-100 text-xs sm:text-sm font-sans resize-none focus:outline-none leading-relaxed placeholder:text-stone-600"
          />

          {/* Footer Controls inside textarea box */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-stone-900 bg-stone-950/80 rounded-b-xl text-xs text-stone-500">
            <div className="flex items-center gap-3">
              <span>{transcript.split(/\s+/).filter(Boolean).length} words</span>
              {selectedPresetId && (
                <span className="text-[11px] text-amber-400/80 font-mono">
                  Preset Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {speechSupported && (
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
                  }`}
                  title={isListening ? 'Stop live audio transcription' : 'Start speaking into microphone'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setTranscript('');
                  setSelectedPresetId('');
                }}
                className="text-[11px] text-stone-500 hover:text-stone-300 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Submit Execution Button */}
        <button
          type="submit"
          disabled={!transcript.trim() || isLoading}
          className="w-full py-3 px-4 rounded-xl font-medium text-xs sm:text-sm text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-950/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
              <span>Analyzing Ambient Stream with Gemini 2.5 Flash...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-stone-950" />
              <span>Process Transcript & Extract Clean JSON</span>
              <ChevronRight className="w-4 h-4 text-stone-950/70" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
