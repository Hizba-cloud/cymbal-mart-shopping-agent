import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PartyProfile,
  PartyPlan,
  ShoppingItem,
  SignatureRecipe,
  TimelineStep,
  AgentChatMessage,
} from '../types/party';
import { PARTY_PRESETS } from '../data/partyPresets';
import {
  generatePlanAPI,
  chatAgentAPI,
  dietarySwapAPI,
  customRecipeAPI,
  budgetOptimizerAPI,
} from '../services/partyService';
import { calculatePartyConsumption, generateDefaultPlanData } from '../utils/mathEngine';
import confetti from 'canvas-confetti';

export type ActiveTab = 'blueprint' | 'shopping_list' | 'store_routes' | 'recipes' | 'timeline' | 'agent_chat';

interface PartyContextType {
  currentPlan: PartyPlan | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isGenerating: boolean;
  chatMessages: AgentChatMessage[];
  isChatDrawerOpen: boolean;
  setIsChatDrawerOpen: (open: boolean) => void;
  isWizardOpen: boolean;
  setIsWizardOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isDietaryModalOpen: boolean;
  setIsDietaryModalOpen: (open: boolean) => void;
  dietarySwapTargetItem: ShoppingItem | null;
  setDietarySwapTargetItem: (item: ShoppingItem | null) => void;
  isBudgetModalOpen: boolean;
  setIsBudgetModalOpen: (open: boolean) => void;
  isAddItemModalOpen: boolean;
  setIsAddItemModalOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  inStoreMode: boolean;
  setInStoreMode: (mode: boolean) => void;
  
  // Actions
  createPlanFromProfile: (profile: PartyProfile) => Promise<void>;
  createPlanFromPreset: (presetId: string) => Promise<void>;
  toggleItemBought: (itemId: string) => void;
  updateItemQuantity: (itemId: string, newQty: number) => void;
  updateItemPrice: (itemId: string, newPrice: number) => void;
  deleteItem: (itemId: string) => void;
  addItem: (item: Omit<ShoppingItem, 'id' | 'isBought'>) => void;
  applyDietarySwap: (originalItemId: string, replacement: any) => void;
  toggleTimelineTask: (taskId: string) => void;
  scaleRecipeServings: (recipeId: string, newServings: number) => void;
  addCustomRecipe: (recipe: SignatureRecipe) => void;
  sendChatMessage: (text: string) => Promise<void>;
  applyMutation: (mutation: any) => void;
  clearPurchases: () => void;
  checkAllItems: () => void;
  alignAllItemsToStoreBrand: () => void;
  confirmCymbalOrder: (confirmation: any) => void;
  updateTargetBudget: (newBudget: number) => void;
}

const PartyContext = createContext<PartyContextType | undefined>(undefined);

const STORAGE_KEY = 'partycraft_active_plan_v2';
const CHAT_STORAGE_KEY = 'partycraft_chat_history_v2';

