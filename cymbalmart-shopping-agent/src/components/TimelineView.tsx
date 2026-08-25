import React from 'react';
import { useParty } from '../context/PartyContext';
import { TimelineTimeframe } from '../types/party';
import { 
  Clock, 
  Check, 
  Sparkles, 
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TimelineView: React.FC = () => {
  const { currentPlan, toggleTimelineTask } = useParty();

  if (!currentPlan) return null;

  const timeline = currentPlan.timeline || [];
  const completedCount = timeline.filter(t => t.isCompleted).length;
  const totalCount = timeline.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group steps by timeframe
  const timeframeOrder: TimelineTimeframe[] = [
    '1_week_before',
    '2_days_before',
    '1_day_before',
    'day_of_morning',
    '2_hours_before',
  ];

  const timeframeHeaders: Record<TimelineTimeframe, { title: string; subtitle: string; icon: string }> = {
    '1_week_before': { title: 'One Week Prior', subtitle: 'Orders, decor & non-perishables', icon: '📦' },
    '2_days_before': { title: 'Two Days Prior', subtitle: 'Supermarket replenishment & liquor depot run', icon: '🛒' },
    '1_day_before': { title: 'Party Eve (T-24h)', subtitle: 'Marinating, cocktail batching & chilling', icon: '🍋' },
    'day_of_morning': { title: 'Event Morning', subtitle: 'Bag ice, fresh bakery pickup & glassware polish', icon: '🧊' },
    '2_hours_before': { title: 'Final Ambiance (T-2h)', subtitle: 'Charcuterie styling, music curation & lighting', icon: '✦' },
  };

  const handleToggle = (taskId: string) => {
    toggleTimelineTask(taskId);
    if (completedCount + 1 === totalCount) {
      try {
        confetti({ particleCount: 60, spread: 70 });
      } catch (_) {}
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Briefing */}
      <div className="bg-white border border-black/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">Execution Schedule</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal italic text-black tracking-tight mt-1">
              Host Preparation & Staging Timeline
            </h1>
            <p className="text-xs text-black/60 font-sans mt-0.5">
              Chronological milestones ensuring seamless prep, temperature control, and effortless hosting.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#F4F1EA] px-4 py-2 border border-black/10 shrink-0">
            <div>
              <div className="text-xs font-mono font-bold text-black">
                {completedCount}/{totalCount} Completed
              </div>
              <div className="text-[10px] font-sans uppercase tracking-widest text-black/60">
                {progressPercent}% Stage Readiness
              </div>
            </div>
            <div className="w-16 h-1.5 bg-black/10 overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Steps */}
      <div className="space-y-6">
        {timeframeOrder.map((tf, index) => {
          const stepsInTimeframe = timeline.filter(t => t.timeframe === tf);
          if (stepsInTimeframe.length === 0) return null;

          const meta = timeframeHeaders[tf];

          return (
            <div
              key={tf}
              className="bg-white border border-black/10 p-6 sm:p-8 space-y-5 shadow-xs"
            >
              {/* Header of timeframe */}
              <div className="flex items-center justify-between pb-4 border-b border-black/10">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{meta.icon}</span>
                  <div>
                    <h3 className="font-serif text-lg italic font-normal text-black flex items-center gap-2">
                      <span>{meta.title}</span>
                    </h3>
                    <p className="text-xs text-black/60 font-sans">{meta.subtitle}</p>
                  </div>
                </div>

                <span className="text-[10px] font-sans uppercase tracking-widest text-black/40 font-bold">
                  Phase 0{index + 1}
                </span>
              </div>

              {/* Task list */}
              <div className="space-y-2.5">
                {stepsInTimeframe.map(step => (
                  <div
                    key={step.id}
                    onClick={() => handleToggle(step.id)}
                    className={`p-3.5 cursor-pointer transition-all border flex items-start gap-3.5 ${
                      step.isCompleted
                        ? 'bg-[#FAF9F6] border-black/5 opacity-60'
                        : 'bg-[#FDFCFB] border-black/10 hover:border-black/30'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-none flex items-center justify-center border shrink-0 transition-colors ${
                      step.isCompleted
                        ? 'bg-black border-black text-white'
                        : 'border-black/30 bg-white text-transparent'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>

                    <div className="flex-1 min-w-0 font-sans">
                      <p className={`text-xs font-semibold leading-relaxed ${
                        step.isCompleted ? 'line-through text-black/40' : 'text-black'
                      }`}>
                        {step.task}
                      </p>
                      
                      {step.notes && (
                        <p className="text-[11px] text-black/60 mt-0.5">
                          {step.notes}
                        </p>
                      )}
                    </div>

                    <span className="text-[9px] font-sans font-semibold px-2 py-0.5 bg-[#F8F7F4] text-black/70 border border-black/10 uppercase tracking-widest shrink-0">
                      {step.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

