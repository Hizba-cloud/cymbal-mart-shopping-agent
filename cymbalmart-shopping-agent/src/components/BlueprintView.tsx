import React from 'react';
import { useParty } from '../context/PartyContext';
import { 
  Wine, 
  Sparkles, 
  Users, 
  DollarSign, 
  ArrowRight, 
  Lightbulb, 
  CheckCircle2, 
  ShoppingBag,
  TrendingUp,
  Package,
  Utensils,
  Bot
} from 'lucide-react';

export const BlueprintView: React.FC = () => {
  const { currentPlan, setActiveTab, setIsBudgetModalOpen, setIsChatDrawerOpen, setIsWizardOpen } = useParty();

  if (!currentPlan) return null;

  const { profile, consumptionMath, budgetStatus, items, savingsTips, agentAdvice, signatureRecipes } = currentPlan;
  const totalGuests = profile.adultsCount + profile.kidsCount;

  // Category cost distribution
  const categoryTotals = items.reduce((acc, item) => {
    const cost = item.estimatedPrice * (item.quantity || 1);
    acc[item.category] = (acc[item.category] || 0) + cost;
    return acc;
  }, {} as Record<string, number>);

  const categoryLabels: Record<string, { label: string; icon: string }> = {
    beverages: { label: 'Beverages & Bar', icon: '🍸' },
    food_catering: { label: 'Food & Culinary', icon: '🍕' },
    tableware_essentials: { label: 'Tableware & Essentials', icon: '🍽️' },
    decor_theme: { label: 'Theme & Ambiance', icon: '🎨' },
    entertainment_favors: { label: 'Games & Favors', icon: '🎲' },
    ice_perishables: { label: 'Ice & Perishables', icon: '🧊' },
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Executive Briefing Card */}
      <div className="bg-white border border-black/10 p-6 sm:p-10 shadow-xs relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] font-bold bg-[#F4F1EA] text-black border border-black/10">
                {profile.eventType}
              </span>
              <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] font-semibold bg-white text-black/70 border border-black/10">
                {profile.vibe}
              </span>
              <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] font-semibold bg-white text-black/70 border border-black/10">
                {profile.hostTier} Tier
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-black tracking-tight italic leading-tight">
              {profile.name}
            </h1>

            <p className="text-sm sm:text-base text-black/70 leading-relaxed font-sans font-light">
              {currentPlan.summary || currentPlan.themeDescription}
            </p>

            {profile.dietaryRestrictions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/5">
                <span className="text-[11px] font-sans uppercase tracking-widest text-black/40 font-medium">Dietary Protocols:</span>
                {profile.dietaryRestrictions.map(d => (
                  <span key={d} className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-[#F8F7F4] text-black border border-black/10">
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('shopping_list')}
              className="py-3 px-6 bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-2 text-[11px] font-sans uppercase tracking-[0.2em] font-semibold transition-all shadow-xs whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Manifest ({items.length} items)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsChatDrawerOpen(true)}
              className="py-3 px-6 bg-transparent hover:bg-black/5 text-black border border-black/20 hover:border-black flex items-center justify-center gap-2 text-[11px] font-sans uppercase tracking-[0.2em] font-medium transition-colors whitespace-nowrap"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>CymbalMart Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Consumption Math Engine Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">Calculation Suite</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-black italic font-normal">
              Autonomous Consumption Ratios
            </h2>
            <p className="text-xs text-black/50 font-sans mt-0.5">
              Calculated for {profile.adultsCount} adults, {profile.kidsCount} kids over {profile.durationHours} hours
            </p>
          </div>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="text-[11px] font-sans uppercase tracking-widest font-semibold text-black hover:opacity-70 border-b border-black pb-0.5"
          >
            Adjust Guest Count
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Stat 1: Drinks */}
          <div className="p-5 bg-white border border-black/10 space-y-2">
            <div className="flex items-center justify-between text-black/50 text-[10px] uppercase tracking-widest">
              <span className="font-bold">Total Drinks</span>
              <Wine className="w-3.5 h-3.5 text-black/40" />
            </div>
            <div className="text-3xl font-serif text-black">
              {consumptionMath.totalDrinksExpected} <span className="text-xs font-sans text-black/50 font-normal">servings</span>
            </div>
            <p className="text-[11px] text-black/60 leading-relaxed font-sans">
              2 drinks 1st hr, 1/hr after with 15% host reserve buffer
            </p>
          </div>

          {/* Stat 2: Ice */}
          <div className="p-5 bg-white border border-black/10 space-y-2">
            <div className="flex items-center justify-between text-black/50 text-[10px] uppercase tracking-widest">
              <span className="font-bold">Bagged Ice</span>
              <span className="text-sm">🧊</span>
            </div>
            <div className="text-3xl font-serif text-black">
              {consumptionMath.icePoundsNeeded} <span className="text-xs font-sans text-black/50 font-normal">lbs</span>
            </div>
            <p className="text-[11px] text-black/60 leading-relaxed font-sans">
              1.5 lbs/guest for glasses + cooler chilling tub reserve
            </p>
          </div>

          {/* Stat 3: Food / Appetizers */}
          <div className="p-5 bg-white border border-black/10 space-y-2">
            <div className="flex items-center justify-between text-black/50 text-[10px] uppercase tracking-widest">
              <span className="font-bold">Bites & Small Plates</span>
              <Utensils className="w-3.5 h-3.5 text-black/40" />
            </div>
            <div className="text-3xl font-serif text-black">
              {consumptionMath.appetizerPiecesTotal} <span className="text-xs font-sans text-black/50 font-normal">pieces</span>
            </div>
            <p className="text-[11px] text-black/60 leading-relaxed font-sans">
              ~{Math.round(consumptionMath.appetizerPiecesTotal / totalGuests)} finger pieces per guest grazing rate
            </p>
          </div>

          {/* Stat 4: Tableware */}
          <div className="p-5 bg-white border border-black/10 space-y-2">
            <div className="flex items-center justify-between text-black/50 text-[10px] uppercase tracking-widest">
              <span className="font-bold">Tableware Units</span>
              <Package className="w-3.5 h-3.5 text-black/40" />
            </div>
            <div className="text-3xl font-serif text-black">
              {consumptionMath.tablewareCountRecommended} <span className="text-xs font-sans text-black/50 font-normal">units</span>
            </div>
            <p className="text-[11px] text-black/60 leading-relaxed font-sans">
              1.5 plates + 2 cups + 2.5 napkins per attendee
            </p>
          </div>

        </div>
      </div>

      {/* Budget Allocation & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Category Breakdown */}
        <div className="lg:col-span-2 bg-white border border-black/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">Ledger</p>
              <h3 className="font-serif text-xl italic text-black font-normal">
                Cost Allocation by Department
              </h3>
            </div>
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="text-[11px] font-sans uppercase tracking-widest font-semibold text-black hover:opacity-70 flex items-center gap-1 border-b border-black pb-0.5"
            >
              <Lightbulb className="w-3.5 h-3.5" /> Optimizer
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {(Object.entries(categoryTotals) as [string, number][]).map(([catKey, amount]) => {
              const meta = categoryLabels[catKey] || { label: catKey, icon: '📦' };
              const percentage = currentPlan.totalEstimatedCost > 0 
                ? Math.round((amount / currentPlan.totalEstimatedCost) * 100) 
                : 0;

              return (
                <div key={catKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-black/80 flex items-center gap-2">
                      <span className="opacity-70">{meta.icon}</span>
                      <span>{meta.label}</span>
                    </span>
                    <span className="font-mono text-black font-semibold">
                      ${amount.toFixed(2)} <span className="text-black/40 font-normal">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F4F1EA] overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(4, percentage))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Budget status bar */}
          <div className="pt-6 border-t border-black/10 grid grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-black/40 font-medium">Estimated Cart</span>
              <div className="text-xl font-serif font-semibold text-black">
                ${currentPlan.totalEstimatedCost.toFixed(2)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-black/40 font-medium">Target Ceiling</span>
              <div className="text-xl font-serif text-black/60">
                ${profile.budgetTotal.toFixed(2)}
              </div>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[10px] uppercase tracking-wider text-black/40 font-medium">Variance</span>
              <div>
                {budgetStatus.status === 'under' ? (
                  <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-emerald-800 px-2 py-0.5 bg-emerald-50 border border-emerald-200">
                    -${budgetStatus.difference.toFixed(2)} Under
                  </span>
                ) : budgetStatus.status === 'on_track' ? (
                  <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-black px-2 py-0.5 bg-[#F4F1EA] border border-black/10">
                    On Target
                  </span>
                ) : (
                  <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-rose-800 px-2 py-0.5 bg-rose-50 border border-rose-200">
                    +${Math.abs(budgetStatus.difference).toFixed(2)} Over
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Agent Host Tips & Quick Guidance in stark Obsidian Card */}
        <div className="bg-[#141414] text-white p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-white/50 font-semibold">
                Autonomous Brief
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">ONLINE</span>
            </div>

            <h4 className="font-serif text-lg italic font-normal text-white">
              Host Curation Directives
            </h4>

            <ul className="space-y-3 text-xs text-white/80 font-sans">
              {savingsTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-white/40 font-mono text-[10px] mt-0.5">0{idx + 1}</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 space-y-1.5">
            <span className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">
              Agent Key Insight
            </span>
            <p className="text-xs text-white/90 italic font-serif leading-relaxed">
              "{agentAdvice}"
            </p>
          </div>
        </div>

      </div>

      {/* Signature Drink & Food Preview */}
      {signatureRecipes.length > 0 && (
        <div className="bg-white border border-black/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">Bar & Atelier</p>
              <h3 className="font-serif text-xl italic text-black font-normal">
                Curated Signature Service
              </h3>
              <p className="text-xs text-black/50 font-sans mt-0.5">
                Ingredients are mapped directly into your master shopping list
              </p>
            </div>

            <button
              onClick={() => setActiveTab('recipes')}
              className="text-[11px] font-sans uppercase tracking-widest font-semibold text-black hover:opacity-70 flex items-center gap-1 border-b border-black pb-0.5"
            >
              <span>Explore Atelier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {signatureRecipes.slice(0, 2).map(recipe => (
              <div
                key={recipe.id}
                onClick={() => setActiveTab('recipes')}
                className="p-5 bg-[#FDFCFB] border border-black/10 hover:border-black/30 cursor-pointer transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F4F1EA] text-black uppercase tracking-wider">
                    {recipe.type}
                  </span>
                  <span className="text-xs text-black/50 font-mono">{recipe.servings} Servings</span>
                </div>
                <h4 className="font-serif font-normal text-lg italic text-black">{recipe.name}</h4>
                <p className="text-xs text-black/60 line-clamp-2 leading-relaxed font-sans">
                  {recipe.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

