import React from 'react';
import { PartyProvider, useParty } from './context/PartyContext';
import { VoiceProvider, useVoice } from './context/VoiceContext';
import { Header } from './components/Header';
import { VoiceControlBar } from './components/VoiceControlBar';
import { VoiceAssistModal } from './components/VoiceAssistModal';
import { BlueprintView } from './components/BlueprintView';
import { ShoppingListView } from './components/ShoppingListView';
import { StoreRoutesView } from './components/StoreRoutesView';
import { RecipesView } from './components/RecipesView';
import { TimelineView } from './components/TimelineView';
import { PartyWizardModal } from './components/PartyWizardModal';
import { AgentChatDrawer } from './components/AgentChatDrawer';
import { DietarySwapModal } from './components/DietarySwapModal';
import { BudgetOptimizerModal } from './components/BudgetOptimizerModal';
import { ExportModal } from './components/ExportModal';
import { AddItemModal } from './components/AddItemModal';
import { CymbalCheckoutModal } from './components/CymbalCheckoutModal';
import { Mic, MicOff, Bot } from 'lucide-react';

function MainContent() {
  const { activeTab, currentPlan, isGenerating } = useParty();

  if (isGenerating && !currentPlan) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
        <div className="w-12 h-12 rounded-full border border-black/15 flex items-center justify-center text-black bg-white shadow-xs">
          <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="space-y-2 max-w-md">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-medium">Curating Manifest</p>
          <h2 className="text-3xl font-serif font-normal text-black tracking-tight italic">
            Formulating Party Blueprint...
          </h2>
          <p className="text-xs text-black/60 leading-relaxed font-sans">
            Calculating exact consumption ratios, food portions, allergen accommodations, and boutique store itineraries.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {activeTab === 'blueprint' && <BlueprintView />}
      {activeTab === 'shopping_list' && <ShoppingListView />}
      {activeTab === 'store_routes' && <StoreRoutesView />}
      {activeTab === 'recipes' && <RecipesView />}
      {activeTab === 'timeline' && <TimelineView />}
    </main>
  );
}

export default function App() {
  return (
    <PartyProvider>
      <VoiceProvider>
        <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] antialiased selection:bg-black selection:text-white flex flex-col font-sans">
          <Header />
          <VoiceControlBar />
          
          <div className="flex-1">
            <MainContent />
          </div>

          {/* Editorial Footer */}
          <footer className="mt-16 border-t border-black/10 bg-[#F8F7F4] px-4 sm:px-8 lg:px-12 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-black/60 font-medium">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm italic font-bold tracking-normal text-black">cymbalmart.</span>
              <span>Party Planner Shopping Agent</span>
            </div>
            <div className="flex items-center gap-6">
              <span>Store Supercenter #1042</span>
              <span>Hands-Free Voice Enabled</span>
              <span>Curbside & Local Delivery</span>
            </div>
          </footer>

          {/* Global Modals & Drawers */}
          <PartyWizardModal />
          <AgentChatDrawer />
          <DietarySwapModal />
          <BudgetOptimizerModal />
          <ExportModal />
          <AddItemModal />
          <CymbalCheckoutModal />
          <VoiceAssistModal />

          {/* Floating CymbalMart Assistant & Voice FAB */}
          <FloatingAssistantButton />
        </div>
      </VoiceProvider>
    </PartyProvider>
  );
}

function FloatingAssistantButton() {
  const { setIsChatDrawerOpen, currentPlan } = useParty();
  const { isListening, toggleListening, setIsVoiceModalOpen } = useVoice();
  const totalCost = currentPlan?.totalEstimatedCost || 0;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      {/* Quick Hands-free Mic Toggle */}
      <button
        onClick={toggleListening}
        className={`p-3 rounded-full transition-all shadow-lg border ${
          isListening
            ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
            : 'bg-white border-black/20 text-black hover:bg-neutral-100'
        }`}
        title={isListening ? 'Hands-Free Voice Active (Click to Pause)' : 'Click to Enable Hands-Free Voice Control'}
      >
        {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      </button>

      {/* Main Assistant Button */}
      <button
        onClick={() => setIsChatDrawerOpen(true)}
        className="flex items-center gap-2.5 px-4 py-2.5 bg-black text-white hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl border border-white/20 text-xs font-sans font-medium tracking-wide group"
        title="Open CymbalMart Assistant to update shopping list and recalculate budget"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-serif italic font-bold text-sm tracking-normal">CymbalMart Assistant</span>
        <span className="hidden sm:inline opacity-40 font-sans">•</span>
        <span className="hidden sm:inline text-[11px] font-mono opacity-80">${totalCost.toFixed(0)} Manifest</span>
      </button>
    </div>
  );
}


