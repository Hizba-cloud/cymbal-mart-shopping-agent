import { PartyProfile, ConsumptionMath, ShoppingItem, HostTier } from '../types/party';

export function calculatePartyConsumption(profile: PartyProfile): ConsumptionMath {
  const { adultsCount, kidsCount, durationHours } = profile;
  const totalGuests = adultsCount + kidsCount;
  
  // Standard party drink formula: 2 drinks first hour, 1 drink each subsequent hour
  const hours = Math.max(1, durationHours);
  const drinksPerAdult = 2 + (hours - 1) * 1;
  const rawAdultDrinks = adultsCount * drinksPerAdult;
  const totalDrinksExpected = Math.ceil(rawAdultDrinks * 1.15); // 15% host safety buffer
  
  // Ice: 1.5 lbs per person for cocktail/drink dispensing, + 10 lbs for chilling bins if > 8 people
  const baseIce = totalGuests * 1.5;
  const coolerIce = totalGuests > 8 ? 10 : 5;
  const icePoundsNeeded = Math.ceil((baseIce + coolerIce) / 5) * 5; // rounded to 5lb bag increments

  // Appetizers: 6-8 pieces per guest for cocktail/casual parties, 4 pieces for full meal
  const appetizerPiecesTotal = Math.ceil(totalGuests * (profile.cateringStyle === 'cook_diy' ? 5 : 7));

  // Protein: ~7 oz per adult, ~4 oz per kid
  const proteinOuncesTotal = Math.ceil(adultsCount * 7 + kidsCount * 4);

  // Tableware: 1.5 plates and 2 cups per guest
  const tablewareCountRecommended = Math.ceil(totalGuests * 2.2);

  const explanation = `${adultsCount} adults over ${hours} hrs requires ~${drinksPerAdult} drinks/person with a 15% buffer (${totalDrinksExpected} total servings). Ice accounts for 1.5 lbs/person plus cooler tubs (${icePoundsNeeded} lbs).`;

  return {
    totalDrinksExpected,
    drinksPerHourPerPerson: Number((drinksPerAdult / hours).toFixed(1)),
    icePoundsNeeded,
    appetizerPiecesTotal,
    proteinOuncesTotal,
    tablewareCountRecommended,
    explanation
  };
}

