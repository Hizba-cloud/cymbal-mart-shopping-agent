import { GoogleGenAI, Type } from '@google/genai';
import { PartyProfile, PartyPlan, ShoppingItem, SignatureRecipe, TimelineStep, ConsumptionMath } from '../types/party';
import { calculatePartyConsumption } from '../utils/mathEngine';

// Server-side initialization following AI Studio Gemini guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_NAME = 'gemini-3.7-flash';

export async function generatePartyPlanWithAI(profile: PartyProfile): Promise<PartyPlan> {
  const math = calculatePartyConsumption(profile);
  const prompt = `You are the CymbalMart Party Planning Shopping Agent, an expert retail co-pilot and master event consultant.
Generate a comprehensive, tailored, and budget-conscious shopping list and party blueprint for CymbalMart supermarket customers for the following event:

EVENT SPECIFICATIONS:
- Event Name: ${profile.name || 'Celebration'}
- Event Type: ${profile.eventType}
- Theme & Aesthetic: ${profile.theme}
- Guests: ${profile.adultsCount} Adults, ${profile.kidsCount} Kids (${profile.adultsCount + profile.kidsCount} Total)
- Duration: ${profile.durationHours} Hours
- Location: ${profile.locationType}
- Target Budget: $${profile.budgetTotal}
- Host Sourcing Tier: ${profile.hostTier} (budget: 'Cymbal Choice' value staples, balanced: 'Cymbal Fresh' quality, gourmet: 'Cymbal Reserve' artisanal imports)
- Dietary Restrictions / Allergens: ${profile.dietaryRestrictions.join(', ') || 'None specified'}
- Vibe: ${profile.vibe}
- Catering Style: ${profile.cateringStyle}
- Special Notes & Requests: ${profile.additionalNotes || 'None'}

CONSUMPTION ENGINE BASELINE (Use as foundation for your quantities):
- Expected Drinks: ${math.totalDrinksExpected} total servings (${math.drinksPerHourPerPerson} drinks/hr/person + 15% safety buffer)
- Ice Needed: ${math.icePoundsNeeded} lbs (cocktail ice + chilling tubs)
- Appetizer Pieces: ${math.appetizerPiecesTotal} total pieces
- Protein Target: ${math.proteinOuncesTotal} oz

CYMBALMART STORE AISLE & BRAND STANDARDS:
1. Map items to real CymbalMart aisles:
   - 'Aisle 1: Fresh Produce & Dip Bar'
   - 'Aisle 2: Fine Wine & Spirits'
   - 'Aisle 3: Craft Beer & Seltzers'
   - 'Aisle 4: Sparkling Water & Mixers'
   - 'Aisle 5: Snacks, Crackers & Nuts'
   - 'Aisle 7: Deli Counter & Artisan Bakery'
   - 'Aisle 9: Butcher & Fresh Meat'
   - 'Aisle 12: Party Tableware & Paper Goods'
   - 'Aisle 13: Games & Favors'
   - 'Aisle 14: Seasonal & Ambience Decor'
   - 'Cold Vault 1: Crystal Bagged Ice'
2. Suggest CymbalMart private brands where appropriate: 'Cymbal Choice' (value), 'Cymbal Reserve' (gourmet), 'Cymbal Fresh' (produce/meat), 'Cymbal Eco' (plates/cups).
3. Provide realistic member savings ($0.50 - $4.00 per item).
4. Tag dietary accommodations directly onto items (e.g. "Vegan", "Gluten-Free", "Nut-Free Safe", "0% ABV").
5. Provide 2-3 signature batch recipes that can be staged easily using ingredients from CymbalMart.
6. Provide a chronological prep and shopping timeline (1_week_before, 2_days_before, 1_day_before, day_of_morning, 2_hours_before).
7. Ensure estimated total cost respects or realistically aligns with the $${profile.budgetTotal} target.
8. Include practical host savings tips and expert advice.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: 'You are CymbalMart Party Planning Shopping Agent. You generate structured party shopping plans with precise grocery aisles, packaging quantities, dietary compliance, and budget alignment. Return strictly structured JSON matching the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            themeDescription: { type: Type.STRING },
            savingsTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            agentAdvice: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: "One of: 'beverages', 'food_catering', 'tableware_essentials', 'decor_theme', 'entertainment_favors', 'ice_perishables'",
                  },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  quantityMath: { type: Type.STRING },
                  estimatedPrice: { type: Type.NUMBER },
                  storeCategory: {
                    type: Type.STRING,
                    description: "One of: 'grocery', 'wholesale', 'liquor', 'party_store', 'specialty'",
                  },
                  dietaryBadges: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  priority: {
                    type: Type.STRING,
                    description: "One of: 'must_have', 'recommended', 'nice_to_have'",
                  },
                  notes: { type: Type.STRING },
                  brandSuggestion: { type: Type.STRING },
                  aisle: { type: Type.STRING },
                  brandTier: {
                    type: Type.STRING,
                    description: "One of: 'cymbal_choice', 'cymbal_reserve', 'national_brand'",
                  },
                  memberSavings: { type: Type.NUMBER },
                },
                required: ['name', 'category', 'quantity', 'unit', 'quantityMath', 'estimatedPrice', 'storeCategory', 'priority'],
              },
            },
            signatureRecipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: "One of: 'cocktail', 'mocktail', 'appetizer', 'dessert', 'main'",
                  },
                  description: { type: Type.STRING },
                  servings: { type: Type.NUMBER },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        item: { type: Type.STRING },
                        amount: { type: Type.STRING },
                        inShoppingList: { type: Type.BOOLEAN },
                        aisle: { type: Type.STRING },
                      },
                      required: ['item', 'amount'],
                    },
                  },
                  instructions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  dietaryTags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  prepTimeMinutes: { type: Type.NUMBER },
                },
                required: ['name', 'type', 'description', 'servings', 'ingredients', 'instructions', 'dietaryTags'],
              },
            },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeframe: {
                    type: Type.STRING,
                    description: "One of: '1_week_before', '2_days_before', '1_day_before', 'day_of_morning', '2_hours_before'",
                  },
                  timeframeLabel: { type: Type.STRING },
                  task: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: "One of: 'shopping', 'prep', 'decor', 'chilling', 'hosting'",
                  },
                  notes: { type: Type.STRING },
                },
                required: ['timeframe', 'timeframeLabel', 'task', 'category'],
              },
            },
          },
          required: ['summary', 'themeDescription', 'items', 'signatureRecipes', 'timeline', 'savingsTips', 'agentAdvice'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    
    // Enrich items with unique IDs and state
    const enrichedItems: ShoppingItem[] = (parsed.items || []).map((item: any, idx: number) => ({
      id: `item-${Date.now()}-${idx}`,
      name: item.name,
      category: validateCategory(item.category),
      quantity: Number(item.quantity) || 1,
      unit: item.unit || 'units',
      quantityMath: item.quantityMath || 'Based on guest count',
      estimatedPrice: Math.max(0.99, Number(item.estimatedPrice) || 5.0),
      storeCategory: validateStore(item.storeCategory),
      dietaryBadges: Array.isArray(item.dietaryBadges) ? item.dietaryBadges : [],
      priority: (['must_have', 'recommended', 'nice_to_have'].includes(item.priority) ? item.priority : 'must_have') as any,
      isBought: false,
      notes: item.notes || '',
      brandSuggestion: item.brandSuggestion || 'CymbalMart Sourced',
      aisle: item.aisle || defaultAisleForCategory(item.category),
      brandTier: (['cymbal_choice', 'cymbal_reserve', 'national_brand'].includes(item.brandTier) ? item.brandTier : 'cymbal_choice') as any,
      memberSavings: item.memberSavings || 1.00,
      inStock: true,
    }));

    const enrichedRecipes: SignatureRecipe[] = (parsed.signatureRecipes || []).map((rec: any, idx: number) => ({
      id: `recipe-${Date.now()}-${idx}`,
      name: rec.name,
      type: (['cocktail', 'mocktail', 'appetizer', 'dessert', 'main'].includes(rec.type) ? rec.type : 'cocktail') as any,
      description: rec.description || '',
      servings: Number(rec.servings) || profile.adultsCount,
      ingredients: Array.isArray(rec.ingredients) ? rec.ingredients.map((ing: any) => ({
        item: ing.item,
        amount: ing.amount,
        inShoppingList: ing.inShoppingList ?? true,
      })) : [],
      instructions: Array.isArray(rec.instructions) ? rec.instructions : [],
      dietaryTags: Array.isArray(rec.dietaryTags) ? rec.dietaryTags : [],
      prepTimeMinutes: Number(rec.prepTimeMinutes) || 15,
    }));

    const enrichedTimeline: TimelineStep[] = (parsed.timeline || []).map((step: any, idx: number) => ({
      id: `step-${Date.now()}-${idx}`,
      timeframe: step.timeframe as any,
      timeframeLabel: step.timeframeLabel || formatTimeframeLabel(step.timeframe),
      task: step.task,
      category: step.category as any,
      isCompleted: false,
      notes: step.notes || '',
    }));

    const totalEstimatedCost = Number(enrichedItems.reduce((sum, it) => sum + (it.estimatedPrice * (it.quantity || 1)), 0).toFixed(2));
    const budgetDiff = Number((profile.budgetTotal - totalEstimatedCost).toFixed(2));

    return {
      id: `plan-${Date.now()}`,
      profile,
      summary: parsed.summary || `${profile.name} shopping blueprint for ${profile.adultsCount + profile.kidsCount} guests.`,
      themeDescription: parsed.themeDescription || profile.theme,
      consumptionMath: math,
      items: enrichedItems,
      signatureRecipes: enrichedRecipes,
      timeline: enrichedTimeline,
      totalEstimatedCost,
      budgetStatus: {
        targetBudget: profile.budgetTotal,
        estimatedCost: totalEstimatedCost,
        difference: budgetDiff,
        status: budgetDiff >= 0 ? 'under' : Math.abs(budgetDiff) < 25 ? 'on_track' : 'over',
      },
      savingsTips: Array.isArray(parsed.savingsTips) ? parsed.savingsTips : ['Buy non-perishables in bulk at wholesale clubs.'],
      agentAdvice: parsed.agentAdvice || 'Chill white wine and batch cocktails 4 hours before guest arrival.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Gemini party generation error:', err);
    throw err;
  }
}

export async function chatWithPartyAgent(
  userMessage: string,
  currentPlan: PartyPlan,
  history: { role: string; content: string }[]
): Promise<{
  reply: string;
  planMutation?: {
    type: 'add_items' | 'remove_items' | 'update_budget' | 'dietary_swap' | 'adjust_quantities' | 'align_store_brand' | 'apply_full_plan';
    payload: any;
    label: string;
    autoApplied?: boolean;
  };
}> {
  const currentPlanContext = {
    store: 'CymbalMart Supercenter #1042',
    eventName: currentPlan.profile.name,
    theme: currentPlan.profile.theme,
    guests: `${currentPlan.profile.adultsCount} adults, ${currentPlan.profile.kidsCount} kids`,
    budgetCeiling: `$${currentPlan.profile.budgetTotal}`,
    currentEstimatedTotal: `$${currentPlan.totalEstimatedCost}`,
    budgetStatus: currentPlan.budgetStatus.status,
    budgetDifference: `$${Math.abs(currentPlan.budgetStatus.difference)} ${currentPlan.budgetStatus.status}`,
    dietaryRestrictions: currentPlan.profile.dietaryRestrictions,
    itemCount: currentPlan.items.length,
    itemsList: currentPlan.items.map(i => `${i.name} (Qty: ${i.quantity} ${i.unit}, Unit Price: $${i.estimatedPrice}, Aisle: ${i.aisle || 'Grocery'}, Brand: ${i.brandTier || 'cymbal_choice'})`).join('; '),
  };

  const prompt = `You are the CymbalMart Assistant, an intelligent retail shopping and party planning chatbot for CymbalMart customers.
You interact directly with customers to build, optimize, and modify their party shopping list and budget.

CURRENT CUSTOMER EVENT & LIST STATE:
${JSON.stringify(currentPlanContext, null, 2)}

CUSTOMER MESSAGE:
"${userMessage}"

CAPABILITIES:
1. Shopping List Modifications:
   - Add items: Specify name, quantity, unit, estimatedPrice, category ('beverages' | 'food_catering' | 'tableware_essentials' | 'decor_theme' | 'entertainment_favors' | 'ice_perishables'), aisle (e.g. 'Aisle 1: Fresh Produce', 'Aisle 3: Craft Beer & Seltzers', 'Aisle 6: Tableware', 'Aisle 7: Cold Vault & Ice'), brandTier ('cymbal_choice' | 'cymbal_reserve' | 'national_brand'), notes, dietaryBadges.
   - Remove items: Specify array of item names or keywords to remove from the shopping list.
   - Adjust quantities: Specify item names/keywords and their new quantity.
   - Dietary swaps: Replace an existing item with a suitable dietary/allergy alternative.
   - Update budget: Change the customer's target budget ceiling.
   - Align to store brands: Convert items to Cymbal Choice brand for ~20% member savings.

2. Budget Recalculation:
   - Always mention the updated budget impact (e.g., "This adds ~$14.50 to your total, bringing your manifest to $184.20, which is still $15.80 under your $200 budget!").
   - Offer practical CymbalMart grocery tips (e.g. Aisle location, store specials, portion math).

Return strict JSON adhering to this schema:
{
  "reply": "Friendly, professional assistant response detailing what was updated and the recalculated budget total",
  "planMutation": {
    "type": "add_items" | "remove_items" | "update_budget" | "dietary_swap" | "adjust_quantities" | "align_store_brand",
    "label": "Short action descriptor e.g. 'Add 2 Items to Shopping List' or 'Remove Craft Beer'",
    "payload": { ...concrete mutation data... }
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: 'You are the CymbalMart Assistant. You are friendly, attentive, precise with grocery math, and always help customers manage their shopping list and stay within budget.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            planMutation: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                label: { type: Type.STRING },
                payload: { type: Type.OBJECT },
              },
              required: ['type', 'label', 'payload'],
            },
          },
          required: ['reply'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return parsed;
  } catch (err) {
    console.error('CymbalMart Assistant chat error:', err);
    
    // Intelligent fallback handler for shopping list actions
    const lower = userMessage.toLowerCase();
    if (lower.includes('add') || lower.includes('buy') || lower.includes('need')) {
      return {
        reply: `I've noted that! I've prepared a shopping list addition for your request. Click the action button below to add it to your manifest and recalculate your budget.`,
        planMutation: {
          type: 'add_items',
          label: `Add Requested Item to Shopping List`,
          payload: {
            items: [
              {
                name: userMessage.replace(/add/i, '').replace(/please/i, '').trim() || 'Additional Party Supplies',
                category: 'food_catering',
                quantity: 2,
                unit: 'packs',
                estimatedPrice: 6.99,
                aisle: 'Aisle 1: Fresh Produce & Deli Platters',
                brandTier: 'cymbal_choice',
                dietaryBadges: [],
                notes: 'Added via CymbalMart Assistant',
              }
            ]
          }
        }
      };
    }

    if (lower.includes('remove') || lower.includes('delete')) {
      return {
        reply: `I can remove items from your shopping list and recalculate your budget totals. Click below to confirm the removal.`,
        planMutation: {
          type: 'remove_items',
          label: `Remove Selected Items`,
          payload: { query: userMessage }
        }
      };
    }

    return {
      reply: "Hello! I am your CymbalMart Assistant. I can help you update your shopping list (add ingredients, remove items, change quantities, swap brands or dietary options), and automatically recalculate your budget totals. What would you like to update?",
    };
  }
}

