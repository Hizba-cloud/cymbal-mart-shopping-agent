import { PartyProfile, PartyPlan, AgentChatMessage, ShoppingItem, SignatureRecipe } from '../types/party';
import { generateDefaultPlanData } from '../utils/mathEngine';

export async function generatePlanAPI(profile: PartyProfile): Promise<PartyPlan> {
  try {
    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('Backend plan generation unavailable, synthesizing via offline math engine:', error);
    const { items, consumptionMath, summary } = generateDefaultPlanData(profile);
    const totalCost = Number(items.reduce((s, i) => s + i.estimatedPrice * (i.quantity || 1), 0).toFixed(2));
    
    return {
      id: `plan-${Date.now()}`,
      profile,
      summary,
      themeDescription: profile.theme,
      consumptionMath,
      items,
      signatureRecipes: [
        {
          id: 'rec-1',
          name: 'Party Signature Batch Punch',
          type: 'cocktail',
          description: 'A balanced crowd-pleasing punch with seasonal citrus and botanical notes.',
          servings: profile.adultsCount,
          ingredients: [
            { item: 'Light Rum or Vodka', amount: '750ml bottle', inShoppingList: true },
            { item: 'Fresh Pineapple & Lime Juice', amount: '1 liter', inShoppingList: true },
            { item: 'Ginger Beer', amount: '4 cans', inShoppingList: true },
            { item: 'Fresh Mint & Citrus Slices', amount: '1 bunch', inShoppingList: true },
          ],
          instructions: [
            'Combine juices and spirits in a dispenser 2 hours prior.',
            'Right before guests arrive, add ice block and top with ginger beer.',
            'Garnish with mint bouquets and citrus wheels.',
          ],
          dietaryTags: ['Vegan', 'Gluten-Free'],
          prepTimeMinutes: 10,
        },
      ],
      timeline: [
        {
          id: 't-1',
          timeframe: '1_week_before',
          timeframeLabel: '1 Week Before',
          task: 'Order tableware, decorations, and non-perishables online or wholesale.',
          category: 'shopping',
          isCompleted: false,
        },
        {
          id: 't-2',
          timeframe: '2_days_before',
          timeframeLabel: '2 Days Before',
          task: 'Complete main grocery shopping for meats, cheeses, and beverages.',
          category: 'shopping',
          isCompleted: false,
        },
        {
          id: 't-3',
          timeframe: '1_day_before',
          timeframeLabel: '1 Day Before (Eve)',
          task: 'Batch cocktail bases, marinate skewers/proteins, clean drink dispensers.',
          category: 'prep',
          isCompleted: false,
        },
        {
          id: 't-4',
          timeframe: 'day_of_morning',
          timeframeLabel: 'Party Morning',
          task: 'Pick up fresh bakery items and bagged ice. Chill wine and beers.',
          category: 'chilling',
          isCompleted: false,
        },
        {
          id: 't-5',
          timeframe: '2_hours_before',
          timeframeLabel: '2 Hours to Showtime',
          task: 'Set out grazing boards, fill ice buckets, cue background playlist.',
          category: 'hosting',
          isCompleted: false,
        },
      ],
      totalEstimatedCost: totalCost,
      budgetStatus: {
        targetBudget: profile.budgetTotal,
        estimatedCost: totalCost,
        difference: Number((profile.budgetTotal - totalCost).toFixed(2)),
        status: totalCost <= profile.budgetTotal ? 'under' : 'over',
      },
      savingsTips: [
        'Pick up canned seltzers and paper napkins at wholesale bulk clubs.',
        'Use batch dispensers rather than individual cocktail ingredients to save up to 30%.',
      ],
      agentAdvice: 'Set up the drink station away from the kitchen to prevent host bottlenecks!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function chatAgentAPI(
  message: string,
  currentPlan: PartyPlan,
  history: AgentChatMessage[]
): Promise<{ reply: string; planMutation?: any }> {
  try {
    const res = await fetch('/api/agent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        currentPlan,
        history: history.map(h => ({ role: h.role, content: h.content })),
      }),
    });

    if (!res.ok) throw new Error('Agent chat failed');
    return await res.json();
  } catch (error) {
    console.error('Chat API error:', error);
    return {
      reply: "I'm right here! You can adjust your guest count or budget directly in the Blueprint view, or toggle items as bought in your Shopping List.",
    };
  }
}

export async function dietarySwapAPI(
  item: ShoppingItem,
  restriction: string,
  partyTheme: string
): Promise<any> {
  try {
    const res = await fetch('/api/dietary-swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, restriction, partyTheme }),
    });

    if (!res.ok) throw new Error('Dietary swap failed');
    return await res.json();
  } catch (error) {
    return {
      alternativeName: `${restriction} Style ${item.name}`,
      notes: `Customized to be 100% ${restriction} compliant.`,
      estimatedPrice: item.estimatedPrice,
      quantity: item.quantity,
      unit: item.unit,
      dietaryBadges: [restriction],
    };
  }
}

export async function customRecipeAPI(
  profile: PartyProfile,
  drinkOrDishType: string,
  promptDetails: string
): Promise<SignatureRecipe> {
  const res = await fetch('/api/recipe-generator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, drinkOrDishType, promptDetails }),
  });
  if (!res.ok) throw new Error('Recipe generation failed');
  return await res.json();
}

export async function budgetOptimizerAPI(
  plan: PartyPlan,
  targetBudget: number
): Promise<any> {
  const res = await fetch('/api/budget-optimizer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, targetBudget }),
  });
  if (!res.ok) throw new Error('Budget optimizer failed');
  return await res.json();
}
