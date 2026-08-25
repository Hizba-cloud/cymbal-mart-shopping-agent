import React from 'react';
import { useParty, ActiveTab } from '../context/PartyContext';
import { useVoice } from '../context/VoiceContext';
import { 
  ShoppingBag, 
  Store, 
  GlassWater, 
  Clock, 
  Bot, 
  Share2, 
  Plus,
  Sliders,
  DollarSign,
  ArrowRight,
  Mic
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentPlan, 
    activeTab, 
    setActiveTab, 
    setIsWizardOpen, 
    setIsExportModalOpen, 
    setIsChatDrawerOpen,
    setIsBudgetModalOpen,
    setIsCheckoutModalOpen,
  } = useParty();

  const {
    isListening,
    toggleListening,
    setIsVoiceModalOpen,
  } = useVoice();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'blueprint', label: 'Blueprint', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'shopping_list', label: 'Shopping List', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'store_routes', label: 'Aisle Routes', icon: <Store className="w-3.5 h-3.5" /> },
    { id: 'recipes', label: 'Batch Recipes', icon: <GlassWater className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  const totalCost = currentPlan?.totalEstimatedCost || 0;
  const targetBudget = currentPlan?.profile.budgetTotal || 0;
  const isOver = totalCost > targetBudget;
  const boughtCount = currentPlan?.items.filter(i => i.isBought).length || 0;
  const totalItems = currentPlan?.items.length || 0;

  return (
    <header className="sticky top-0 z-30 bg-[#FDFCFB]/95 backdrop-blur-md border-b border-black/10 text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Zone: Exactly single text element with wordmark */}
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => setActiveTab('blueprint')}
            className="flex items-center gap-2 text-left group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
          >
            <span className="font-serif text-2xl font-black tracking-tight text-black group-hover:opacity-75 transition-opacity whitespace-nowrap">
              CYMBALMART<span className="font-normal italic text-black/60 text-lg ml-1.5 font-serif">host</span>
            </span>
          </button>

          {/* Quick budget chip in editorial parchment style */}
          {currentPlan && (
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-medium border transition-colors ${
                isOver 
                  ? 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100' 
                  : 'bg-[#F4F1EA] text-[#2C2A29] border-black/10 hover:border-black/30'
              }`}
              title="Click to view Budget Optimizer & Brand Swaps"
            >
              <DollarSign className="w-3 h-3 text-black/50" />
              <span className="font-semibold">${totalCost.toFixed(0)}</span>
              <span className="opacity-50">/ ${targetBudget}</span>
              {isOver ? (
                <span className="text-rose-700 font-bold ml-1">Over</span>
              ) : (
                <span className="text-emerald-700 font-semibold ml-1">({boughtCount}/{totalItems})</span>
              )}
            </button>
          )}
        </div>

        {/* Navigation Zone: 5 single-line tabs in editorial uppercase tracking */}
        <nav className="hidden lg:flex items-center gap-8 font-sans text-[11px] uppercase tracking-[0.2em] font-medium">
          {navItems.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-black opacity-100 font-bold border-b border-black'
                    : 'text-black/50 hover:text-black hover:opacity-90'
                }`}
              >
                <span>{tab.label}</span>
                {tab.id === 'shopping_list' && currentPlan && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    boughtCount === totalItems && totalItems > 0
                      ? 'bg-black text-white'
                      : 'bg-black/5 text-black/70'
                  }`}>
                    {boughtCount}/{totalItems}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Zone: Editorial buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggleListening}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-none text-[11px] font-sans uppercase tracking-widest font-medium border transition-colors whitespace-nowrap ${
              isListening
                ? 'bg-rose-600 border-rose-600 text-white animate-pulse'
                : 'bg-[#FAF9F6] hover:bg-black/5 text-black border-black/20 hover:border-black'
            }`}
            title={isListening ? 'Hands-Free Voice Active (Click to pause)' : 'Enable Hands-Free Voice Control'}
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isListening ? 'Listening' : 'Voice'}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-white' : 'bg-rose-500'}`} />
          </button>

          <button
            onClick={() => setIsChatDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-none text-[11px] font-sans uppercase tracking-widest font-medium bg-[#FAF9F6] hover:bg-black/5 text-black border border-black/20 hover:border-black transition-colors whitespace-nowrap"
            title="Chat with CymbalMart Assistant to update shopping list and recalculate budget"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Assistant</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="p-2 sm:px-3 sm:py-2 text-[11px] font-sans uppercase tracking-widest font-medium text-black/70 hover:text-black hover:bg-black/5 border border-transparent hover:border-black/10 transition-colors flex items-center gap-1.5"
            title="Export / Share Shopping Manifest"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Share</span>
          </button>

          <button
            onClick={() => setIsCheckoutModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs whitespace-nowrap"
            title="Fulfill order via CymbalMart Curbside Pickup or Delivery"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Checkout</span>
            <ArrowRight className="w-3 h-3 hidden sm:inline" />
          </button>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-sans uppercase tracking-widest font-medium border border-black/20 hover:border-black text-black transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Party</span>
          </button>
        </div>

      </div>

      {/* Mobile subnav */}
      <div className="lg:hidden flex items-center justify-around px-2 py-2 bg-[#F8F7F4] border-t border-black/10 overflow-x-auto text-[10px] font-sans uppercase tracking-widest">
        {navItems.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'text-black font-bold border-b border-black' 
                : 'text-black/50 hover:text-black'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};


