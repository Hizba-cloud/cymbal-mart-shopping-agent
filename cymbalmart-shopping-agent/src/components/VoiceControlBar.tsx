import React, { useState } from 'react';
import { useVoice } from '../context/VoiceContext';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  Radio,
  Sliders,
  X
} from 'lucide-react';

export const VoiceControlBar: React.FC = () => {
  const {
    isListening,
    isSupported,
    toggleListening,
    isVoiceFeedbackEnabled,
    toggleVoiceFeedback,
    isSpeaking,
    transcript,
    interimTranscript,
    lastCommand,
    setIsVoiceModalOpen,
  } = useVoice();

  const [isMinimized, setIsMinimized] = useState(false);

  // If speech recognition is not supported in the current environment, show fallback quick-launcher
  return (
    <div className="bg-neutral-900 text-white border-b border-white/10 px-4 py-2.5 transition-all text-xs font-sans">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left: Status & Microphone Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-sans uppercase tracking-widest font-bold transition-all shadow-xs ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
              title={isListening ? 'Click to pause hands-free voice control' : 'Click to enable hands-free voice control'}
            >
              {isListening ? (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Enable Voice</span>
                </>
              )}
            </button>

            {/* Pulsing Audio Waveform Indicator */}
            {isListening && (
              <div className="flex items-center gap-1 px-2 py-1 bg-black/40 border border-white/10">
                <span className="w-1 h-3 bg-rose-400 animate-[bounce_0.8s_infinite_100ms]" />
                <span className="w-1 h-5 bg-rose-400 animate-[bounce_0.8s_infinite_200ms]" />
                <span className="w-1 h-2 bg-rose-400 animate-[bounce_0.8s_infinite_300ms]" />
                <span className="w-1 h-4 bg-rose-400 animate-[bounce_0.8s_infinite_400ms]" />
                <span className="text-[10px] uppercase font-mono text-white/70 ml-1">Hands-Free Active</span>
              </div>
            )}
          </div>

          {/* Spoken Feedback Speaker Switch */}
          <button
            onClick={toggleVoiceFeedback}
            className={`p-1.5 border transition-colors ${
              isVoiceFeedbackEnabled
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                : 'bg-transparent border-white/10 text-white/40 hover:text-white'
            }`}
            title={isVoiceFeedbackEnabled ? 'Audio Speech Feedback ON (Click to Mute)' : 'Audio Speech Feedback MUTED (Click to Enable)'}
          >
            {isVoiceFeedbackEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Center: Live Spoken Transcript or Helpful Hints */}
        <div className="flex-1 max-w-xl text-center sm:text-left px-2 truncate">
          {interimTranscript ? (
            <div className="text-white/80 italic font-mono text-xs truncate flex items-center gap-1.5 justify-center sm:justify-start">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              <span>Hearing: "{interimTranscript}"</span>
            </div>
          ) : transcript ? (
            <div className="text-emerald-300 font-mono text-xs truncate flex items-center gap-1.5 justify-center sm:justify-start">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Recognized: "{transcript}"</span>
            </div>
          ) : (
            <div className="text-white/60 text-[11px] truncate flex items-center gap-1.5 justify-center sm:justify-start">
              <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
              <span>Say: <em>"Add 2 bags of ice"</em>, <em>"Check off buns"</em>, <em>"What is my total?"</em>, or <em>"Go to aisles"</em></span>
            </div>
          )}
        </div>

        {/* Right: Cheatsheet / Guide Modal Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {isSpeaking && (
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-black/40 px-2 py-0.5 border border-emerald-500/30">
              <Radio className="w-3 h-3 animate-spin" /> Speaking...
            </span>
          )}

          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-sans uppercase tracking-wider font-semibold transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Voice Guide</span>
          </button>
        </div>

      </div>
    </div>
  );
};
