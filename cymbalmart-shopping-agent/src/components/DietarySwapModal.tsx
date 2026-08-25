import React, { useState } from 'react';
import { useParty } from '../context/PartyContext';
import { dietarySwapAPI } from '../services/partyService';
import { DIETARY_OPTIONS } from '../data/partyPresets';
import { 
  ArrowRightLeft, 
  X, 
  Sparkles, 
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DietarySwapModal: React.FC = () => {
  const { 
    isDietaryModalOpen, 
    setIsDietaryModalOpen, 
    dietarySwapTargetItem, 
    applyDietarySwap,
    currentPlan
  } = useParty();

  const [selectedRestriction, setSelectedRestriction] = useState<string>('Gluten-Free');
  const [isGenerating, setIsGenerating] = useState(false);
  const [swapResult, setSwapResult] = useState<any>(null);

  if (!isDietaryModalOpen || !dietarySwapTargetItem || !currentPlan) return null;

  const handleGenerateSwap = async () => {
    setIsGenerating(true);
    try {
      const result = await dietarySwapAPI(
        dietarySwapTargetItem,
        selectedRestriction,
        currentPlan.profile.theme
      );
      setSwapResult(result);
    } catch (err) {
      console.error('Dietary swap error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!swapResult) return;
    applyDietarySwap(dietarySwapTargetItem.id, swapResult);
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white border border-black/20 p-6 sm:p-8 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">Dietary Adaptation</span>
            <h3 className="font-serif text-xl italic font-normal text-black mt-0.5">Ingredient Substitution</h3>
          </div>

          <button
            onClick={() => {
              setIsDietaryModalOpen(false);
              setSwapResult(null);
            }}
            className="text-black/40 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Item Card */}
        <div className="p-4 bg-[#F8F7F4] border border-black/10 space-y-1">
          <span className="text-[10px] font-sans font-bold text-black/50 uppercase tracking-widest">
            Original Item for Revision:
          </span>
          <div className="flex items-center justify-between text-xs font-sans">
            <strong className="text-black font-semibold">{dietarySwapTargetItem.name}</strong>
            <span className="text-black/50 font-mono">
              {dietarySwapTargetItem.quantity} {dietarySwapTargetItem.unit} (~${dietarySwapTargetItem.estimatedPrice.toFixed(2)})
            </span>
          </div>
        </div>

        {/* Dietary Target Selector */}
        <div>
          <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-2">
            Target Accommodation:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DIETARY_OPTIONS.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setSelectedRestriction(opt);
                  setSwapResult(null);
                }}
                className={`px-2.5 py-1 text-[10px] font-sans uppercase tracking-wider font-semibold border transition-all ${
                  selectedRestriction === opt
                    ? 'bg-black text-white border-black'
                    : 'bg-[#FDFCFB] text-black/60 border-black/15 hover:border-black'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Swap Action or Result Display */}
        {!swapResult ? (
          <button
            onClick={handleGenerateSwap}
            disabled={isGenerating}
            className="w-full py-3 px-4 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Formulating Alternative...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Find {selectedRestriction} Alternative</span>
              </>
            )}
          </button>
        ) : (
          <div className="p-4 bg-[#FAF9F6] border border-black/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold text-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-black/60" /> Formulated Substitution
              </span>
              <span className="text-xs font-bold text-black font-mono">
                ${swapResult.estimatedPrice?.toFixed(2)}
              </span>
            </div>

            <div>
              <h4 className="font-serif italic text-base text-black">{swapResult.alternativeName}</h4>
              <p className="text-xs text-black/70 mt-1 leading-relaxed font-sans font-light">
                {swapResult.notes}
              </p>
              {swapResult.brandSuggestion && (
                <p className="text-[11px] text-black/60 mt-1 font-sans">
                  <strong>Brand:</strong> {swapResult.brandSuggestion}
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleApply}
                className="flex-1 py-2.5 px-3 text-[10px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply to Manifest</span>
              </button>
              <button
                onClick={() => setSwapResult(null)}
                className="py-2.5 px-3 text-[10px] font-sans uppercase tracking-widest font-semibold border border-black/20 text-black hover:border-black transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

