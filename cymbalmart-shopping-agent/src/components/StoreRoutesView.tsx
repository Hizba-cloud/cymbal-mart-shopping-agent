import React, { useState } from 'react';
import { useParty } from '../context/PartyContext';
import { useVoice } from '../context/VoiceContext';
import { ShoppingItem } from '../types/party';
import { 
  Store, 
  Copy, 
  Check, 
  MapPin, 
  ShoppingBag, 
  DollarSign, 
  Sparkles,
  Navigation,
  ArrowRight,
  Volume2,
  Mic
} from 'lucide-react';

interface AisleGroup {
  id: string;
  name: string;
  department: string;
  icon: string;
  description: string;
  proTip: string;
}

const CYMBAL_AISLES: AisleGroup[] = [
  {
    id: 'Aisle 1: Fresh Produce & Deli Platters',
    name: 'Aisle 1: Fresh Produce, Charcuterie & Deli',
    department: 'Butcher & Deli',
    icon: '🥑',
    description: 'Artisanal cheeses, prosciutto, organic citrus, avocados, dips, and fresh herbs.',
    proTip: 'Select ripe avocados for day-of guacamole and keep fresh limes and herbs refrigerated until party morning.',
  },
  {
    id: 'Aisle 2: Bakery & Fresh Breads',
    name: 'Aisle 2: Bakery & Warm Breads',
    department: 'Bakery',
    icon: '🥖',
    description: 'Brioche slider buns, warm corn tortillas, baguettes, and fresh baked cookies.',
    proTip: 'Warm tortillas on a comal or in the oven 15 minutes before guest arrival for irresistible aroma.',
  },
  {
    id: 'Aisle 3: Craft Beer & Hard Seltzers',
    name: 'Aisle 3: Craft Beer & Seltzers',
    department: 'Beverages',
    icon: '🍺',
    description: 'Chilled IPA 12-packs, sparkling hard seltzers, cider, and non-alcoholic craft brews.',
    proTip: 'Stock 2 cans per guest for the first hour and 1 can per hour thereafter with a 15% host reserve buffer.',
  },
  {
    id: 'Aisle 4: Mixers, Tonics & Soda Vault',
    name: 'Aisle 4: Mixers, Sparkling Waters & Sodas',
    department: 'Beverage Vault',
    icon: '🍸',
    description: 'Agave nectar, craft tonic waters, club soda 2L bottles, ginger beer, and fruit juices.',
    proTip: 'Always stock 1 bottle of sparkling water for every bottle of spirit for effortless highballs and spritzes.',
  },
  {
    id: 'Aisle 5: Snacks, Chips & Salsa Bar',
    name: 'Aisle 5: Snacks, Dips & Artisan Crackers',
    department: 'Pantry & Grazing',
    icon: '🥨',
    description: 'Tortilla chips, roasted salsa jars, gourmet mixed nuts, pretzels, and gourmet popcorn.',
    proTip: 'Set out chips & salsa immediately as guests arrive so early birds have something to graze on while the main spread warms up.',
  },
  {
    id: 'Aisle 6: Eco-Tableware & Party Essentials',
    name: 'Aisle 6: Tableware, Napkins & Serveware',
    department: 'Tableware',
    icon: '🍽️',
    description: 'Biodegradable bamboo plates, heavy-duty cutlery, cocktail napkins, and reusable cups.',
    proTip: 'Procure 1.5 plates, 2 cups, and 2.5 napkins per guest to avoid mid-party dish panics.',
  },
  {
    id: 'Aisle 7: Cold Vault & Bagged Ice',
    name: 'Aisle 7: Cold Vault & Bagged Ice',
    department: 'Cold Vault',
    icon: '🧊',
    description: '20 lb premium filtered party ice bags and frozen cocktail fruit garnishes.',
    proTip: 'Pick up ice as the very last step in your store route or specify Curbside Pickup 2 hours before the event.',
  },
];

