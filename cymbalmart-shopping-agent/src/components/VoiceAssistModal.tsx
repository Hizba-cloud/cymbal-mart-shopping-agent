import React, { useState } from 'react';
import { useVoice } from '../context/VoiceContext';
import { 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Sparkles, 
  ShoppingBag, 
  DollarSign, 
  Store, 
  ArrowRight, 
  Check, 
  RotateCcw,
  Zap,
  Radio,
  Clock,
  Compass
} from 'lucide-react';

interface CommandCategory {
  title: string;
  icon: React.ReactNode;
  commands: {
    command: string;
    description: string;
    testParam?: string;
  }[];
}

export const VoiceAssistModal: React.FC = () => {
  const {
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    isListening,
    toggleListening,
    isVoiceFeedbackEnabled,
    toggleVoiceFeedback,
    transcript,
    voiceLogs,
    executeVoiceCommandText,
    clearVoiceLogs,
    speak,
  } = useVoice();

  const [activeTab, setActiveTab] = useState<'commands' | 'logs'>('commands');
  const [customCommandInput, setCustomCommandInput] = useState('');

  if (!isVoiceModalOpen) return null;

  const commandCategories: CommandCategory[] = [
    {
      title: 'Shopping List & Cart Actions',
      icon: <ShoppingBag className="w-4 h-4 text-black" />,
      commands: [
        {
          command: 'Add 2 bags of ice',
          description: 'Adds item to shopping list, calculates unit price & portion math, and recalculates budget totals.',
        },
        {
          command: 'Add 3 packs of organic brioche buns',
          description: 'Adds bakery item to Aisle 2 with dietary info.',
        },
        {
          command: 'Check off brioche buns',
          description: 'Marks item as bought/packed and updates spent totals.',
        },
        {
          command: 'Change burger patties quantity to 4',
          description: 'Adjusts package quantity and re-optimizes expenditure.',
        },
        {
          command: 'Remove craft beer',
          description: 'Deletes item from list and recalculates budget.',
        },
        {
          command: 'Check all items',
          description: 'Marks all manifest items as packed.',
        },
        {
          command: 'Switch all items to Cymbal Choice store brand',
          description: 'Converts all items to Cymbal Choice store brand for ~20% savings.',
        },
      ],
    },
    {
      title: 'Store Wayfinding & Aisle Walking',
      icon: <Store className="w-4 h-4 text-black" />,
      commands: [
        {
          command: 'Go to aisles',
          description: 'Switches to Supercenter #1042 sequenced aisle route view.',
        },
        {
          command: 'Read aisle items',
          description: 'Speaks out the next remaining unbought items to pick in store.',
        },
        {
          command: 'Go to shopping list',
          description: 'Returns to the primary itemized grocery manifest.',
        },
      ],
    },
    {
      title: 'Budgeting & Portions Inquiry',
      icon: <DollarSign className="w-4 h-4 text-black" />,
      commands: [
        {
          command: 'What is my total?',
          description: 'Speaks current total spend and remaining budget balance.',
        },
        {
          command: 'What is the cost per guest?',
          description: 'Calculates and speaks total cost divided by guests.',
        },
        {
          command: 'Set budget to 250 dollars',
          description: 'Adjusts party budget ceiling and recalculates headroom.',
        },
      ],
    },
    {
      title: 'Checkout & Hands-Free Ordering',
      icon: <Zap className="w-4 h-4 text-black" />,
      commands: [
        {
          command: 'Proceed to checkout',
          description: 'Opens CymbalMart Curbside & Delivery order modal.',
        },
        {
          command: 'Select curbside pickup',
          description: 'Selects Curbside Pickup at Supercenter Bays 1–8.',
        },
        {
          command: 'Select delivery',
          description: 'Selects same-day local delivery.',
        },
        {
          command: 'Confirm order',
          description: 'Finalizes order and generates pickup barcode.',
        },
      ],
    },
    {
      title: 'Navigation & Assistant AI',
      icon: <Compass className="w-4 h-4 text-black" />,
      commands: [
        {
          command: 'Go to batch recipes',
          description: 'Navigates to scaled batch cocktail and culinary guide.',
        },
        {
          command: 'Go to countdown timeline',
          description: 'Navigates to the step-by-step host preparation schedule.',
        },
        {
          command: 'Go to blueprint',
          description: 'Navigates to party overview briefing.',
        },
        {
          command: 'Open assistant',
          description: 'Opens conversational CymbalMart Assistant chat drawer.',
        },
      ],
    },
  ];

  const handleTestCommand = (cmd: string) => {
    executeVoiceCommandText(cmd);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCommandInput.trim()) return;
    executeVoiceCommandText(customCommandInput.trim());
    setCustomCommandInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF9F6] border border-black/20 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-black/10 bg-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">Hands-Free Retail Engine</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold">
                Voice Control v2.0
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-black mt-1">
              CymbalMart Hands-Free Voice Command Center
            </h2>
            <p className="text-xs text-black/60 font-sans mt-0.5">
              Control your entire party planning, shopping manifest, aisle wayfinding, and curbside checkout using natural voice commands.
            </p>
          </div>

          <button
            onClick={() => setIsVoiceModalOpen(false)}
            className="p-1.5 text-black/40 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Microphone State Banner */}
        <div className="p-4 bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-sans uppercase tracking-widest font-bold shadow-xs ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {isListening ? (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Listening (Speak Now)</span>
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Enable Live Mic</span>
                </>
              )}
            </button>

            <button
              onClick={toggleVoiceFeedback}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-white"
            >
              {isVoiceFeedbackEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isVoiceFeedbackEnabled ? 'Audio Feedback ON' : 'Audio Feedback Muted'}</span>
            </button>
          </div>

          <div className="text-xs font-mono text-white/80 truncate max-w-sm">
            {transcript ? `Last Spoken: "${transcript}"` : 'Listening for natural speech commands...'}
          </div>
        </div>

        {/* Custom Command Test Bar */}
        <form onSubmit={handleCustomSubmit} className="p-3 bg-white border-b border-black/10 flex gap-2">
          <input
            type="text"
            value={customCommandInput}
            onChange={e => setCustomCommandInput(e.target.value)}
            placeholder="Type or test any voice command (e.g. 'Add 2 bags of ice', 'What is my total?')"
            className="flex-1 bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white hover:bg-neutral-800 text-[11px] font-sans uppercase tracking-widest font-semibold flex items-center gap-1.5"
          >
            <Play className="w-3 h-3" />
            <span>Execute</span>
          </button>
        </form>

        {/* Tab Navigation: Commands Guide vs Live History */}
        <div className="flex border-b border-black/10 bg-[#FAF9F6] px-6">
          <button
            onClick={() => setActiveTab('commands')}
            className={`py-3 px-4 text-xs font-sans uppercase tracking-wider font-semibold border-b-2 transition-colors ${
              activeTab === 'commands'
                ? 'border-black text-black'
                : 'border-transparent text-black/40 hover:text-black'
            }`}
          >
            Voice Command Directory ({commandCategories.reduce((s, c) => s + c.commands.length, 0)})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-4 text-xs font-sans uppercase tracking-wider font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-black text-black'
                : 'border-transparent text-black/40 hover:text-black'
            }`}
          >
            <span>Voice Activity Log</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-black/10 text-black">
              {voiceLogs.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'commands' ? (
            <div className="space-y-6">
              {commandCategories.map(cat => (
                <div key={cat.title} className="bg-white border border-black/10 p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-black/10">
                    {cat.icon}
                    <h3 className="font-serif font-bold text-sm text-black">{cat.title}</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {cat.commands.map(cmd => (
                      <div
                        key={cmd.command}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#FAF9F6] hover:bg-[#F4F1EA] border border-black/5 transition-colors group"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-black group-hover:text-black">
                              "{cmd.command}"
                            </span>
                          </div>
                          <p className="text-[11px] text-black/60 font-sans">
                            {cmd.description}
                          </p>
                        </div>

                        <button
                          onClick={() => handleTestCommand(cmd.command)}
                          className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-black text-white hover:bg-neutral-800 text-[10px] font-sans uppercase tracking-wider font-semibold self-start sm:self-center"
                          title="Click to execute this command right now"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>Simulate Voice</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/10">
                <span className="text-xs font-sans uppercase tracking-widest text-black/50 font-bold">
                  Spoken Dialog & Execution Ledger
                </span>
                <button
                  onClick={clearVoiceLogs}
                  className="text-[10px] font-sans uppercase tracking-wider text-black/50 hover:text-black underline"
                >
                  Clear History
                </button>
              </div>

              {voiceLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-black/50 font-sans">
                  No voice events logged yet. Speak or simulate a command above.
                </div>
              ) : (
                voiceLogs.map(log => (
                  <div
                    key={log.id}
                    className={`p-3 border text-xs leading-relaxed font-sans ${
                      log.type === 'user'
                        ? 'bg-black text-white border-black ml-8'
                        : 'bg-white text-black border-black/10 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[9px] font-sans uppercase tracking-widest font-bold opacity-60">
                        {log.type === 'user' ? 'Customer Spoken Command' : 'CymbalMart Voice Assistant'}
                      </span>
                      <span className="text-[9px] font-mono opacity-50">{log.time}</span>
                    </div>

                    <p className="font-medium">{log.text}</p>

                    {log.actionApplied && (
                      <div className="mt-2 pt-2 border-t border-current/20 text-[10px] font-mono opacity-80 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>Action: {log.actionApplied}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-black/10 flex items-center justify-between text-xs text-black/60 font-sans">
          <span>Hands-free voice recognition powered by Web Speech API & CymbalMart Assistant</span>
          <button
            onClick={() => setIsVoiceModalOpen(false)}
            className="px-4 py-2 bg-black text-white hover:bg-neutral-800 text-[11px] font-sans uppercase tracking-widest font-semibold"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
