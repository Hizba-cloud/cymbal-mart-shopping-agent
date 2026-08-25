import React, { useState } from 'react';
import { useParty } from '../context/PartyContext';
import { ItemCategory, StoreCategory, ItemPriority } from '../types/party';
import { DIETARY_OPTIONS } from '../data/partyPresets';
import { 
  Plus, 
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AddItemModal: React.FC = () => {
  const { isAddItemModalOpen, setIsAddItemModalOpen, addItem } = useParty();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('food_catering');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pack');
  const [estimatedPrice, setEstimatedPrice] = useState(7.99);
  const [storeCategory, setStoreCategory] = useState<StoreCategory>('grocery');
  const [priority, setPriority] = useState<ItemPriority>('recommended');
  const [dietaryBadges, setDietaryBadges] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  if (!isAddItemModalOpen) return null;

  const toggleBadge = (badge: string) => {
    setDietaryBadges(prev =>
      prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addItem({
      name: name.trim(),
      category,
      quantity: Math.max(1, quantity),
      unit: unit.trim() || 'unit',
      quantityMath: 'Manually added by host',
      estimatedPrice: Math.max(0, estimatedPrice),
      storeCategory,
      dietaryBadges,
      priority,
      notes: notes.trim(),
    });

    setIsAddItemModalOpen(false);
    setName('');
    setNotes('');
    setDietaryBadges([]);
    try {
      confetti({ particleCount: 25, spread: 45 });
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white border border-black/20 p-6 sm:p-8 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">Custom Requisition</span>
            <h3 className="font-serif text-xl italic font-normal text-black mt-0.5">Append Item to Manifest</h3>
          </div>

          <button
            onClick={() => setIsAddItemModalOpen(false)}
            className="text-black/40 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
              Item Designation
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sourdough Baguettes, Prosecco, Taper Candles"
              className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black placeholder-black/30 focus:outline-none focus:border-black font-sans"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                Department
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ItemCategory)}
                className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
              >
                <option value="beverages">🍸 Beverages & Spirits</option>
                <option value="food_catering">🍕 Provisions & Catering</option>
                <option value="tableware_essentials">🍽️ Tableware & Service</option>
                <option value="decor_theme">🎨 Decor & Atmosphere</option>
                <option value="entertainment_favors">🎲 Games & Favors</option>
                <option value="ice_perishables">🧊 Ice & Cold Storage</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                Sourcing Vendor
              </label>
              <select
                value={storeCategory}
                onChange={e => setStoreCategory(e.target.value as StoreCategory)}
                className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
              >
                <option value="grocery">🛒 Supermarket</option>
                <option value="wholesale">📦 Wholesale Depot</option>
                <option value="liquor">🍾 Wine & Spirits</option>
                <option value="party_store">🎈 Party Supply</option>
                <option value="specialty">✨ Specialty Artisan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black font-mono font-bold focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="pack, btls, lbs"
                className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black font-sans focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
                Est. Price ($)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={estimatedPrice}
                onChange={e => setEstimatedPrice(Number(e.target.value))}
                className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black font-mono font-bold focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Dietary Badges */}
          <div>
            <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
              Dietary Attributes (Optional)
            </label>
            <div className="flex flex-wrap gap-1">
              {DIETARY_OPTIONS.map(badge => {
                const isSelected = dietaryBadges.includes(badge);
                return (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => toggleBadge(badge)}
                    className={`px-2 py-0.5 text-[9px] font-sans uppercase tracking-wider font-semibold border transition-all ${
                      isSelected
                        ? 'bg-black text-white border-black'
                        : 'bg-[#FDFCFB] text-black/60 border-black/15 hover:border-black'
                    }`}
                  >
                    {badge}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-sans uppercase tracking-widest font-semibold text-black/60 mb-1.5">
              Annotations or Specific Brand (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Look for organic sourdough / gluten-free label"
              className="w-full bg-[#FDFCFB] border border-black/15 px-3 py-2 text-xs text-black placeholder-black/30 focus:outline-none focus:border-black font-sans"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item to Master Ledger</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

