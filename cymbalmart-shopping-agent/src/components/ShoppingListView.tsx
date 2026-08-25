import React, { useState } from 'react';
import { useParty } from '../context/PartyContext';
import { useVoice } from '../context/VoiceContext';
import { ShoppingItem, BrandTier } from '../types/party';
import { 
  Check, 
  Plus, 
  Search, 
  Trash2, 
  Sparkles, 
  Calculator, 
  ArrowRightLeft, 
  DollarSign, 
  CheckSquare,
  Square,
  ShoppingBag,
  Store,
  Tag,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Percent,
  SlidersHorizontal,
  ArrowRight,
  Bot,
  Mic,
  MicOff
} from 'lucide-react';

export const ShoppingListView: React.FC = () => {
  const { 
    currentPlan, 
    toggleItemBought, 
    updateItemQuantity, 
    updateItemPrice, 
    deleteItem, 
    setIsAddItemModalOpen, 
    setIsDietaryModalOpen, 
    setDietarySwapTargetItem,
    setIsCheckoutModalOpen,
    setIsBudgetModalOpen,
    alignAllItemsToStoreBrand,
    inStoreMode,
    setInStoreMode,
    checkAllItems,
    clearPurchases,
    setIsChatDrawerOpen
  } = useParty();

  const {
    isListening,
    toggleListening,
    setIsVoiceModalOpen,
  } = useVoice();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrandTier, setSelectedBrandTier] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [expandedMathItemId, setExpandedMathItemId] = useState<string | null>(null);
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  if (!currentPlan) return null;

  const { items, profile, totalEstimatedCost, budgetStatus } = currentPlan;
  const targetBudget = profile.budgetTotal;
  const isOverBudget = totalEstimatedCost > targetBudget;
  const budgetDiff = Math.abs(targetBudget - totalEstimatedCost);
  const costPerGuest = Number((totalEstimatedCost / Math.max(1, profile.adultsCount + profile.kidsCount)).toFixed(2));

  // Filter logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.aisle && item.aisle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesBrand = selectedBrandTier === 'all' || (item.brandTier || 'cymbal_choice') === selectedBrandTier;
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesBrand && matchesPriority;
  });

  const boughtItems = items.filter(i => i.isBought);
  const boughtCount = boughtItems.length;
  const totalItems = items.length;
  const boughtTotalCost = boughtItems.reduce((s, i) => s + (i.estimatedPrice * (i.quantity || 1)), 0);
  const remainingCost = totalEstimatedCost - boughtTotalCost;

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Aisles', icon: '✦' },
    { id: 'beverages', label: 'Beverages & Seltzers', icon: '🍸' },
    { id: 'food_catering', label: 'Butcher, Deli & Produce', icon: '🍕' },
    { id: 'tableware_essentials', label: 'Eco Tableware & Paper', icon: '🍽️' },
    { id: 'decor_theme', label: 'Ambiance & Decor', icon: '🎨' },
    { id: 'entertainment_favors', label: 'Games & Favors', icon: '🎲' },
    { id: 'ice_perishables', label: 'Cold Vault & Ice', icon: '🧊' },
  ];

  const handleStartPriceEdit = (item: ShoppingItem) => {
    setEditingPriceItemId(item.id);
    setTempPrice(item.estimatedPrice.toString());
  };

  const handleSavePrice = (item: ShoppingItem) => {
    const val = parseFloat(tempPrice);
    if (!isNaN(val) && val >= 0) {
      updateItemPrice(item.id, val);
    }
    setEditingPriceItemId(null);
  };

  const handleOpenDietarySwap = (item: ShoppingItem) => {
    setDietarySwapTargetItem(item);
    setIsDietaryModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-28">
      
      {/* CUJ Task 2: Budget Alignment & Host Status Banner */}
      <div className={`p-5 sm:p-6 border transition-all ${
        isOverBudget 
          ? 'bg-rose-50/70 border-rose-200' 
          : 'bg-[#FAF9F6] border-black/15'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isOverBudget ? (
                <span className="flex items-center gap-1 text-[10px] font-sans uppercase tracking-widest font-bold text-rose-800 bg-rose-100 px-2 py-0.5 border border-rose-200">
                  <AlertCircle className="w-3 h-3" /> Budget Exceeded by ${budgetDiff.toFixed(2)}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-sans uppercase tracking-widest font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> ✓ Aligned to Target Budget (${budgetDiff.toFixed(2)} Remaining)
                </span>
              )}
              <span className="text-[10px] font-mono text-black/60 font-semibold">
                ~${costPerGuest} / Guest ({profile.adultsCount + profile.kidsCount} guests)
              </span>
            </div>

            <h2 className="font-serif italic text-xl sm:text-2xl text-black font-normal">
              {isOverBudget 
                ? `Align Manifest to Your $${targetBudget} Target Budget`
                : `Party Manifest in Budget Harmony for ${profile.name}`}
            </h2>
            <p className="text-xs text-black/70 font-sans">
              {isOverBudget
                ? `You are currently $${budgetDiff.toFixed(2)} over budget. Switch items to Cymbal Choice store brands or adjust package quantities to bring it into balance.`
                : `Estimated total of $${totalEstimatedCost.toFixed(2)} fits your $${targetBudget} ceiling. Ready for curbside staging or local delivery.`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isOverBudget ? (
              <button
                onClick={alignAllItemsToStoreBrand}
                className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 transition-all shadow-xs"
                title="Converts items to Cymbal Choice value brand to save ~20%"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Align to Budget</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCheckoutModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 transition-all shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="px-3.5 py-2 text-[11px] font-sans uppercase tracking-widest font-medium border border-black/20 hover:border-black bg-white text-black transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3 inline mr-1" />
              <span>Optimizer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manifest Controls Header */}
      <div className="bg-white border border-black/10 p-5 sm:p-7 space-y-5 shadow-xs">
        
        {/* Row 1: Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">
                CymbalMart Catalog Manifest
              </span>
              <span className="text-[10px] px-2 py-0.5 font-mono font-bold bg-[#F4F1EA] text-black border border-black/10">
                {boughtCount}/{totalItems} Checked
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal italic text-black tracking-tight mt-1">
              Curated Grocery & Party Shopping List
            </h1>
            <p className="text-xs text-black/60 font-sans mt-0.5">
              Organized by CymbalMart Supercenter #1042 store aisles with real-time portion math and dietary tags.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              onClick={toggleListening}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-sans uppercase tracking-widest font-semibold border transition-all ${
                isListening
                  ? 'bg-rose-600 border-rose-600 text-white animate-pulse'
                  : 'bg-transparent text-black border-black/20 hover:border-black'
              }`}
              title={isListening ? 'Hands-Free Voice Active (Click to Pause)' : 'Enable Hands-Free Voice Control'}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isListening ? 'Voice Active' : 'Voice Control'}</span>
            </button>

            <button
              onClick={() => setInStoreMode(!inStoreMode)}
              className={`flex items-center gap-2 px-3.5 py-2 text-[11px] font-sans uppercase tracking-widest font-semibold border transition-all ${
                inStoreMode
                  ? 'bg-black text-white border-black'
                  : 'bg-transparent text-black border-black/20 hover:border-black'
              }`}
            >
              {inStoreMode ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              <span>In-Store Walk</span>
            </button>

            <button
              onClick={() => setIsChatDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-sans uppercase tracking-widest font-semibold bg-[#FAF9F6] hover:bg-black/5 text-black border border-black/25 hover:border-black transition-colors shadow-xs"
              title="Ask CymbalMart Assistant to update list items or recalculate budget"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            </button>

            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search, Brand Tier Filter, and Priority Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-black/40 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search item, aisle, or ingredient..."
              className="w-full bg-[#FDFCFB] border border-black/15 rounded-none pl-9 pr-3 py-2 text-xs text-black placeholder-black/40 focus:outline-none focus:border-black font-sans"
            />
          </div>

          {/* Brand Tier Filter */}
          <div>
            <select
              value={selectedBrandTier}
              onChange={e => setSelectedBrandTier(e.target.value)}
              className="w-full bg-[#FDFCFB] border border-black/15 rounded-none px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
            >
              <option value="all">All Brand Tiers</option>
              <option value="cymbal_choice">✦ Cymbal Choice (Value Staples)</option>
              <option value="cymbal_reserve">★ Cymbal Reserve (Artisan Gourmet)</option>
              <option value="national_brand">National Brand Brands</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="w-full bg-[#FDFCFB] border border-black/15 rounded-none px-3 py-2 text-xs text-black focus:outline-none focus:border-black font-sans"
            >
              <option value="all">All Priorities</option>
              <option value="must_have">Must-Have Essentials Only</option>
              <option value="recommended">Recommended Items</option>
              <option value="nice_to_have">Nice-to-Have Treats</option>
            </select>
          </div>

        </div>

        {/* Row 3: Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => {
            const count = cat.id === 'all' 
              ? items.length 
              : items.filter(i => i.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-sans uppercase tracking-wider font-semibold whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black/60 border-black/10 hover:border-black/30'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1 py-0.1 font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-black/70'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Progress Bar & Quick Bulk Actions */}
      <div className="flex items-center justify-between px-2 text-xs text-black/60 font-sans">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-black">{boughtCount} of {totalItems} items packed</span>
          <span className="opacity-30">•</span>
          <span>${boughtTotalCost.toFixed(2)} packed</span>
          <span className="opacity-30">•</span>
          <span>${remainingCost.toFixed(2)} to go</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-sans uppercase tracking-wider">
          <button
            onClick={checkAllItems}
            className="hover:text-black font-semibold transition-colors border-b border-black/30 hover:border-black pb-0.5"
          >
            Check All
          </button>
          <button
            onClick={clearPurchases}
            className="hover:text-rose-700 font-semibold transition-colors border-b border-rose-200 hover:border-rose-700 pb-0.5"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Item List / Cards */}
      {filteredItems.length === 0 ? (
        <div className="p-16 text-center bg-white border border-black/10 space-y-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/40 font-bold">Zero Matches</p>
          <h3 className="font-serif text-2xl italic text-black">No items matching criteria</h3>
          <p className="text-xs text-black/60 max-w-sm mx-auto font-sans">
            Try adjusting your search query, brand tier, or aisle category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedBrandTier('all');
              setSelectedPriority('all');
            }}
            className="text-[11px] font-sans uppercase tracking-widest font-semibold text-black border-b border-black pb-0.5 hover:opacity-70"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, idx) => {
            const isExpandedMath = expandedMathItemId === item.id;
            const isEditingPrice = editingPriceItemId === item.id;
            const brandTier = item.brandTier || 'cymbal_choice';

            return (
              <div
                key={item.id}
                className={`group relative bg-white border transition-all duration-150 ${
                  item.isBought
                    ? 'border-black/5 bg-[#FAF9F6] opacity-60'
                    : inStoreMode
                    ? 'border-black/20 p-5 shadow-xs'
                    : 'border-black/10 hover:border-black/30 p-4'
                }`}
              >
                <div className="flex items-start sm:items-center justify-between gap-4">
                  
                  {/* Left: Checkbox & Name & Aisle */}
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => toggleItemBought(item.id)}
                      className={`mt-0.5 sm:mt-0 w-6 h-6 rounded-none flex items-center justify-center border transition-all shrink-0 ${
                        item.isBought
                          ? 'bg-black border-black text-white'
                          : 'border-black/30 bg-white hover:border-black text-transparent'
                      }`}
                      title={item.isBought ? 'Mark as needed' : 'Mark as checked'}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] text-black/40">
                          {String(idx + 1).padStart(2, '0')}
                        </span>

                        <span className={`text-sm font-semibold tracking-tight transition-colors ${
                          item.isBought ? 'line-through text-black/40' : 'text-black'
                        }`}>
                          {item.name}
                        </span>

                        {/* Aisle Badge */}
                        {item.aisle && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-[#FAF9F6] text-black border border-black/15 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-black/60" />
                            <span>{item.aisle}</span>
                          </span>
                        )}

                        {/* Brand Tier Pill */}
                        {brandTier === 'cymbal_choice' && (
                          <span className="text-[9px] font-sans uppercase tracking-wider font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200">
                            ✦ Cymbal Choice
                          </span>
                        )}
                        {brandTier === 'cymbal_reserve' && (
                          <span className="text-[9px] font-sans uppercase tracking-wider font-bold px-1.5 py-0.5 bg-neutral-900 text-white">
                            ★ Cymbal Reserve
                          </span>
                        )}

                        {/* Priority tag */}
                        {item.priority === 'must_have' && (
                          <span className="text-[9px] font-sans uppercase tracking-widest font-bold px-1.5 py-0.5 bg-[#F4F1EA] text-black border border-black/10">
                            Must-Have
                          </span>
                        )}

                        {/* Member Savings badge */}
                        {(item.memberSavings || 0) > 0 && (
                          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-emerald-100 text-emerald-900 flex items-center gap-0.5">
                            <Percent className="w-2.5 h-2.5" /> Save ${item.memberSavings?.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Notes / Brand suggestion */}
                      {(item.notes || item.brandSuggestion) && (
                        <p className="text-xs text-black/60 mt-1 line-clamp-1 font-sans">
                          {item.brandSuggestion && <strong className="text-black/80 font-medium">{item.brandSuggestion} — </strong>}
                          {item.notes}
                        </p>
                      )}

                      {/* Dietary Badges */}
                      {item.dietaryBadges && item.dietaryBadges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.dietaryBadges.map(badge => (
                            <span key={badge} className="text-[9px] font-sans uppercase tracking-wider font-semibold px-1.5 py-0.2 bg-[#F8F7F4] text-black border border-black/10">
                              {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Quantity Stepper, Price & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    
                    {/* Quantity Stepper */}
                    <div className="flex items-center bg-[#F8F7F4] border border-black/10 p-0.5">
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/5 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-black min-w-10 text-center">
                        {item.quantity} <span className="text-[10px] font-sans font-normal text-black/50 truncate max-w-12 inline-block align-bottom">{item.unit}</span>
                      </span>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/5 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Price Tally */}
                    <div className="text-right min-w-16">
                      {isEditingPrice ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-black/40">$</span>
                          <input
                            type="number"
                            step="0.5"
                            value={tempPrice}
                            onChange={e => setTempPrice(e.target.value)}
                            onBlur={() => handleSavePrice(item)}
                            onKeyDown={e => e.key === 'Enter' && handleSavePrice(item)}
                            autoFocus
                            className="w-14 bg-white border border-black px-1 py-0.5 text-xs text-black font-mono text-right"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartPriceEdit(item)}
                          className="group/price text-right hover:opacity-75 transition-opacity"
                          title="Click to edit unit price"
                        >
                          <div className="text-xs font-mono font-bold text-black">
                            ${(item.estimatedPrice * (item.quantity || 1)).toFixed(2)}
                          </div>
                          <div className="text-[10px] font-sans text-black/40">
                            ${item.estimatedPrice.toFixed(2)}/{item.unit}
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Math Explanation Trigger */}
                    {item.quantityMath && (
                      <button
                        onClick={() => setExpandedMathItemId(isExpandedMath ? null : item.id)}
                        className={`p-2 border transition-colors ${
                          isExpandedMath
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black/50 border-black/10 hover:border-black/30'
                        }`}
                        title="View consumption formula"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Dietary Swap Trigger */}
                    <button
                      onClick={() => handleOpenDietarySwap(item)}
                      className="p-2 bg-white text-black/50 border border-black/10 hover:border-black/30 hover:text-black transition-colors"
                      title="Generate dietary / allergen alternative"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Item */}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 bg-white text-black/40 border border-black/10 hover:text-rose-700 hover:border-rose-300 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>
                </div>

                {/* Expandable Quantity Math Drawer */}
                {isExpandedMath && (
                  <div className="mt-3 pt-3 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-[#F8F7F4] p-3 gap-2">
                    <div className="flex items-center gap-2 text-black">
                      <Calculator className="w-3.5 h-3.5 shrink-0 text-black/50" />
                      <span className="font-semibold font-sans text-[11px] uppercase tracking-wider">Consumption Math:</span>
                      <span className="text-black font-mono font-medium">{item.quantityMath}</span>
                    </div>
                    <span className="text-[10px] font-sans uppercase tracking-widest text-black/40">Includes 15% safety buffer</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#FDFCFB]/95 border-t border-black/10 backdrop-blur-md py-3.5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-black/15 flex items-center justify-center text-black bg-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-sans font-semibold text-black flex items-center gap-2">
                <span>{boughtCount} of {totalItems} Packed</span>
                <span className="opacity-30">•</span>
                <span className="font-mono font-bold">${boughtTotalCost.toFixed(2)}</span>
                <span className="text-black/50">/ ${totalEstimatedCost.toFixed(2)} Total</span>
              </div>
              <p className="text-[10px] font-sans uppercase tracking-wider text-black/50">
                Target Budget: ${targetBudget.toFixed(2)} ({budgetStatus.difference >= 0 ? `$${budgetStatus.difference.toFixed(2)} under` : `$${Math.abs(budgetStatus.difference).toFixed(2)} over`})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="px-3.5 py-2 text-[11px] font-sans uppercase tracking-widest font-medium bg-transparent text-black border border-black/20 hover:border-black flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>

            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              className="px-4 py-2 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Finalize & Checkout</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

