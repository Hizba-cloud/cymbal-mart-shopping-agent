import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useParty } from './PartyContext';
import { 
  parseVoiceCommand, 
  speakText, 
  stopSpeaking, 
  soundFX, 
  VoiceCommandMatch 
} from '../services/voiceControlService';

export interface VoiceLogEntry {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  time: string;
  actionApplied?: string;
}

interface VoiceContextType {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  isSpeaking: boolean;
  isVoiceFeedbackEnabled: boolean;
  toggleVoiceFeedback: () => void;
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;
  speak: (text: string) => void;
  lastCommand: VoiceCommandMatch | null;
  voiceLogs: VoiceLogEntry[];
  executeVoiceCommandText: (commandText: string) => Promise<void>;
  clearVoiceLogs: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const party = useParty();
  const {
    currentPlan,
    activeTab,
    setActiveTab,
    toggleItemBought,
    updateItemQuantity,
    deleteItem,
    addItem,
    alignAllItemsToStoreBrand,
    updateTargetBudget,
    checkAllItems,
    setIsCheckoutModalOpen,
    setIsChatDrawerOpen,
    sendChatMessage,
    applyMutation,
  } = party;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceFeedbackEnabled, setIsVoiceFeedbackEnabled] = useState(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [lastCommand, setLastCommand] = useState<VoiceCommandMatch | null>(null);
  const [voiceLogs, setVoiceLogs] = useState<VoiceLogEntry[]>([
    {
      id: 'v-init',
      type: 'assistant',
      text: 'Voice Control Ready. Speak commands like "Go to shopping list", "Add 2 bags of ice", "Check off brioche buns", or "What is my total?"',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const shouldKeepListeningRef = useRef(false);

  // Helper to append logs
  const addVoiceLog = useCallback((type: 'user' | 'assistant', text: string, actionApplied?: string) => {
    setVoiceLogs(prev => [
      {
        id: `vlog-${Date.now()}-${Math.random()}`,
        type,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionApplied,
      },
      ...prev.slice(0, 40), // keep latest 40 entries
    ]);
  }, []);

  // Voice speech feedback handler
  const speak = useCallback((text: string) => {
    if (!isVoiceFeedbackEnabled) return;
    setIsSpeaking(true);
    speakText(text, () => {
      setIsSpeaking(false);
    });
  }, [isVoiceFeedbackEnabled]);

  // Execute a parsed voice command
  const executeVoiceCommand = useCallback(async (cmdText: string) => {
    if (!cmdText.trim()) return;

    soundFX.playConfirm();
    addVoiceLog('user', cmdText);

    if (!currentPlan) return;

    const guestTotal = currentPlan.profile.adultsCount + currentPlan.profile.kidsCount;
    const match = parseVoiceCommand(cmdText, {
      items: currentPlan.items,
      totalEstimatedCost: currentPlan.totalEstimatedCost,
      budgetTotal: currentPlan.profile.budgetTotal,
      guestCount: guestTotal,
      activeTab,
    });

    setLastCommand(match);

    switch (match.action) {
      case 'navigate_tab':
        if (match.params?.tab) {
          setActiveTab(match.params.tab);
          if (match.spokenFeedback) {
            speak(match.spokenFeedback);
            addVoiceLog('assistant', match.spokenFeedback, `Navigated to ${match.params.tab}`);
          }
        }
        break;

      case 'check_item':
        if (match.params?.itemId) {
          toggleItemBought(match.params.itemId);
          if (match.spokenFeedback) {
            speak(match.spokenFeedback);
            addVoiceLog('assistant', match.spokenFeedback, `Checked off ${match.params.itemName}`);
          }
        }
        break;

      case 'uncheck_item':
        if (match.params?.itemId) {
          toggleItemBought(match.params.itemId);
          if (match.spokenFeedback) {
            speak(match.spokenFeedback);
            addVoiceLog('assistant', match.spokenFeedback, `Unchecked ${match.params.itemName}`);
          }
        }
        break;

      case 'check_all':
        checkAllItems();
        if (match.spokenFeedback) {
          speak(match.spokenFeedback);
          addVoiceLog('assistant', match.spokenFeedback, 'Packed all items');
        }
        break;

      case 'add_item':
        if (match.params) {
          addItem({
            name: match.params.name,
            category: match.params.category,
            quantity: match.params.quantity,
            unit: match.params.unit,
            quantityMath: 'Voice command addition',
            estimatedPrice: match.params.estimatedPrice,
            aisle: match.params.aisle,
            brandTier: 'cymbal_choice',
            brandSuggestion: 'Cymbal Choice Everyday Value',
            memberSavings: Number((match.params.estimatedPrice * 0.20).toFixed(2)),
            dietaryBadges: [],
            priority: 'recommended',
            notes: 'Added via Voice Control',
          });
          if (match.spokenFeedback) {
            speak(match.spokenFeedback);
            addVoiceLog('assistant', match.spokenFeedback, `Added ${match.params.name}`);
          }
        }
        break;

      case 'remove_item':
        if (match.params?.itemId) {
          deleteItem(match.params.itemId);
          if (match.spokenFeedback) {
            speak(match.spokenFeedback);
            addVoiceLog('assistant', match.spokenFeedback, `Removed ${match.params.itemName}`);
          }
        }
        break;

      case 'update_quantity':
        if (match.params?.itemId && match.params?.newQty) {
          updateItemQuantity(match.params.itemId, match.params.newQty);
          if (match.spokenFeedback) {
            speak(match.spokenFeedback);
            addVoiceLog('assistant', match.spokenFeedback, `Updated ${match.params.itemName} quantity to ${match.params.newQty}`);
          }
        }
        break;

      case 'align_store_brand':
        alignAllItemsToStoreBrand();
        if (match.spokenFeedback) {
          speak(match.spokenFeedback);
          addVoiceLog('assistant', match.spokenFeedback, 'Aligned items to Cymbal Choice store brand');
        }
        break;

      case 'update_budget':
        if (match.params?.budget) {
          updateTargetBudget(match.params.budget);
          if (match.spokenFeedback) {
            speak(match.spokenFeedback);
            addVoiceLog('assistant', match.spokenFeedback, `Updated target budget to $${match.params.budget}`);
          }
        }
        break;

      case 'query_budget':
      case 'query_cost_per_guest':
      case 'read_aisle_items':
        if (match.spokenFeedback) {
          speak(match.spokenFeedback);
          addVoiceLog('assistant', match.spokenFeedback, 'Voice Information Inquiry');
        }
        break;

      case 'open_checkout':
        setIsCheckoutModalOpen(true);
        if (match.spokenFeedback) {
          speak(match.spokenFeedback);
          addVoiceLog('assistant', match.spokenFeedback, 'Opened Checkout Modal');
        }
        break;

      case 'close_modal':
        setIsCheckoutModalOpen(false);
        setIsChatDrawerOpen(false);
        setIsVoiceModalOpen(false);
        if (match.spokenFeedback) {
          speak(match.spokenFeedback);
          addVoiceLog('assistant', match.spokenFeedback, 'Closed Dialog');
        }
        break;

      case 'open_assistant':
        setIsChatDrawerOpen(true);
        if (match.spokenFeedback) {
          speak(match.spokenFeedback);
          addVoiceLog('assistant', match.spokenFeedback, 'Opened CymbalMart Assistant');
        }
        break;

      case 'unknown_ai_query':
      default:
        // Stream to CymbalMart Assistant LLM
        speak('Consulting CymbalMart Assistant...');
        addVoiceLog('assistant', 'Consulting CymbalMart Assistant...', 'AI LLM Query');
        try {
          await sendChatMessage(cmdText);
          speak('I have updated your suggestions and manifest in the CymbalMart Assistant chat drawer.');
        } catch (err) {
          speak("I heard your request. You can review your shopping manifest or ask me to add ingredients.");
        }
        break;
    }
  }, [
    currentPlan,
    activeTab,
    setActiveTab,
    toggleItemBought,
    updateItemQuantity,
    deleteItem,
    addItem,
    alignAllItemsToStoreBrand,
    updateTargetBudget,
    checkAllItems,
    setIsCheckoutModalOpen,
    setIsChatDrawerOpen,
    sendChatMessage,
    speak,
    addVoiceLog,
  ]);

  // Direct programmatic execution (e.g. from cheat sheet or test button)
  const executeVoiceCommandText = useCallback(async (commandText: string) => {
    setTranscript(commandText);
    await executeVoiceCommand(commandText);
  }, [executeVoiceCommand]);

  // SpeechRecognition Initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      soundFX.playWake();
    };

    recognition.onresult = (event: any) => {
      let currentFinal = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (currentInterim) {
        setInterimTranscript(currentInterim);
      }

      if (currentFinal) {
        const finalTrimmed = currentFinal.trim();
        setTranscript(finalTrimmed);
        setInterimTranscript('');
        executeVoiceCommand(finalTrimmed);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        isListeningRef.current = false;
        shouldKeepListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      isListeningRef.current = false;
      // Auto-restart if user enabled continuous hands-free mode
      if (shouldKeepListeningRef.current) {
        try {
          recognition.start();
        } catch (_) {}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldKeepListeningRef.current = false;
      try {
        recognition.stop();
      } catch (_) {}
    };
  }, [executeVoiceCommand]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      // Fallback if not supported
      setIsVoiceModalOpen(true);
      return;
    }
    shouldKeepListeningRef.current = true;
    try {
      recognitionRef.current.start();
    } catch (_) {
      // Already running
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
    isListeningRef.current = false;
    stopSpeaking();
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Global Keyboard Shortcut (Alt+V) to toggle voice listening
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening]);

  const toggleVoiceFeedback = useCallback(() => {
    setIsVoiceFeedbackEnabled(prev => {
      const next = !prev;
      if (!next) {
        stopSpeaking();
      } else {
        speak('Voice audio feedback enabled.');
      }
      return next;
    });
  }, [speak]);

  const clearVoiceLogs = useCallback(() => {
    setVoiceLogs([]);
  }, []);

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        isSupported,
        transcript,
        interimTranscript,
        isSpeaking,
        isVoiceFeedbackEnabled,
        toggleVoiceFeedback,
        toggleListening,
        startListening,
        stopListening,
        isVoiceModalOpen,
        setIsVoiceModalOpen,
        speak,
        lastCommand,
        voiceLogs,
        executeVoiceCommandText,
        clearVoiceLogs,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
