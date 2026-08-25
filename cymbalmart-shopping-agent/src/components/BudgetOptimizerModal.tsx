import React, { useState, useEffect } from 'react';
import { useParty } from '../context/PartyContext';
import { budgetOptimizerAPI } from '../services/partyService';
import { 
  DollarSign, 
  X, 
  Sparkles, 
  TrendingDown
} from 'lucide-react';

export const BudgetOptimizerModal: React.FC = () => {
  const { isBudgetModalOpen, setIsBudgetModalOpen, currentPlan, alignAllItemsToStoreBrand } = useParty();
  const [targetInput, setTargetInput] = useState<number>(200);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  useEffect(() => {
    if (currentPlan) {
      setTargetInput(currentPlan.profile.budgetTotal);
    }
  }, [currentPlan]);

  if (!isBudgetModalOpen || !currentPlan) return null;

  const handleRunOptimizer = async () => {
    setIsAnalyzing(true);
    try {
      const result = await budgetOptimizerAPI(currentPlan, targetInput);
      setOptimizationResult(result);
    } catch (err) {
      console.error('Optimizer error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentTotal = currentPlan.totalEstimatedCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-black/20 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">Ledger Engineering</span>
            <h3 className="font-serif text-xl italic font-normal text-black mt-0.5">Budget Optimization Analysis</h3>
          </div>

          <button
            onClick={() => setIsBudgetModalOpen(false)}
            className="text-black/40 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State vs Goal */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-[#F8F7F4] border border-black/10">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-widest text-black/50 block">Current Tally</span>
            <span className="text-xl font-bold text-black font-mono mt-0.5 block">
              ${currentTotal.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-sans uppercase tracking-widest text-black/50 block">Target Ceiling</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-black/40">$</span>
              <input
                type="number"
                min="30"
                max="5000"
                step="10"
                value={targetInput}
                onChange={e => setTargetInput(Number(e.target.value))}
                className="w-24 bg-white border border-black/20 px-2 py-1 text-xs text-black font-mono font-bold focus:outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Action button to analyze */}
        {!optimizationResult && (
          <button
            onClick={handleRunOptimizer}
            disabled={isAnalyzing}
            className="w-full py-3 px-4 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Auditing Manifest for Bulk & Brand Efficiency...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Audit & Recommend Strategic Trims</span>
              </>
            )}
          </button>
        )}

        {/* Analysis Result */}
        {optimizationResult && (
          <div className="space-y-5">
            <div className="p-4 bg-[#FAF9F6] border border-black/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-black font-sans uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                  <TrendingDown className="w-4 h-4 text-black/60" /> Estimated Savings Identified:
                </span>
                <span className="font-bold text-black font-mono text-base">
                  ~${optimizationResult.totalSaved}
                </span>
              </div>
              <p className="text-xs text-black/70 leading-relaxed font-sans font-light">
                {optimizationResult.analysis}
              </p>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-black/50 uppercase tracking-[0.2em] block font-sans">
                Proposed Adjustments:
              </span>
              
              {optimizationResult.recommendations?.map((rec: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white border border-black/10 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black font-sans">
                      {rec.action}
                    </span>
                    <span className="font-mono font-bold text-black text-xs">
                      Save ~${rec.savingsAmount}
                    </span>
                  </div>
                  <p className="text-black/60 leading-relaxed text-[11px] font-sans">
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  alignAllItemsToStoreBrand();
                  setIsBudgetModalOpen(false);
                }}
                className="flex-1 py-2.5 px-3 text-[10px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3 h-3" />
                <span>Apply Cymbal Choice Savings</span>
              </button>

              <button
                onClick={() => setOptimizationResult(null)}
                className="py-2.5 px-3 text-[10px] font-sans uppercase tracking-widest font-semibold border border-black/20 text-black hover:border-black transition-colors"
              >
                Re-analyze
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

