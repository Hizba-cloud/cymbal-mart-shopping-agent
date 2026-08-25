export type HostTier = 'budget' | 'balanced' | 'gourmet';
export type CateringStyle = 'cook_diy' | 'hybrid_prep' | 'ready_made_cater';
export type LocationType = 'indoor' | 'outdoor' | 'hybrid';
export type BrandTier = 'cymbal_choice' | 'cymbal_reserve' | 'national_brand';
export type FulfillmentType = 'curbside_pickup' | 'same_day_delivery' | 'instore_smart_route';

export type ItemCategory = 
  | 'beverages'
  | 'food_catering'
  | 'tableware_essentials'
  | 'decor_theme'
  | 'entertainment_favors'
  | 'ice_perishables';

export type StoreCategory = 
  | 'grocery'
  | 'wholesale'
  | 'liquor'
  | 'party_store'
  | 'specialty';

export type ItemPriority = 'must_have' | 'recommended' | 'nice_to_have';

export interface ShoppingItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  quantityMath: string;
  estimatedPrice: number;
  storeCategory: StoreCategory;
  dietaryBadges: string[];
  priority: ItemPriority;
  isBought: boolean;
  notes?: string;
  substitutionSuggestion?: string;
  brandSuggestion?: string;
  aisle?: string;
  brandTier?: BrandTier;
  memberSavings?: number;
  inStock?: boolean;
}

export interface RecipeIngredient {
  item: string;
  amount: string;
  inShoppingList?: boolean;
  aisle?: string;
}

export interface SignatureRecipe {
  id: string;
  name: string;
  type: 'cocktail' | 'mocktail' | 'appetizer' | 'dessert' | 'main';
  description: string;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  dietaryTags: string[];
  prepTimeMinutes?: number;
}

export type TimelineTimeframe = 
  | '1_week_before'
  | '2_days_before'
  | '1_day_before'
  | 'day_of_morning'
  | '2_hours_before';

export interface TimelineStep {
  id: string;
  timeframe: TimelineTimeframe;
  timeframeLabel: string;
  task: string;
  category: 'shopping' | 'prep' | 'decor' | 'chilling' | 'hosting';
  isCompleted: boolean;
  notes?: string;
}

export interface ConsumptionMath {
  totalDrinksExpected: number;
  drinksPerHourPerPerson: number;
  icePoundsNeeded: number;
  appetizerPiecesTotal: number;
  proteinOuncesTotal: number;
  tablewareCountRecommended: number;
  explanation: string;
}

export interface PartyProfile {
  id: string;
  name: string;
  eventType: string;
  theme: string;
  date: string;
  time: string;
  locationType: LocationType;
  adultsCount: number;
  kidsCount: number;
  durationHours: number;
  budgetTotal: number;
  hostTier: HostTier;
  dietaryRestrictions: string[];
  vibe: string;
  cateringStyle: CateringStyle;
  additionalNotes?: string;
}

export interface CymbalOrderConfirmation {
  orderId: string;
  createdAt: string;
  scheduledTime: string;
  fulfillmentType: FulfillmentType;
  pickupLocation: string;
  deliveryAddress?: string;
  itemCount: number;
  subtotal: number;
  memberSavings: number;
  estimatedTax: number;
  finalTotal: number;
  barcode: string;
  status: 'confirmed' | 'packing' | 'ready_for_pickup' | 'out_for_delivery';
  substitutionPreference: 'best_organic_match' | 'contact_first' | 'no_substitutions';
}

export interface PartyPlan {
  id: string;
  profile: PartyProfile;
  summary: string;
  themeDescription: string;
  consumptionMath: ConsumptionMath;
  items: ShoppingItem[];
  signatureRecipes: SignatureRecipe[];
  timeline: TimelineStep[];
  totalEstimatedCost: number;
  budgetStatus: {
    targetBudget: number;
    estimatedCost: number;
    difference: number;
    status: 'under' | 'on_track' | 'over';
  };
  savingsTips: string[];
  agentAdvice: string;
  createdAt: string;
  updatedAt: string;
  orderConfirmation?: CymbalOrderConfirmation;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'add_items' | 'remove_items' | 'update_budget' | 'dietary_swap' | 'adjust_quantities' | 'apply_plan_mutation';
    payload: any;
    label: string;
  };
}

export interface PartyPreset {
  id: string;
  title: string;
  eventType: string;
  theme: string;
  tagline: string;
  icon: string;
  defaultAdults: number;
  defaultKids: number;
  defaultDurationHours: number;
  defaultBudget: number;
  defaultTier: HostTier;
  defaultDietary: string[];
  defaultVibe: string;
  defaultCatering: CateringStyle;
  notes: string;
}