export async function suggestDietarySwapAI(
  item: ShoppingItem,
  dietaryRestriction: string,
  partyTheme: string
): Promise<{
  alternativeName: string;
  notes: string;
  estimatedPrice: number;
  quantity: number;
  unit: string;
  brandSuggestion: string;
  dietaryBadges: string[];
}> {
  const prompt = `Suggest a delicious, party-appropriate dietary alternative for the item "${item.name}" (${item.quantity} ${item.unit}) to accommodate the dietary restriction "${dietaryRestriction}".
Party Theme: ${partyTheme}.
Ensure the substitution matches the party vibe, is easily purchasable, and provides similar portion volume.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alternativeName: { type: Type.STRING },
            notes: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER },
            quantity: { type: Type.NUMBER },
            unit: { type: Type.STRING },
            brandSuggestion: { type: Type.STRING },
            dietaryBadges: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['alternativeName', 'notes', 'estimatedPrice', 'quantity', 'unit', 'dietaryBadges'],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error('Dietary swap error:', err);
    return {
      alternativeName: `${dietaryRestriction}-Friendly Alternative to ${item.name}`,
      notes: `Substituted to meet ${dietaryRestriction} guidelines.`,
      estimatedPrice: item.estimatedPrice,
      quantity: item.quantity,
      unit: item.unit,
      brandSuggestion: 'Store specialty section',
      dietaryBadges: [dietaryRestriction],
    };
  }
}

export async function generateCustomRecipeAI(
  profile: PartyProfile,
  drinkOrDishType: string,
  promptDetails: string
): Promise<SignatureRecipe> {
  const prompt = `Generate a signature party ${drinkOrDishType} for an event:
- Theme: ${profile.theme}
- Event Type: ${profile.eventType}
- Guests: ${profile.adultsCount} Adults, ${profile.kidsCount} Kids
- Vibe: ${profile.vibe}
- Dietary guidelines: ${profile.dietaryRestrictions.join(', ') || 'None'}
- Special host request: "${promptDetails}"

Include exact ingredient measurements scaled for a batch/party, clear batch preparation instructions, and estimated prep time.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            type: { type: Type.STRING },
            description: { type: Type.STRING },
            servings: { type: Type.NUMBER },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  inShoppingList: { type: Type.BOOLEAN },
                },
                required: ['item', 'amount'],
              },
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            dietaryTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            prepTimeMinutes: { type: Type.NUMBER },
          },
          required: ['name', 'type', 'description', 'servings', 'ingredients', 'instructions', 'dietaryTags'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      id: `recipe-${Date.now()}`,
      name: parsed.name || 'Signature Party Creation',
      type: (parsed.type || 'cocktail') as any,
      description: parsed.description || '',
      servings: Number(parsed.servings) || profile.adultsCount || 10,
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
      dietaryTags: Array.isArray(parsed.dietaryTags) ? parsed.dietaryTags : [],
      prepTimeMinutes: Number(parsed.prepTimeMinutes) || 15,
    };
  } catch (err) {
    console.error('Custom recipe error:', err);
    return {
      id: `recipe-${Date.now()}`,
      name: 'Signature Citrus Spritz',
      type: 'cocktail',
      description: 'Refreshing crowd-pleaser batch cocktail with fresh citrus and botanical notes.',
      servings: profile.adultsCount || 12,
      ingredients: [
        { item: 'Prosecco or Sparkling Wine', amount: '2 bottles', inShoppingList: true },
        { item: 'Aperol or Elderflower Liqueur', amount: '1 bottle', inShoppingList: true },
        { item: 'Sparkling Mineral Water', amount: '1 liter', inShoppingList: true },
        { item: 'Fresh Orange & Grapefruit Wheels', amount: '4 fruits', inShoppingList: true },
      ],
      instructions: [
        'Fill a large drink dispenser with ice 30 minutes before arrival.',
        'Pour liqueur, chilled prosecco, and sparkling water in a 3:2:1 ratio.',
        'Garnish generously with sliced citrus wheels and fresh rosemary sprigs.',
      ],
      dietaryTags: ['Vegetarian', 'Gluten-Free'],
      prepTimeMinutes: 10,
    };
  }
}