export function generateDefaultPlanData(profile: PartyProfile): {
  items: ShoppingItem[];
  consumptionMath: ConsumptionMath;
  summary: string;
} {
  const math = calculatePartyConsumption(profile);
  const { adultsCount, kidsCount, hostTier } = profile;
  const tierMultiplier = hostTier === 'gourmet' ? 1.35 : hostTier === 'budget' ? 0.75 : 1.0;

  const items: ShoppingItem[] = [
    // Beverages
    {
      id: 'bev-1',
      name: 'Cymbal Choice Craft Beer & Hard Seltzer Variety Pack',
      category: 'beverages',
      quantity: Math.max(1, Math.ceil(math.totalDrinksExpected * 0.4 / 12)),
      unit: '12-packs',
      quantityMath: `${adultsCount} adults × 40% beer share = ~${Math.ceil(math.totalDrinksExpected * 0.4)} cans`,
      estimatedPrice: Number((18.99 * tierMultiplier).toFixed(2)),
      storeCategory: 'liquor',
      dietaryBadges: ['Gluten-Free Options (Seltzers)'],
      priority: 'must_have',
      isBought: false,
      aisle: 'Aisle 3: Craft Beer & Seltzers',
      brandTier: 'cymbal_choice',
      brandSuggestion: 'Cymbal Choice',
      memberSavings: 2.00,
      inStock: true,
      notes: 'Select popular IPA, Mexican lager, and black cherry seltzers in Aisle 3.'
    },
    {
      id: 'bev-2',
      name: 'Cymbal Reserve Sonoma Pinot Noir & Crisp Sauvignon Blanc',
      category: 'beverages',
      quantity: Math.max(2, Math.ceil(math.totalDrinksExpected * 0.3 / 5)),
      unit: '750ml bottles',
      quantityMath: `30% wine share = ~${Math.ceil(math.totalDrinksExpected * 0.3)} glasses (5 glasses/bottle)`,
      estimatedPrice: Number((13.99 * tierMultiplier).toFixed(2)),
      storeCategory: 'liquor',
      dietaryBadges: ['Vegan Friendly'],
      priority: 'must_have',
      isBought: false,
      aisle: 'Aisle 2: Fine Wine & Spirits',
      brandTier: 'cymbal_reserve',
      brandSuggestion: 'Cymbal Reserve',
      memberSavings: 3.00,
      inStock: true,
      notes: 'Crisp Sauvignon Blanc chilled in cooler, Pinot Noir at room cellar temp.'
    },
    {
      id: 'bev-3',
      name: 'Cymbal Pure Sparkling Mineral Water & Citrus Artisan Sodas',
      category: 'beverages',
      quantity: Math.max(2, Math.ceil((adultsCount + kidsCount) * 1.5 / 8)),
      unit: '8-packs',
      quantityMath: `1.5 non-alcoholic drinks per guest = ~${Math.ceil((adultsCount + kidsCount) * 1.5)} cans`,
      estimatedPrice: Number((5.99 * tierMultiplier).toFixed(2)),
      storeCategory: 'grocery',
      dietaryBadges: ['0% ABV', 'Zero-Sugar', 'Gluten-Free'],
      priority: 'must_have',
      isBought: false,
      aisle: 'Aisle 4: Sparkling Water & Mixers',
      brandTier: 'cymbal_choice',
      brandSuggestion: 'Cymbal Pure',
      memberSavings: 1.00,
      inStock: true,
      notes: 'Lime & grapefruit sparkling waters plus craft ginger beer.'
    },
    {
      id: 'ice-1',
      name: 'Cymbal Pure Crystal Filtered Ice Bags',
      category: 'ice_perishables',
      quantity: Math.max(2, Math.ceil(math.icePoundsNeeded / 10)),
      unit: '10-lb bags',
      quantityMath: `1.5 lbs/person drinks + chilling bin reserve = ${math.icePoundsNeeded} lbs`,
      estimatedPrice: 2.99,
      storeCategory: 'grocery',
      dietaryBadges: [],
      priority: 'must_have',
      isBought: false,
      aisle: 'Front Entrance Cold Vault 1',
      brandTier: 'cymbal_choice',
      brandSuggestion: 'Cymbal Pure Ice',
      memberSavings: 0.50,
      inStock: true,
      notes: 'Pick up last at front registers or curbside pickup loader.'
    },
    // Food & Catering
    {
      id: 'food-1',
      name: 'Cymbal Deli Artisan Charcuterie & Imported Cheese Platter',
      category: 'food_catering',
      quantity: Math.max(1, Math.ceil((adultsCount + kidsCount) / 8)),
      unit: 'large platters',
      quantityMath: `Serves 8-10 people grazing throughout event`,
      estimatedPrice: Number((32.00 * tierMultiplier).toFixed(2)),
      storeCategory: 'grocery',
      dietaryBadges: ['Nut-Free (serve nuts on side)', 'Gluten-Free Crackers Option'],
      priority: 'must_have',
      isBought: false,
      aisle: 'Aisle 7: Deli & Bakery Service',
      brandTier: 'cymbal_reserve',
      brandSuggestion: 'Cymbal Deli Signature',
      memberSavings: 4.00,
      inStock: true,
      notes: 'Aged cheddar, creamy brie, cured prosciutto, grapes, fig spread, rosemary crackers.'
    },
    {
      id: 'food-2',
      name: 'Cymbal Fresh Hass Guacamole & Organic Corn Tortilla Chips',
      category: 'food_catering',
      quantity: Math.max(2, Math.ceil((adultsCount + kidsCount) / 5)),
      unit: 'sets (dip + chips)',
      quantityMath: `Crowd staple, ~3-4 oz dip per guest`,
      estimatedPrice: Number((9.99 * tierMultiplier).toFixed(2)),
      storeCategory: 'grocery',
      dietaryBadges: ['Vegan', 'Gluten-Free', 'Dairy-Free'],
      priority: 'must_have',
      isBought: false,
      aisle: 'Aisle 1: Fresh Produce & Dip Bar',
      brandTier: 'cymbal_choice',
      brandSuggestion: 'Cymbal Fresh',
      memberSavings: 1.50,
      inStock: true,
      notes: 'Made daily with ripe Hass avocados, cilantro, lime juice, sea salt chips.'
    },
    {
      id: 'food-3',
      name: 'Cymbal Butcher Marinated Sliders & Skewer Grill Kit',
      category: 'food_catering',
      quantity: Math.max(1, Math.ceil(math.proteinOuncesTotal / 16)),
      unit: 'lbs prepared / packs',
      quantityMath: `${math.proteinOuncesTotal} oz total protein target (~7oz per adult)`,
      estimatedPrice: Number((24.00 * tierMultiplier).toFixed(2)),
      storeCategory: 'grocery',
      dietaryBadges: ['Dairy-Free Available'],
      priority: 'must_have',
      isBought: false,
      aisle: 'Aisle 9: Butcher & Fresh Meat Counter',
      brandTier: 'cymbal_choice',
      brandSuggestion: 'Cymbal Butcher Reserve',
      memberSavings: 3.50,
      inStock: true,
      notes: 'Tender marinated chicken skewers and savory beef sliders ready for quick skillet/grill.'
    },
    {
      id: 'food-4',
      name: 'Cymbal Bakery Petit Four Desserts & Macaron Selection',
      category: 'food_catering',
      quantity: Math.max(1, Math.ceil((adultsCount + kidsCount) * 1.5 / 12)),
      unit: 'dozen boxes',
      quantityMath: `1.5 sweet bites per guest`,
      estimatedPrice: Number((13.99 * tierMultiplier).toFixed(2)),
      storeCategory: 'grocery',
      dietaryBadges: ['Vegetarian'],
      priority: 'recommended',
      isBought: false,
      aisle: 'Aisle 7: Artisan Bakery Case',
      brandTier: 'cymbal_reserve',
      brandSuggestion: 'Cymbal Bakery Masterpiece',
      memberSavings: 2.00,
      inStock: true,
      notes: 'Bite-sized gourmet pastries so guests can mingle without forks.'
    },
    // Tableware & Essentials
    {
      id: 'table-1',
      name: 'Cymbal Eco Heavy-Duty Bamboo Compostable Plates',
      category: 'tableware_essentials',
      quantity: Math.max(1, Math.ceil(math.tablewareCountRecommended / 25)),
      unit: '25-count packs',
      quantityMath: `1.5 plates/guest = ~${Math.ceil((adultsCount + kidsCount) * 1.5)} plates`,
      estimatedPrice: 6.99,
      storeCategory: 'wholesale',
      dietaryBadges: [],
      priority: 'must_have',
      isBought: false,
      aisle: 'Aisle 12: Party Supplies & Paper Goods',
      brandTier: 'cymbal_choice',
      brandSuggestion: 'Cymbal Eco',
      memberSavings: 1.00,
      inStock: true,
      notes: 'Rigid unbleached plant fiber plates that do not sag under sauces.'
    },
    {
      id: 'table-2',
      name: 'Cymbal Eco Clear Recyclable Party Tumblers (12 oz)',
      category: 'tableware_essentials',
      quantity: Math.max(1, Math.ceil((adultsCount + kidsCount) * 2 / 30)),
      unit: '30-count packs',
      quantityMath: `2 cups/person for mixed drinks and water`,
      estimatedPrice: 5.49,
      storeCategory: 'wholesale',
      dietaryBadges: [],
      priority: 'must_have',
      isBought: false,
      aisle: 'Aisle 12: Party Supplies & Paper Goods',
      brandTier: 'cymbal_choice',
      brandSuggestion: 'Cymbal Eco',
      memberSavings: 0.75,
      inStock: true,
      notes: 'Includes dual marker for guest name labeling on cups.'
    },
    {
      id: 'table-3',
      name: 'Cymbal Ultra-Soft 2-Ply Dinner & Cocktail Napkins',
      category: 'tableware_essentials',
      quantity: 1,
      unit: '100-pack',
      quantityMath: `2.5 napkins per guest`,
      estimatedPrice: 4.99,
      storeCategory: 'wholesale',
      dietaryBadges: [],
      priority: 'must_have',
      isBought: false,
      aisle: 'Aisle 12: Paper Goods & Napkins',
      brandTier: 'cymbal_choice',
      brandSuggestion: 'Cymbal Choice',
      memberSavings: 0.50,
      inStock: true,
      notes: 'High-absorbency 2-ply napkins.'
    },
    // Decor & Entertainment
    {
      id: 'decor-1',
      name: 'Cymbal Home Warm LED Micro Fairy Lights & Table Runner',
      category: 'decor_theme',
      quantity: 1,
      unit: 'set',
      quantityMath: `Focal tabletop and bar presentation`,
      estimatedPrice: Number((16.00 * tierMultiplier).toFixed(2)),
      storeCategory: 'party_store',
      dietaryBadges: [],
      priority: 'recommended',
      isBought: false,
      aisle: 'Aisle 14: Home & Seasonal Decor',
      brandTier: 'cymbal_choice',
      brandSuggestion: 'Cymbal Home',
      memberSavings: 2.50,
      inStock: true,
      notes: 'Warm string lights with battery pack and reusable botanical runner.'
    },
    {
      id: 'favors-1',
      name: 'Cymbal Play Tabletop Trivia & Icebreaker Card Deck',
      category: 'entertainment_favors',
      quantity: 1,
      unit: 'deck / kit',
      quantityMath: `High engagement group activity`,
      estimatedPrice: 9.99,
      storeCategory: 'party_store',
      dietaryBadges: [],
      priority: 'nice_to_have',
      isBought: false,
      aisle: 'Aisle 13: Games & Novelty Favors',
      brandTier: 'cymbal_choice',
      brandSuggestion: 'Cymbal Play',
      memberSavings: 1.50,
      inStock: true,
      notes: 'Casual icebreaker cards that get guests talking without awkward pauses.'
    }
  ];

  return {
    items,
    consumptionMath: math,
    summary: `CymbalMart curated party plan formulated for ${adultsCount} adults and ${kidsCount} kids with ${profile.hostTier} budget tier.`
  };
}