export const PartyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<PartyPlan | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('blueprint');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<AgentChatMessage[]>([]);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isDietaryModalOpen, setIsDietaryModalOpen] = useState<boolean>(false);
  const [dietarySwapTargetItem, setDietarySwapTargetItem] = useState<ShoppingItem | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [inStoreMode, setInStoreMode] = useState<boolean>(false);

  // Initialize from storage or first preset
  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem(STORAGE_KEY);
      const savedChat = localStorage.getItem(CHAT_STORAGE_KEY);

      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        setCurrentPlan(parsed);
      } else {
        // Load default preset initially
        const defaultPreset = PARTY_PRESETS[0];
        const defaultProfile: PartyProfile = {
          id: `profile-${Date.now()}`,
          name: defaultPreset.title,
          eventType: defaultPreset.eventType,
          theme: defaultPreset.theme,
          date: 'Saturday, 7:00 PM',
          time: '7:00 PM',
          locationType: 'indoor',
          adultsCount: defaultPreset.defaultAdults,
          kidsCount: defaultPreset.defaultKids,
          durationHours: defaultPreset.defaultDurationHours,
          budgetTotal: defaultPreset.defaultBudget,
          hostTier: defaultPreset.defaultTier,
          dietaryRestrictions: defaultPreset.defaultDietary,
          vibe: defaultPreset.defaultVibe,
          cateringStyle: defaultPreset.defaultCatering,
          additionalNotes: defaultPreset.notes,
        };

        const { items, consumptionMath, summary } = generateDefaultPlanData(defaultProfile);
        const total = items.reduce((s, i) => s + i.estimatedPrice * (i.quantity || 1), 0);
        
        const initialPlan: PartyPlan = {
          id: `plan-${Date.now()}`,
          profile: defaultProfile,
          summary,
          themeDescription: defaultPreset.tagline,
          consumptionMath,
          items,
          signatureRecipes: [
            {
              id: 'rec-1',
              name: 'Smoked Jalapeño & Agave Margarita (Batch)',
              type: 'cocktail',
              description: 'Pitcher-ready fresh lime, 100% blue agave tequila, orange liqueur, and smoky chili salt rims.',
              servings: defaultPreset.defaultAdults,
              ingredients: [
                { item: '100% Blue Agave Reposado Tequila', amount: '750ml bottle', inShoppingList: true },
                { item: 'Cointreau / Triple Sec', amount: '375ml bottle', inShoppingList: true },
                { item: 'Fresh Persian Limes', amount: '12 limes (juiced)', inShoppingList: true },
                { item: 'Agave Nectar', amount: '8 oz bottle', inShoppingList: true },
                { item: 'Tajín & Smoked Salt Rim', amount: '1 shaker', inShoppingList: true },
              ],
              instructions: [
                'In a 2-quart pitcher, whisk fresh lime juice with agave nectar until dissolved.',
                'Stir in tequila and orange liqueur. Keep chilled in refrigerator until party time.',
                'When serving, rim glasses with lime wheel and Tajín chili salt, fill with ice, and pour.',
              ],
              dietaryTags: ['Vegan', 'Gluten-Free'],
              prepTimeMinutes: 12,
            },
            {
              id: 'rec-2',
              name: 'Hibiscus Lime Agua Fresca (0% ABV)',
              type: 'mocktail',
              description: 'Tart, ruby-red botanical cooler steeped with dried hibiscus flowers, fresh mint, and sparkling water.',
              servings: defaultPreset.defaultAdults + defaultPreset.defaultKids,
              ingredients: [
                { item: 'Dried Flor de Jamaica (Hibiscus)', amount: '1 cup', inShoppingList: true },
                { item: 'Pure Cane Sugar or Monkfruit', amount: '1/2 cup', inShoppingList: true },
                { item: 'Sparkling Mineral Water', amount: '2 liters', inShoppingList: true },
                { item: 'Fresh Mint Sprigs', amount: '1 bunch', inShoppingList: true },
              ],
              instructions: [
                'Simmer dried hibiscus flowers in 4 cups water for 10 minutes; strain and sweeten.',
                'Pour hibiscus concentrate over ice in dispenser and top with cold sparkling water.',
                'Garnish with fresh lime slices and fragrant mint.',
              ],
              dietaryTags: ['0% ABV', 'Vegan', 'Gluten-Free'],
              prepTimeMinutes: 15,
            },
          ],
          timeline: [
            {
              id: 't-1',
              timeframe: '1_week_before',
              timeframeLabel: '1 Week Before',
              task: 'Order festive themed tableware, cocktail napkins, and paper goods.',
              category: 'shopping',
              isCompleted: false,
            },
            {
              id: 't-2',
              timeframe: '2_days_before',
              timeframeLabel: '2 Days Before',
              task: 'Buy tequila, cerveza, chips, and canned goods at grocery & liquor store.',
              category: 'shopping',
              isCompleted: false,
            },
            {
              id: 't-3',
              timeframe: '1_day_before',
              timeframeLabel: '1 Day Before (Eve)',
              task: 'Juice fresh limes, batch margarita base in pitcher, marinate taco meats.',
              category: 'prep',
              isCompleted: false,
            },
            {
              id: 't-4',
              timeframe: 'day_of_morning',
              timeframeLabel: 'Party Morning',
              task: 'Pick up 20 lbs of bagged ice and fresh warm tortillas from local bakery.',
              category: 'chilling',
              isCompleted: false,
            },
            {
              id: 't-5',
              timeframe: '2_hours_before',
              timeframeLabel: '2 Hours to Showtime',
              task: 'Set up salsa bar bowls, chill drink tubs with ice, start upbeat Latin playlist.',
              category: 'hosting',
              isCompleted: false,
            },
          ],
          totalEstimatedCost: total,
          budgetStatus: {
            targetBudget: defaultPreset.defaultBudget,
            estimatedCost: total,
            difference: Number((defaultPreset.defaultBudget - total).toFixed(2)),
            status: total <= defaultPreset.defaultBudget ? 'under' : 'over',
          },
          savingsTips: [
            'Buy tortilla chips and salsa jars in bulk club sizes for 40% cost reduction.',
            'Batch margaritas in a dispenser to avoid wasting opened single-serving mixers.',
          ],
          agentAdvice: 'Set out the tortilla chips & guacamole immediately upon guest arrival so early birds have something to graze on while the taco bar warms up!',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setCurrentPlan(initialPlan);
      }

      if (savedChat) {
        setChatMessages(JSON.parse(savedChat));
      } else {
        setChatMessages([
          {
            id: 'msg-welcome',
            role: 'agent',
            content: "👋 Welcome to CymbalMart Supercenter #1042! I am your **CymbalMart Assistant**.\n\nI can interact with you to update your shopping list in real time (add ingredients, remove items, adjust package quantities, swap brands or dietary options) and automatically recalculate your budget totals and member savings.\n\nTry asking:\n• \"Add 2 bags of ice and 3 packs of organic brioche buns\"\n• \"Remove craft beer from my list\"\n• \"Change burger patties quantity to 4\"\n• \"Switch all items to Cymbal Choice to save 20%\"\n• \"Update my target budget to $220\"",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (e) {
      console.error('Storage init error:', e);
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (currentPlan) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPlan));
    }
  }, [currentPlan]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  const recalculateBudget = (items: ShoppingItem[], targetBudget: number) => {
    const total = Number(items.reduce((s, it) => s + (it.estimatedPrice * (it.quantity || 1)), 0).toFixed(2));
    const diff = Number((targetBudget - total).toFixed(2));
    return {
      totalEstimatedCost: total,
      budgetStatus: {
        targetBudget,
        estimatedCost: total,
        difference: diff,
        status: diff >= 0 ? ('under' as const) : Math.abs(diff) < 20 ? ('on_track' as const) : ('over' as const),
      },
    };
  };

  const createPlanFromProfile = async (profile: PartyProfile) => {
    setIsGenerating(true);
    try {
      const plan = await generatePlanAPI(profile);
      setCurrentPlan(plan);
      setActiveTab('blueprint');
      setIsWizardOpen(false);
      
      // Trigger festive celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (_) {}

      // Add announcement to chat
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'agent',
          content: `🎉 I've created your comprehensive shopping blueprint for "${profile.name}" with ${plan.items.length} calculated items, ${plan.signatureRecipes.length} signature recipes, and a 5-phase timeline!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Failed to create plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const createPlanFromPreset = async (presetId: string) => {
    const preset = PARTY_PRESETS.find(p => p.id === presetId) || PARTY_PRESETS[0];
    const profile: PartyProfile = {
      id: `profile-${Date.now()}`,
      name: preset.title,
      eventType: preset.eventType,
      theme: preset.theme,
      date: 'Upcoming Weekend',
      time: '7:00 PM',
      locationType: 'indoor',
      adultsCount: preset.defaultAdults,
      kidsCount: preset.defaultKids,
      durationHours: preset.defaultDurationHours,
      budgetTotal: preset.defaultBudget,
      hostTier: preset.defaultTier,
      dietaryRestrictions: preset.defaultDietary,
      vibe: preset.defaultVibe,
      cateringStyle: preset.defaultCatering,
      additionalNotes: preset.notes,
    };
    await createPlanFromProfile(profile);
  };

  const toggleItemBought = (itemId: string) => {
    if (!currentPlan) return;
    const updatedItems = currentPlan.items.map(item =>
      item.id === itemId ? { ...item, isBought: !item.isBought } : item
    );
    const allBought = updatedItems.every(i => i.isBought);
    if (allBought && updatedItems.length > 0) {
      try {
        confetti({ particleCount: 70, spread: 80 });
      } catch (_) {}
    }
    setCurrentPlan({
      ...currentPlan,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateItemQuantity = (itemId: string, newQty: number) => {
    if (!currentPlan) return;
    const validQty = Math.max(1, newQty);
    const updatedItems = currentPlan.items.map(item =>
      item.id === itemId ? { ...item, quantity: validQty } : item
    );
    const budgetData = recalculateBudget(updatedItems, currentPlan.profile.budgetTotal);
    setCurrentPlan({
      ...currentPlan,
      items: updatedItems,
      ...budgetData,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateItemPrice = (itemId: string, newPrice: number) => {
    if (!currentPlan) return;
    const validPrice = Math.max(0, newPrice);
    const updatedItems = currentPlan.items.map(item =>
      item.id === itemId ? { ...item, estimatedPrice: validPrice } : item
    );
    const budgetData = recalculateBudget(updatedItems, currentPlan.profile.budgetTotal);
    setCurrentPlan({
      ...currentPlan,
      items: updatedItems,
      ...budgetData,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteItem = (itemId: string) => {
    if (!currentPlan) return;
    const updatedItems = currentPlan.items.filter(item => item.id !== itemId);
    const budgetData = recalculateBudget(updatedItems, currentPlan.profile.budgetTotal);
    setCurrentPlan({
      ...currentPlan,
      items: updatedItems,
      ...budgetData,
      updatedAt: new Date().toISOString(),
    });
  };

  const addItem = (newItemData: Omit<ShoppingItem, 'id' | 'isBought'>) => {
    if (!currentPlan) return;
    const newItem: ShoppingItem = {
      ...newItemData,
      id: `item-${Date.now()}`,
      isBought: false,
    };
    const updatedItems = [newItem, ...currentPlan.items];
    const budgetData = recalculateBudget(updatedItems, currentPlan.profile.budgetTotal);
    setCurrentPlan({
      ...currentPlan,
      items: updatedItems,
      ...budgetData,
      updatedAt: new Date().toISOString(),
    });
  };

  const applyDietarySwap = (originalItemId: string, replacement: any) => {
    if (!currentPlan) return;
    const updatedItems = currentPlan.items.map(item => {
      if (item.id === originalItemId) {
        return {
          ...item,
          name: replacement.alternativeName || item.name,
          estimatedPrice: replacement.estimatedPrice ?? item.estimatedPrice,
          quantity: replacement.quantity ?? item.quantity,
          unit: replacement.unit ?? item.unit,
          dietaryBadges: Array.from(new Set([...item.dietaryBadges, ...(replacement.dietaryBadges || [])])),
          notes: replacement.notes ? `${item.notes ? item.notes + ' • ' : ''}${replacement.notes}` : item.notes,
          brandSuggestion: replacement.brandSuggestion || item.brandSuggestion,
        };
      }
      return item;
    });

    const budgetData = recalculateBudget(updatedItems, currentPlan.profile.budgetTotal);
    setCurrentPlan({
      ...currentPlan,
      items: updatedItems,
      ...budgetData,
      updatedAt: new Date().toISOString(),
    });
    setIsDietaryModalOpen(false);
    setDietarySwapTargetItem(null);
  };

  const toggleTimelineTask = (taskId: string) => {
    if (!currentPlan) return;
    const updated = currentPlan.timeline.map(t =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    setCurrentPlan({
      ...currentPlan,
      timeline: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const scaleRecipeServings = (recipeId: string, newServings: number) => {
    if (!currentPlan) return;
    const safeServings = Math.max(1, newServings);
    const updatedRecipes = currentPlan.signatureRecipes.map(recipe => {
      if (recipe.id === recipeId) {
        const ratio = safeServings / (recipe.servings || 1);
        return {
          ...recipe,
          servings: safeServings,
          ingredients: recipe.ingredients.map(ing => ({
            ...ing,
            // scaling is visually indicated
          })),
        };
      }
      return recipe;
    });

    setCurrentPlan({
      ...currentPlan,
      signatureRecipes: updatedRecipes,
      updatedAt: new Date().toISOString(),
    });
  };

  const addCustomRecipe = (recipe: SignatureRecipe) => {
    if (!currentPlan) return;
    setCurrentPlan({
      ...currentPlan,
      signatureRecipes: [...currentPlan.signatureRecipes, recipe],
      updatedAt: new Date().toISOString(),
    });
  };

  const sendChatMessage = async (text: string) => {
    if (!text.trim() || !currentPlan) return;
    
    const userMsg: AgentChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);

    try {
      const { reply, planMutation } = await chatAgentAPI(text, currentPlan, chatMessages);
      
      const agentMsg: AgentChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'agent',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: planMutation ? {
          type: planMutation.type,
          payload: planMutation.payload,
          label: planMutation.label || 'Apply Suggestion',
        } : undefined,
      };

      setChatMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'agent',
          content: "I've noted that! For quick adjustments, you can also modify quantities and items in your Shopping List tab.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const applyMutation = (mutation: any) => {
    if (!currentPlan || !mutation) return;

    let updatedItems = [...currentPlan.items];
    let updatedProfile = { ...currentPlan.profile };

    if (mutation.type === 'add_items') {
      const rawList = Array.isArray(mutation.payload) 
        ? mutation.payload 
        : Array.isArray(mutation.payload?.items) 
          ? mutation.payload.items 
          : [mutation.payload];

      const newItems: ShoppingItem[] = rawList.filter(Boolean).map((it: any, idx: number) => {
        const estPrice = Number(it.estimatedPrice) || 4.99;
        const qty = Number(it.quantity) || 1;
        const brand = it.brandTier || (it.name?.toLowerCase().includes('reserve') ? 'cymbal_reserve' : 'cymbal_choice');
        const savings = brand === 'cymbal_choice' ? Number((estPrice * 0.20 * qty).toFixed(2)) : 0.50;

        return {
          id: `item-${Date.now()}-${idx}`,
          name: it.name || 'Custom Grocery Item',
          category: it.category || 'food_catering',
          quantity: qty,
          unit: it.unit || 'packs',
          quantityMath: it.quantityMath || 'Requested via CymbalMart Assistant',
          estimatedPrice: estPrice,
          aisle: it.aisle || 'Aisle 1: Fresh Produce & Deli Platters',
          brandTier: brand as any,
          brandSuggestion: it.brandSuggestion || (brand === 'cymbal_choice' ? 'Cymbal Choice Everyday Value' : 'Cymbal Selection'),
          memberSavings: savings,
          dietaryBadges: it.dietaryBadges || [],
          priority: it.priority || 'recommended',
          isBought: false,
          notes: it.notes || 'Added by CymbalMart Assistant',
        };
      });

      updatedItems = [...newItems, ...updatedItems];
    } else if (mutation.type === 'remove_items') {
      const queryStr = (mutation.payload?.query || mutation.payload?.name || '').toLowerCase();
      const namesToRemove: string[] = Array.isArray(mutation.payload?.itemNames) 
        ? mutation.payload.itemNames.map((n: string) => n.toLowerCase())
        : [];
      const idsToRemove: string[] = Array.isArray(mutation.payload?.ids) ? mutation.payload.ids : [];

      updatedItems = updatedItems.filter(item => {
        if (idsToRemove.includes(item.id)) return false;
        if (namesToRemove.some(n => item.name.toLowerCase().includes(n))) return false;
        if (queryStr && (item.name.toLowerCase().includes(queryStr) || queryStr.includes(item.name.toLowerCase()))) return false;
        return true;
      });
    } else if (mutation.type === 'adjust_quantities') {
      const updates = Array.isArray(mutation.payload?.updates) ? mutation.payload.updates : [mutation.payload];
      updatedItems = updatedItems.map(item => {
        const match = updates.find((u: any) => 
          (u.id && u.id === item.id) || 
          (u.name && item.name.toLowerCase().includes(u.name.toLowerCase()))
        );
        if (match && match.quantity) {
          return {
            ...item,
            quantity: Number(match.quantity),
            quantityMath: match.quantityMath || `Adjusted to ${match.quantity} ${item.unit} by Assistant`,
          };
        }
        return item;
      });
    } else if (mutation.type === 'update_budget') {
      const newBudget = Number(mutation.payload?.budget || mutation.payload?.budgetTotal || mutation.payload?.newBudget);
      if (newBudget && newBudget > 0) {
        updatedProfile.budgetTotal = newBudget;
      }
    } else if (mutation.type === 'align_store_brand') {
      alignAllItemsToStoreBrand();
      return;
    } else if (mutation.type === 'dietary_swap') {
      const targetName = (mutation.payload?.targetItemName || mutation.payload?.target || '').toLowerCase();
      const replacement = mutation.payload?.replacement || mutation.payload;
      if (targetName && replacement) {
        updatedItems = updatedItems.map(item => {
          if (item.name.toLowerCase().includes(targetName)) {
            return {
              ...item,
              name: replacement.name || replacement.alternativeName || item.name,
              estimatedPrice: Number(replacement.estimatedPrice) || item.estimatedPrice,
              notes: replacement.notes || item.notes,
              dietaryBadges: replacement.dietaryBadges || item.dietaryBadges,
            };
          }
          return item;
        });
      }
    }

    const budgetData = recalculateBudget(updatedItems, updatedProfile.budgetTotal);
    setCurrentPlan({
      ...currentPlan,
      profile: updatedProfile,
      items: updatedItems,
      ...budgetData,
      updatedAt: new Date().toISOString(),
    });

    try {
      confetti({ particleCount: 35, spread: 50 });
    } catch (_) {}
  };

  const clearPurchases = () => {
    if (!currentPlan) return;
    const updated = currentPlan.items.map(i => ({ ...i, isBought: false }));
    setCurrentPlan({ ...currentPlan, items: updated });
  };

  const checkAllItems = () => {
    if (!currentPlan) return;
    const updated = currentPlan.items.map(i => ({ ...i, isBought: true }));
    setCurrentPlan({ ...currentPlan, items: updated });
  };

  const alignAllItemsToStoreBrand = () => {
    if (!currentPlan) return;
    // Converts items to Cymbal Choice brand and discounts by 18-25%
    const updatedItems = currentPlan.items.map(item => {
      const discount = item.brandTier === 'cymbal_choice' ? 0.92 : 0.80;
      const newPrice = Number(Math.max(1.49, item.estimatedPrice * discount).toFixed(2));
      const newName = item.name.includes('Cymbal') ? item.name : `Cymbal Choice ${item.name}`;
      return {
        ...item,
        name: newName,
        estimatedPrice: newPrice,
        brandTier: 'cymbal_choice' as const,
        brandSuggestion: 'Cymbal Choice Value',
        memberSavings: Number(Math.max(0.50, (item.memberSavings || 1.0) * 1.2).toFixed(2)),
      };
    });

    const budgetData = recalculateBudget(updatedItems, currentPlan.profile.budgetTotal);
    setCurrentPlan({
      ...currentPlan,
      items: updatedItems,
      ...budgetData,
      updatedAt: new Date().toISOString(),
    });

    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch (_) {}
  };

  const confirmCymbalOrder = (confirmation: any) => {
    if (!currentPlan) return;
    setCurrentPlan({
      ...currentPlan,
      orderConfirmation: confirmation,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateTargetBudget = (newBudget: number) => {
    if (!currentPlan) return;
    const validBudget = Math.max(10, newBudget);
    const budgetData = recalculateBudget(currentPlan.items, validBudget);
    setCurrentPlan({
      ...currentPlan,
      profile: {
        ...currentPlan.profile,
        budgetTotal: validBudget,
      },
      ...budgetData,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <PartyContext.Provider
      value={{
        currentPlan,
        activeTab,
        setActiveTab,
        isGenerating,
        chatMessages,
        isChatDrawerOpen,
        setIsChatDrawerOpen,
        isWizardOpen,
        setIsWizardOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        isDietaryModalOpen,
        setIsDietaryModalOpen,
        dietarySwapTargetItem,
        setDietarySwapTargetItem,
        isBudgetModalOpen,
        setIsBudgetModalOpen,
        isAddItemModalOpen,
        setIsAddItemModalOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        inStoreMode,
        setInStoreMode,
        createPlanFromProfile,
        createPlanFromPreset,
        toggleItemBought,
        updateItemQuantity,
        updateItemPrice,
        deleteItem,
        addItem,
        applyDietarySwap,
        toggleTimelineTask,
        scaleRecipeServings,
        addCustomRecipe,
        sendChatMessage,
        applyMutation,
        clearPurchases,
        checkAllItems,
        alignAllItemsToStoreBrand,
        confirmCymbalOrder,
        updateTargetBudget,
      }}
    >
      {children}
    </PartyContext.Provider>
  );
};

export function useParty() {
  const context = useContext(PartyContext);
  if (!context) {
    throw new Error('useParty must be used within a PartyProvider');
  }
  return context;
}