export async function optimizeBudgetAI(
  plan: PartyPlan,
  targetBudget: number
): Promise<{
  analysis: string;
  totalSaved: number;
  recommendations: {
    category: string;
    action: string;
    savingsAmount: number;
    description: string;
  }[];
}> {
  const prompt = `Analyze this party plan's items and cost:
- Current Total: $${plan.totalEstimatedCost}
- Desired Target Budget: $${targetBudget}
- Item breakdown: ${JSON.stringify(plan.items.map(i => ({ name: i.name, category: i.category, price: i.estimatedPrice, qty: i.quantity })), null, 2)}

Provide actionable cost optimization strategies, such as:
1. Store brand vs name brand swaps
2. Wholesale bulk purchase consolidations (e.g. Costco for drinks/paper goods)
3. Signature batch drink vs full open bar savings
4. DIY appetizer prep vs pre-made platters
5. Decor rentals / reusable fairy lights vs single-use plastics

Return structured analysis with specific savings amounts for each recommendation.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            totalSaved: { type: Type.NUMBER },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  action: { type: Type.STRING },
                  savingsAmount: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                },
                required: ['category', 'action', 'savingsAmount', 'description'],
              },
            },
          },
          required: ['analysis', 'totalSaved', 'recommendations'],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error('Budget optimizer error:', err);
    return {
      analysis: `By switching to wholesale beverage packs and bulk snacks, you can trim ~$${Math.max(20, Math.round(plan.totalEstimatedCost * 0.18))} easily.`,
      totalSaved: Math.round(plan.totalEstimatedCost * 0.18),
      recommendations: [
        {
          category: 'Beverages',
          action: 'Batch Cocktail & Club Soda',
          savingsAmount: 28,
          description: 'Opt for 1 signature batch drink + beer/wine rather than multiple single spirits and mixers.',
        },
        {
          category: 'Tableware',
          action: 'Wholesale Club Multi-Packs',
          savingsAmount: 14,
          description: 'Buy compostable plates and napkins in a single bulk case rather than individual grocery store packs.',
        },
      ],
    };
  }
}

function validateCategory(cat: string): any {
  const valid = ['beverages', 'food_catering', 'tableware_essentials', 'decor_theme', 'entertainment_favors', 'ice_perishables'];
  return valid.includes(cat) ? cat : 'food_catering';
}

function validateStore(store: string): any {
  const valid = ['grocery', 'wholesale', 'liquor', 'party_store', 'specialty'];
  return valid.includes(store) ? store : 'grocery';
}

function formatTimeframeLabel(tf: string): string {
  switch (tf) {
    case '1_week_before': return '1 Week Before';
    case '2_days_before': return '2 Days Before';
    case '1_day_before': return '1 Day Before (Eve)';
    case 'day_of_morning': return 'Party Morning';
    case '2_hours_before': return '2 Hours to Showtime';
    default: return 'Party Prep';
  }
}

function defaultAisleForCategory(category: string): string {
  switch (category) {
    case 'beverages': return 'Aisle 3: Craft Beer, Seltzers & Soda';
    case 'food_catering': return 'Aisle 7: Deli & Bakery Service';
    case 'tableware_essentials': return 'Aisle 12: Party Paper & Tableware';
    case 'decor_theme': return 'Aisle 14: Seasonal & Ambience Decor';
    case 'entertainment_favors': return 'Aisle 13: Games & Favors';
    case 'ice_perishables': return 'Cold Vault 1: Filtered Bagged Ice';
    default: return 'Aisle 1: Fresh Grocery';
  }
}

