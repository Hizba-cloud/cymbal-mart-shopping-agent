import React, { useState, useRef, useEffect } from 'react';
import { useParty } from '../context/PartyContext';
import { useVoice } from '../context/VoiceContext';
import { 
  X, 
  Send, 
  Sparkles, 
  Zap,
  ShoppingBag,
  Store,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Add 2 bags of ice and 3 packs of brioche buns',
  'Remove craft beer from my shopping list',
  'Change burger patties quantity to 4',
  'Switch all items to Cymbal Choice brand to save money',
  'Update target budget to $225',
  'Add vegan appetizers for 4 guests and recalculate budget',
];

export const AgentChatDrawer: React.FC = () => {
  const { 
    isChatDrawerOpen, 
    setIsChatDrawerOpen, 
    chatMessages, 
    sendChatMessage, 
    applyMutation,
    currentPlan
  } = useParty();

  const {
    isListening,
    toggleListening,
    speak,
    isSpeaking,
  } = useVoice();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [appliedActionIds, setAppliedActionIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatDrawerOpen]);

  if (!isChatDrawerOpen) return null;

  const totalCost = currentPlan?.totalEstimatedCost || 0;
  const targetBudget = currentPlan?.profile.budgetTotal || 0;
  const diff = targetBudget - totalCost;
  const isOver = totalCost > targetBudget;

  const handleSend = async (text: string) => {
    const msg = text.trim();
    if (!msg || isSending) return;
    setInput('');
    setIsSending(true);
    try {
      await sendChatMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyAction = (action: any, msgId: string) => {
    applyMutation(action);
    setAppliedActionIds(prev => [...prev, msgId]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#FDFCFB] border-l border-black/20 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Chat Header: CymbalMart Assistant */}
        <div className="p-5 border-b border-black/10 bg-[#FAF9F6] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs">
                ✦
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif text-base font-bold text-black tracking-tight">CymbalMart Assistant</h3>
                  <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.2 bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-black/60 font-sans">
                  Supercenter #1042 • Shopping List & Budget AI
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsChatDrawerOpen(false)}
              className="p-1.5 text-black/40 hover:text-black transition-colors"
              title="Close CymbalMart Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Budget & Manifest Status Bar */}
          <div className="bg-white border border-black/10 p-2.5 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-black/50" />
              <div>
                <span className="text-[10px] text-black/50 uppercase tracking-wider block">List Total</span>
                <span className="font-mono font-bold text-black">${totalCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="h-6 w-px bg-black/10" />

            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-black/50" />
              <div>
                <span className="text-[10px] text-black/50 uppercase tracking-wider block">Target Budget</span>
                <span className="font-mono font-semibold text-black">${targetBudget.toFixed(2)}</span>
              </div>
            </div>

            <div className="h-6 w-px bg-black/10" />

            <div>
              <span className="text-[10px] text-black/50 uppercase tracking-wider block">Status</span>
              <span className={`font-mono text-[11px] font-bold ${isOver ? 'text-rose-700' : 'text-emerald-700'}`}>
                {isOver ? `+$${Math.abs(diff).toFixed(2)} Over` : `$${diff.toFixed(2)} Left`}
              </span>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans">
          {chatMessages.map(msg => {
            const isAgent = msg.role === 'agent';
            const isActionApplied = appliedActionIds.includes(msg.id);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[90%] p-4 text-xs leading-relaxed ${
                    isAgent
                      ? 'bg-white text-black border border-black/10 shadow-xs'
                      : 'bg-black text-white font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[9px] uppercase tracking-widest font-bold opacity-60">
                      {isAgent ? 'CymbalMart Assistant' : 'You'}
                    </span>
                    <div className="flex items-center gap-2">
                      {isAgent && (
                        <button
                          onClick={() => speak(msg.content)}
                          className="opacity-50 hover:opacity-100 transition-opacity p-0.5 text-black"
                          title="Read message aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                      <span className="text-[9px] font-mono opacity-50">{msg.timestamp}</span>
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {/* Plan mutation / shopping list action button */}
                  {msg.suggestedAction && (
                    <div className="mt-3 pt-3 border-t border-black/10 space-y-2">
                      {isActionApplied ? (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>Updated shopping list & recalculated budget totals!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApplyAction(msg.suggestedAction, msg.id)}
                          className="w-full py-2.5 px-3 text-[10px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{msg.suggestedAction.label || 'Update Shopping List & Budget'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center gap-2.5 text-xs text-black/70 bg-[#F4F1EA] p-3.5 border border-black/10 max-w-[85%] font-sans">
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin shrink-0" />
              <span>CymbalMart Assistant updating catalog & recalculating budget...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-[#FAF9F6] border-t border-black/10">
          <div className="text-[9px] font-sans uppercase tracking-wider text-black/50 font-bold mb-1.5">
            Suggested Customer Inquiries
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isSending}
                className="whitespace-nowrap px-2.5 py-1 text-[10px] font-sans uppercase tracking-wider bg-white text-black/70 hover:text-black hover:border-black border border-black/15 transition-colors shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-4 bg-white border-t border-black/10 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 transition-colors shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-[#FAF9F6] text-black/60 hover:text-black border border-black/15'
            }`}
            title={isListening ? 'Microphone Active (Listening)' : 'Speak voice request'}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask CymbalMart Assistant to add items, modify quantities, change budget..."
            className="flex-1 bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black placeholder-black/30 focus:outline-none focus:border-black font-sans"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="p-2 bg-black text-white hover:bg-neutral-800 transition-colors disabled:opacity-30 shrink-0"
            title="Send request to CymbalMart Assistant"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};


