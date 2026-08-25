// Web Speech API Voice Recognition & Synthesis Service for CymbalMart

export interface VoiceCommandMatch {
  action: 
    | 'navigate_tab'
    | 'check_item'
    | 'uncheck_item'
    | 'check_all'
    | 'add_item'
    | 'remove_item'
    | 'update_quantity'
    | 'update_budget'
    | 'align_store_brand'
    | 'open_checkout'
    | 'select_fulfillment'
    | 'confirm_order'
    | 'close_modal'
    | 'open_assistant'
    | 'query_budget'
    | 'query_cost_per_guest'
    | 'read_aisle_items'
    | 'unknown_ai_query';
  params?: Record<string, any>;
  spokenFeedback?: string;
}

// Web Audio API Audio Cues
class SoundFX {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playWake() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (_) {}
  }

  playConfirm() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch (_) {}
  }

  playError() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (_) {}
  }
}

export const soundFX = new SoundFX();

// Speech Synthesis (TTS) Helper
export function speakText(text: string, onEnd?: () => void): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  
  window.speechSynthesis.cancel(); // Stop any pending speech
  
  const cleanText = text.replace(/[*_#`~]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  // Try selecting a natural sounding English voice
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => 
    (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen') || v.lang.startsWith('en')) &&
    !v.name.includes('Bad')
  );
  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Spoken Command Classifier & Parser
export function parseVoiceCommand(
  rawTranscript: string,
  context: {
    items: Array<{ id: string; name: string; isBought: boolean; estimatedPrice: number; quantity: number }>;
    totalEstimatedCost: number;
    budgetTotal: number;
    guestCount: number;
    activeTab: string;
  }
): VoiceCommandMatch {
  const text = rawTranscript.trim().toLowerCase();

  // 1. Navigation Commands
  if (text.includes('shopping list') || text.includes('manifest') || text.includes('items list') || text.includes('grocery list')) {
    return {
      action: 'navigate_tab',
      params: { tab: 'shopping_list' },
      spokenFeedback: 'Navigating to your shopping manifest.',
    };
  }

  if (text.includes('aisle') || text.includes('aisles') || text.includes('route') || text.includes('store map') || text.includes('walkthrough')) {
    return {
      action: 'navigate_tab',
      params: { tab: 'store_routes' },
      spokenFeedback: 'Opening CymbalMart Supercenter aisle routes.',
    };
  }

  if (text.includes('recipe') || text.includes('recipes') || text.includes('cocktail') || text.includes('bar') || text.includes('batch')) {
    return {
      action: 'navigate_tab',
      params: { tab: 'recipes' },
      spokenFeedback: 'Opening batch cocktail and culinary recipes.',
    };
  }

  if (text.includes('timeline') || text.includes('countdown') || text.includes('schedule') || text.includes('prep list')) {
    return {
      action: 'navigate_tab',
      params: { tab: 'timeline' },
      spokenFeedback: 'Opening event timeline and countdown prep checklist.',
    };
  }

  if (text.includes('blueprint') || text.includes('overview') || text.includes('briefing') || text.includes('summary')) {
    return {
      action: 'navigate_tab',
      params: { tab: 'blueprint' },
      spokenFeedback: 'Opening party blueprint and host briefing.',
    };
  }

  if (text.includes('open assistant') || text.includes('talk to assistant') || text.includes('open chat') || text.includes('ask assistant')) {
    return {
      action: 'open_assistant',
      spokenFeedback: 'Opening CymbalMart Assistant.',
    };
  }

  // 2. Checkout & Fulfillment Commands
  if (text.includes('checkout') || text.includes('proceed to checkout') || text.includes('buy order') || text.includes('fulfill')) {
    return {
      action: 'open_checkout',
      spokenFeedback: 'Opening CymbalMart Curbside and Delivery Checkout.',
    };
  }

  if (text.includes('select curbside') || text.includes('curbside pickup') || text.includes('pick up at store')) {
    return {
      action: 'select_fulfillment',
      params: { fulfillment: 'curbside_pickup' },
      spokenFeedback: 'Selected CymbalMart Supercenter Curbside Pickup at Bays 1 through 8.',
    };
  }

  if (text.includes('select delivery') || text.includes('same day delivery') || text.includes('deliver to home')) {
    return {
      action: 'select_fulfillment',
      params: { fulfillment: 'same_day_delivery' },
      spokenFeedback: 'Selected Same-Day Local Delivery.',
    };
  }

  if (text.includes('confirm order') || text.includes('place order') || text.includes('submit order') || text.includes('finalize purchase')) {
    return {
      action: 'confirm_order',
      spokenFeedback: 'Submitting your CymbalMart order now.',
    };
  }

  if (text.includes('close modal') || text.includes('close checkout') || text.includes('close dialog') || text.includes('close window') || text === 'close') {
    return {
      action: 'close_modal',
      spokenFeedback: 'Closing dialog.',
    };
  }

  // 3. Store Brand Alignment (Cymbal Choice)
  if (text.includes('store brand') || text.includes('cymbal choice') || text.includes('save money') || text.includes('align to budget') || text.includes('apply savings')) {
    return {
      action: 'align_store_brand',
      spokenFeedback: 'Aligning all manifest items to Cymbal Choice store brands to maximize your member savings.',
    };
  }

  // 4. Budget & Spending Spoken Inquiries
  if (text.includes('what is my total') || text.includes('how much') || text.includes('what is the budget') || text.includes('check budget') || text.includes('total spend')) {
    const diff = context.budgetTotal - context.totalEstimatedCost;
    const statusText = diff >= 0 
      ? `You are $${diff.toFixed(2)} under your $${context.budgetTotal.toFixed(2)} budget.`
      : `You are $${Math.abs(diff).toFixed(2)} over your $${context.budgetTotal.toFixed(2)} budget ceiling.`;
    return {
      action: 'query_budget',
      spokenFeedback: `Your manifest total is $${context.totalEstimatedCost.toFixed(2)}. ${statusText}`,
    };
  }

  if (text.includes('per guest') || text.includes('per person') || text.includes('cost per guest') || text.includes('cost per person')) {
    const perGuest = (context.totalEstimatedCost / Math.max(1, context.guestCount)).toFixed(2);
    return {
      action: 'query_cost_per_guest',
      spokenFeedback: `Estimated cost is $${perGuest} per person for your ${context.guestCount} guests.`,
    };
  }

  // 5. Update Target Budget (e.g. "set budget to 250 dollars" / "change budget to 300")
  const budgetMatch = text.match(/(?:set|change|update|make)\s+(?:the\s+)?budget\s+(?:to\s+)?\$?(\d+)/i);
  if (budgetMatch && budgetMatch[1]) {
    const newBudget = parseInt(budgetMatch[1], 10);
    return {
      action: 'update_budget',
      params: { budget: newBudget },
      spokenFeedback: `Updated your target party budget ceiling to $${newBudget}. Recalculating allocations.`,
    };
  }

  // 6. Check All Items
  if (text.includes('check all') || text.includes('pack all') || text.includes('mark all bought') || text.includes('check everything')) {
    return {
      action: 'check_all',
      spokenFeedback: 'Marked all items in your manifest as packed.',
    };
  }

  // 7. Check Off / Bought Specific Item (e.g. "check off brioche buns", "pack ice", "bought limes")
  const checkMatch = text.match(/(?:check off|check|mark|pack|bought|got)\s+(?:the\s+)?(.+)/i);
  if (checkMatch && checkMatch[1] && !text.includes('budget') && !text.includes('total') && !text.includes('assistant') && !text.includes('all')) {
    const query = checkMatch[1].trim();
    const matchedItem = context.items.find(i => 
      i.name.toLowerCase().includes(query) || query.includes(i.name.toLowerCase())
    );
    if (matchedItem) {
      return {
        action: 'check_item',
        params: { itemId: matchedItem.id, itemName: matchedItem.name },
        spokenFeedback: `Checked off ${matchedItem.name}.`,
      };
    }
  }

  // 8. Uncheck Specific Item
  const uncheckMatch = text.match(/(?:uncheck|unmark|need|still need)\s+(?:the\s+)?(.+)/i);
  if (uncheckMatch && uncheckMatch[1]) {
    const query = uncheckMatch[1].trim();
    const matchedItem = context.items.find(i => 
      i.name.toLowerCase().includes(query) || query.includes(i.name.toLowerCase())
    );
    if (matchedItem) {
      return {
        action: 'uncheck_item',
        params: { itemId: matchedItem.id, itemName: matchedItem.name },
        spokenFeedback: `Unchecked ${matchedItem.name}.`,
      };
    }
  }

  // 9. Change Item Quantity (e.g. "change burger patties quantity to 4", "set ice to 3 bags")
  const qtyMatch = text.match(/(?:change|set|update)\s+(?:the\s+)?(.+?)\s+(?:quantity\s+to|count\s+to|to)\s+(\d+)/i);
  if (qtyMatch && qtyMatch[1] && qtyMatch[2]) {
    const query = qtyMatch[1].trim();
    const newQty = parseInt(qtyMatch[2], 10);
    const matchedItem = context.items.find(i => 
      i.name.toLowerCase().includes(query) || query.includes(i.name.toLowerCase())
    );
    if (matchedItem) {
      return {
        action: 'update_quantity',
        params: { itemId: matchedItem.id, itemName: matchedItem.name, newQty },
        spokenFeedback: `Updated ${matchedItem.name} quantity to ${newQty}. Recalculating budget totals.`,
      };
    }
  }

  // 10. Delete / Remove Item (e.g. "delete craft beer", "remove guacamole")
  const removeMatch = text.match(/(?:delete|remove|drop|take off)\s+(?:the\s+)?(.+)/i);
  if (removeMatch && removeMatch[1] && !text.includes('all')) {
    const query = removeMatch[1].trim();
    const matchedItem = context.items.find(i => 
      i.name.toLowerCase().includes(query) || query.includes(i.name.toLowerCase())
    );
    if (matchedItem) {
      return {
        action: 'remove_item',
        params: { itemId: matchedItem.id, itemName: matchedItem.name },
        spokenFeedback: `Removed ${matchedItem.name} from your shopping list and updated budget totals.`,
      };
    }
  }

  // 11. Add Item to Shopping List (e.g. "add 2 bags of ice", "add vegan cheese", "add organic limes")
  const addMatch = text.match(/(?:add|include|put)\s+(?:(\d+)\s+)?(?:(packs?|bags?|bottles?|lbs?|boxes?)\s+(?:of\s+)?)?(.+)/i);
  if (addMatch && addMatch[3] && !text.includes('budget') && !text.includes('guest')) {
    const qty = parseInt(addMatch[1] || '1', 10);
    const unit = addMatch[2] || 'packs';
    const itemName = addMatch[3].trim();
    return {
      action: 'add_item',
      params: {
        name: itemName.charAt(0).toUpperCase() + itemName.slice(1),
        quantity: qty,
        unit,
        estimatedPrice: Number((qty * 4.99).toFixed(2)),
        category: itemName.toLowerCase().includes('ice') ? 'ice_perishables' 
          : itemName.toLowerCase().includes('beer') || itemName.toLowerCase().includes('wine') || itemName.toLowerCase().includes('juice') ? 'beverages'
          : itemName.toLowerCase().includes('plate') || itemName.toLowerCase().includes('cup') || itemName.toLowerCase().includes('napkin') ? 'tableware_essentials'
          : 'food_catering',
        aisle: itemName.toLowerCase().includes('ice') ? 'Aisle 7: Cold Vault & Bagged Ice' 
          : itemName.toLowerCase().includes('beverage') || itemName.toLowerCase().includes('soda') ? 'Aisle 4: Mixers, Tonics & Soda Vault'
          : 'Aisle 1: Fresh Produce & Deli Platters',
      },
      spokenFeedback: `Added ${qty} ${unit} of ${itemName} to your shopping list. Automatically recalculating your budget.`,
    };
  }

  // 12. Read Aisle items
  if (text.includes('read aisle') || text.includes('what is in this aisle') || text.includes('read items')) {
    const unbought = context.items.filter(i => !i.isBought).slice(0, 3);
    const itemNames = unbought.map(i => i.name).join(', ');
    return {
      action: 'read_aisle_items',
      spokenFeedback: unbought.length > 0 
        ? `Next items to pick up: ${itemNames}. Total remaining items: ${context.items.filter(i => !i.isBought).length}.`
        : 'All items in your manifest have been marked as packed!',
    };
  }

  // 13. Fallback: Delegate complex conversational queries to CymbalMart Assistant AI
  return {
    action: 'unknown_ai_query',
    params: { prompt: rawTranscript },
    spokenFeedback: undefined, // Let the LLM reply be spoken!
  };
}
