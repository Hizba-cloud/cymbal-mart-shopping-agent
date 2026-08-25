import React, { useState } from 'react';
import { useParty } from '../context/PartyContext';
import { PARTY_PRESETS, DIETARY_OPTIONS, VIBE_OPTIONS, EVENT_TYPE_OPTIONS } from '../data/partyPresets';
import { PartyProfile, HostTier, CateringStyle, LocationType } from '../types/party';
import { 
  X, 
  Sparkles, 
  Users, 
  Clock, 
  DollarSign, 
  Check, 
  ArrowRight
} from 'lucide-react';

export const PartyWizardModal: React.FC = () => {
  const { isWizardOpen, setIsWizardOpen, createPlanFromProfile, isGenerating } = useParty();
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');

  // Custom Form State
  const [name, setName] = useState('Weekend Celebration');
  const [eventType, setEventType] = useState('Birthday Bash');
  const [theme, setTheme] = useState('Modern Cocktail & Tapas');
  const [adultsCount, setAdultsCount] = useState(12);
  const [kidsCount, setKidsCount] = useState(0);
  const [durationHours, setDurationHours] = useState(4);
  const [budgetTotal, setBudgetTotal] = useState(250);
  const [hostTier, setHostTier] = useState<HostTier>('balanced');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(['Gluten-Free', 'Vegetarian']);
  const [vibe, setVibe] = useState('Casual & Fun');
  const [cateringStyle, setCateringStyle] = useState<CateringStyle>('hybrid_prep');
  const [locationType, setLocationType] = useState<LocationType>('indoor');
  const [additionalNotes, setAdditionalNotes] = useState('');

  if (!isWizardOpen) return null;

  const toggleDietary = (item: string) => {
    setDietaryRestrictions(prev =>
      prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item]
    );
  };

  const handleSelectPreset = (preset: typeof PARTY_PRESETS[0]) => {
    setName(preset.title);
    setEventType(preset.eventType);
    setTheme(preset.theme);
    setAdultsCount(preset.defaultAdults);
    setKidsCount(preset.defaultKids);
    setDurationHours(preset.defaultDurationHours);
    setBudgetTotal(preset.defaultBudget);
    setHostTier(preset.defaultTier);
    setDietaryRestrictions(preset.defaultDietary);
    setVibe(preset.defaultVibe);
    setCateringStyle(preset.defaultCatering);
    setAdditionalNotes(preset.notes);
    setActiveTab('custom');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile: PartyProfile = {
      id: `profile-${Date.now()}`,
      name: name.trim() || 'Celebration Party',
      eventType,
      theme: theme.trim() || 'Celebration',
      date: 'Saturday Evening',
      time: '7:00 PM',
      locationType,
      adultsCount: Math.max(1, adultsCount),
      kidsCount: Math.max(0, kidsCount),
      durationHours: Math.max(1, durationHours),
      budgetTotal: Math.max(20, budgetTotal),
      hostTier,
      dietaryRestrictions,
      vibe,
      cateringStyle,
      additionalNotes,
    };
    await createPlanFromProfile(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-black/20 shadow-2xl text-black my-8 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-black/10 flex items-center justify-between bg-[#FAF9F6]">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">Event Specification Engine</span>
            <h2 className="text-xl sm:text-2xl font-serif italic font-normal text-black tracking-tight mt-0.5">
              Formulate Procurement Plan
            </h2>
          </div>

          <button
            onClick={() => !isGenerating && setIsWizardOpen(false)}
            disabled={isGenerating}
            className="p-2 text-black/40 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-black/10 bg-white px-8 pt-3 gap-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 text-sm font-serif italic transition-colors border-b-2 ${
              activeTab === 'templates'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-black/40 hover:text-black'
            }`}
          >
            Curated Formats & Themes
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 text-sm font-serif italic transition-colors border-b-2 ${
              activeTab === 'custom'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-black/40 hover:text-black'
            }`}
          >
            Custom Specifications
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'templates' && (
          <div className="p-8 max-h-[70vh] overflow-y-auto space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PARTY_PRESETS.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="group relative p-5 bg-[#FDFCFB] hover:bg-[#F8F7F4] border border-black/10 hover:border-black cursor-pointer transition-all duration-150 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{preset.icon}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F4F1EA] text-black border border-black/10">
                        ${preset.defaultBudget} est.
                      </span>
                    </div>
                    <h3 className="font-serif text-lg italic text-black transition-colors">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-black/60 mt-1 line-clamp-2 leading-relaxed font-sans">
                      {preset.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs text-black/50 font-sans">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5 text-black/40" />
                      {preset.defaultAdults} adults {preset.defaultKids > 0 ? `+ ${preset.defaultKids} kids` : ''}
                    </span>
                    <span className="text-[10px] font-sans uppercase tracking-widest text-black font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Configure <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className="text-xs text-black/60 hover:text-black font-sans uppercase tracking-widest border-b border-black/30 hover:border-black pb-0.5 transition-all"
              >
                Or define bespoke parameters from scratch →
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Form */}
        {activeTab === 'custom' && (
          <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                  Event Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Leo's Rooftop Soirée"
                  className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                  Classification
                </label>
                <select
                  value={eventType}
                  onChange={e => setEventType(e.target.value)}
                  className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
                >
                  {EVENT_TYPE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                Theme & Aesthetic Vision
              </label>
              <input
                type="text"
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="e.g. Tuscan Vineyard & Charcuterie, Sleek Minimalist Monochrome, Midsummer Garden"
                className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
                required
              />
            </div>

            {/* Guest & Duration Math Sliders */}
            <div className="p-5 bg-[#F8F7F4] border border-black/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-black flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-black/60" /> Consumption Ratios & Capacity
                </span>
                <span className="text-xs text-black/60 font-sans">
                  <strong className="text-black font-semibold">{adultsCount + kidsCount} guests</strong> over <strong className="text-black font-semibold">{durationHours} hours</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-black/60">Adults</span>
                    <span className="font-mono font-bold text-black">{adultsCount}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="60"
                    value={adultsCount}
                    onChange={e => setAdultsCount(Number(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-black/60">Children</span>
                    <span className="font-mono font-bold text-black">{kidsCount}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={kidsCount}
                    onChange={e => setKidsCount(Number(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-black/60">Duration</span>
                    <span className="font-mono font-bold text-black">{durationHours} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={durationHours}
                    onChange={e => setDurationHours(Number(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Budget & Host Tier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                  Target Budget ($ USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-black/40 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="30"
                    max="5000"
                    step="10"
                    value={budgetTotal}
                    onChange={e => setBudgetTotal(Number(e.target.value))}
                    className="w-full bg-[#FDFCFB] border border-black/15 pl-8 pr-3 py-2 text-xs text-black font-mono font-semibold focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <p className="text-[10px] font-sans text-black/50 mt-1">
                  ~${((budgetTotal) / Math.max(1, adultsCount + kidsCount)).toFixed(1)} per guest target allocation
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                  Tier Strategy
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['budget', 'balanced', 'gourmet'] as HostTier[]).map(tier => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setHostTier(tier)}
                      className={`px-2 py-2 text-[10px] font-sans uppercase tracking-wider font-semibold border transition-all text-center ${
                        hostTier === tier
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black/60 border-black/15 hover:border-black'
                      }`}
                    >
                      {tier === 'budget' && 'Value'}
                      {tier === 'balanced' && 'Balanced'}
                      {tier === 'gourmet' && 'Artisanal'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-2">
                Dietary Directives & Inclusions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DIETARY_OPTIONS.map(opt => {
                  const isSelected = dietaryRestrictions.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleDietary(opt)}
                      className={`px-2.5 py-1 text-[10px] font-sans uppercase tracking-wider font-semibold border transition-all ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-[#FDFCFB] text-black/60 border-black/15 hover:border-black'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vibe & Catering */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                  Atmosphere
                </label>
                <select
                  value={vibe}
                  onChange={e => setVibe(e.target.value)}
                  className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
                >
                  {VIBE_OPTIONS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                  Culinary Sourcing
                </label>
                <select
                  value={cateringStyle}
                  onChange={e => setCateringStyle(e.target.value as CateringStyle)}
                  className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
                >
                  <option value="hybrid_prep">Hybrid (Mix of Scratch & Ready-Made)</option>
                  <option value="cook_diy">100% Home Cook / Chef Prep</option>
                  <option value="ready_made_cater">Ready-Made Platters & Curated Deli</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                Special Directives or Custom Requisitions (Optional)
              </label>
              <textarea
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Include Aperol Spritz bar, need disposable bamboo plates, one guest has severe peanut allergy."
                className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black placeholder-black/30 focus:outline-none focus:border-black font-sans resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3.5 px-4 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Agent is Calculating Ratios & Building Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Procurement Blueprint</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