export const StoreRoutesView: React.FC = () => {
  const { currentPlan, toggleItemBought, setIsCheckoutModalOpen } = useParty();
  const { speak, isListening, toggleListening } = useVoice();
  const [copiedAisleId, setCopiedAisleId] = useState<string | null>(null);

  if (!currentPlan) return null;

  const items = currentPlan.items;

  const handleSpeakAisle = (aisle: AisleGroup, aisleItems: ShoppingItem[]) => {
    const unbought = aisleItems.filter(i => !i.isBought);
    if (unbought.length === 0) {
      speak(`All items in ${aisle.name} have already been packed.`);
      return;
    }
    const readout = unbought.map(i => `${i.quantity} ${i.unit} of ${i.name}`).join(', ');
    speak(`In ${aisle.name}, you need: ${readout}.`);
  };

  const handleCopyAisleList = (aisle: AisleGroup, aisleItems: ShoppingItem[]) => {
    const header = `🛒 CymbalMart #1042 — ${aisle.name} (${currentPlan.profile.name})\nItems: ${aisleItems.length}\nSubtotal: $${aisleItems.reduce((s, i) => s + (i.estimatedPrice * (i.quantity || 1)), 0).toFixed(2)}\n\n`;
    const body = aisleItems
      .map(
        i =>
          `${i.isBought ? '[✓]' : '[ ]'} ${i.name} - ${i.quantity} ${i.unit} (~$${(i.estimatedPrice * (i.quantity || 1)).toFixed(2)})${i.notes ? ` (${i.notes})` : ''}`
      )
      .join('\n');
    
    navigator.clipboard.writeText(header + body);
    setCopiedAisleId(aisle.id);
    setTimeout(() => setCopiedAisleId(null), 2500);
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header briefing */}
      <div className="bg-white border border-black/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">In-Store Wayfinding</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F4F1EA] text-black font-semibold border border-black/10">
                Supercenter #1042
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal italic text-black tracking-tight mt-1">
              Optimized Aisle Walking Itinerary
            </h1>
            <p className="text-xs text-black/60 font-sans mt-0.5">
              Items sequenced sequentially from Aisle 1 (Produce) to Aisle 7 (Ice Vault) for a fast 15-minute store run.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 transition-all shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Or Order Curbside</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Aisles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CYMBAL_AISLES.map(aisle => {
          const aisleItems = items.filter(i => {
            if (i.aisle) {
              return i.aisle.toLowerCase().includes(aisle.name.slice(0, 7).toLowerCase()) ||
                     i.aisle.toLowerCase().includes(aisle.department.toLowerCase());
            }
            // fallback mapping based on category
            if (aisle.id.includes('Aisle 1') && i.category === 'food_catering') return true;
            if (aisle.id.includes('Aisle 3') && i.category === 'beverages') return true;
            if (aisle.id.includes('Aisle 6') && i.category === 'tableware_essentials') return true;
            if (aisle.id.includes('Aisle 7') && i.category === 'ice_perishables') return true;
            return false;
          });

          if (aisleItems.length === 0) return null;

          const aisleTotal = aisleItems.reduce((s, i) => s + (i.estimatedPrice * (i.quantity || 1)), 0);
          const aisleBoughtCount = aisleItems.filter(i => i.isBought).length;
          const isCopied = copiedAisleId === aisle.id;

          return (
            <div
              key={aisle.id}
              className="bg-white border border-black/10 p-6 flex flex-col justify-between space-y-5 hover:border-black/30 transition-colors shadow-xs"
            >
              <div>
                {/* Aisle Top Banner */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-black/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{aisle.icon}</span>
                    <div>
                      <h3 className="font-serif text-lg font-normal italic text-black">{aisle.name}</h3>
                      <p className="text-xs text-black/60 mt-0.5 font-sans">{aisle.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-black font-mono">
                      ${aisleTotal.toFixed(2)}
                    </span>
                    <div className="text-[10px] font-sans uppercase tracking-wider text-black/50 font-semibold">
                      {aisleBoughtCount}/{aisleItems.length} packed
                    </div>
                  </div>
                </div>

                {/* Host Tip */}
                <div className="mt-4 p-3 bg-[#F8F7F4] border border-black/10 text-[11px] text-black/80 flex items-start gap-2 font-sans">
                  <Sparkles className="w-3.5 h-3.5 text-black/50 shrink-0 mt-0.5" />
                  <span><strong>Host Pro-Tip:</strong> {aisle.proTip}</span>
                </div>

                {/* Item List for this aisle */}
                <div className="mt-4 space-y-2">
                  {aisleItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleItemBought(item.id)}
                      className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors border text-xs ${
                        item.isBought
                          ? 'bg-[#FAF9F6] border-black/5 text-black/40 line-through'
                          : 'bg-[#FDFCFB] border-black/10 hover:border-black/30 text-black'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-4 h-4 rounded-none flex items-center justify-center border shrink-0 ${
                          item.isBought
                            ? 'bg-black border-black text-white'
                            : 'border-black/30 bg-white text-transparent'
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div className="truncate min-w-0">
                          <span className="truncate font-medium block">{item.name}</span>
                          {item.brandTier === 'cymbal_choice' && (
                            <span className="text-[9px] font-sans text-emerald-800 uppercase tracking-wider font-semibold">✦ Cymbal Choice</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-black/60 font-mono text-[11px]">
                        <span className="font-semibold text-black">
                          {item.quantity} {item.unit}
                        </span>
                        <span className="text-black/40">
                          ${(item.estimatedPrice * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copy & Speak Aisle Buttons */}
              <div className="pt-3 border-t border-black/10 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-sans uppercase tracking-widest text-black/40">
                  {aisleItems.length} aisle items
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeakAisle(aisle, aisleItems)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-sans uppercase tracking-widest font-semibold border border-black/20 hover:border-black text-black transition-all bg-[#FAF9F6] hover:bg-black/5"
                    title="Speak items in this aisle aloud for hands-free walking"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-black/60" />
                    <span>Read Aloud</span>
                  </button>

                  <button
                    onClick={() => handleCopyAisleList(aisle, aisleItems)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-sans uppercase tracking-widest font-semibold border transition-all ${
                      isCopied
                        ? 'bg-black text-white border-black'
                        : 'bg-transparent text-black border-black/20 hover:border-black'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Aisle Copied!' : 'Copy Checklist'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};


