import { PartyPreset } from '../types/party';

export const PARTY_PRESETS: PartyPreset[] = [
  {
    id: 'taco-fiesta',
    title: 'CymbalMart Taco & Margarita Fiesta',
    eventType: 'Casual Celebration / Birthday',
    theme: 'Vibrant Modern Cantina',
    tagline: 'Fresh street tacos, DIY salsa bar, and zesty citrus batch margaritas with Cymbal Fresh ingredients',
    icon: '🌮',
    defaultAdults: 14,
    defaultKids: 2,
    defaultDurationHours: 4,
    defaultBudget: 220,
    defaultTier: 'balanced',
    defaultDietary: ['Gluten-Free (corn tortillas)', 'Vegetarian Option'],
    defaultVibe: 'High Energy Fiesta',
    defaultCatering: 'hybrid_prep',
    notes: 'Focus on batch margaritas, marinated carne asada + cilantro lime chicken from Cymbal Butcher, homemade guacamole, tortilla chips, and festive papel picado vibes.'
  },
  {
    id: 'wine-charcuterie',
    title: 'Cymbal Reserve Wine & Artisanal Grazing',
    eventType: 'Dinner & Cocktail Soirée',
    theme: 'Golden Hour Tuscan Grazing',
    tagline: 'Curated cheese boards, antipasti, natural wines, and rustic breads from Cymbal Bakery & Deli',
    icon: '🧀',
    defaultAdults: 10,
    defaultKids: 0,
    defaultDurationHours: 3,
    defaultBudget: 280,
    defaultTier: 'gourmet',
    defaultDietary: ['Nut-Free Alert', 'Vegetarian Friendly'],
    defaultVibe: 'Chic & Elegant',
    defaultCatering: 'hybrid_prep',
    notes: 'Premium aged cheeses (Manchego, Brie, Gouda), prosciutto, artisanal crackers, fig jam, paired Pinot Noir and Crisp Sauvignon Blanc, linen napkins.'
  },
  {
    id: 'backyard-bbq',
    title: 'Cymbal Butcher Backyard BBQ & Craft Brews',
    eventType: 'Cookout / Summer Gathering',
    theme: 'Smoky Southern Pit & Lawn Games',
    tagline: 'Smoked meats, grilled sliders, cold beers, and crisp summer salads from Cymbal Fresh produce',
    icon: '🍔',
    defaultAdults: 16,
    defaultKids: 6,
    defaultDurationHours: 5,
    defaultBudget: 350,
    defaultTier: 'balanced',
    defaultDietary: ['Dairy-Free Options', 'Kids Friendly Items'],
    defaultVibe: 'Casual & Fun',
    defaultCatering: 'cook_diy',
    notes: 'Burgers, gourmet sausages, veggie skewers, potato salad, lemonade dispenser, craft IPA cans, lawn games, and s’mores kits.'
  },
  {
    id: 'game-day-tailgate',
    title: 'CymbalMart Game Day Kickoff & Tailgate',
    eventType: 'Sports Watch Party',
    theme: 'Stadium Fanatics & Finger Foods',
    tagline: 'Buffalo wings, warm queso dip, loaded sliders, and ice-cold seltzer buckets',
    icon: '🏈',
    defaultAdults: 12,
    defaultKids: 2,
    defaultDurationHours: 4.5,
    defaultBudget: 190,
    defaultTier: 'balanced',
    defaultDietary: ['Gluten-Free Snacks', 'Dairy-Free Wing Sauce'],
    defaultVibe: 'High Energy Fiesta',
    defaultCatering: 'hybrid_prep',
    notes: 'Cymbal Deli hot wings, slow-cooker queso dip with tortilla chips, craft beer 12-packs, extra paper towels, and 20 lbs cooler ice.'
  },
  {
    id: 'kids-superhero',
    title: 'Cymbal Bakery Superhero Birthday Quest',
    eventType: 'Kids Birthday Party',
    theme: 'Comic Book City Heroes',
    tagline: 'Power-packed juice bar, mini hero sandwiches, themed cupcakes, and active games',
    icon: '⚡',
    defaultAdults: 8,
    defaultKids: 12,
    defaultDurationHours: 2.5,
    defaultBudget: 200,
    defaultTier: 'balanced',
    defaultDietary: ['Nut-Free School Safe', 'Low-Sugar Options'],
    defaultVibe: 'Kid Friendly Wonderland',
    defaultCatering: 'hybrid_prep',
    notes: 'Cymbal Bakery custom cupcakes, juice boxes, fruit skewers, mini sliders, allergen-free snacks, superhero masks, balloon garland, and bubble machines.'
  },
  {
    id: 'sunset-mocktail-tapas',
    title: 'Cymbal Botanicals Sunset Tapas & Zero-Proof Bar',
    eventType: 'Mindful Social / Baby Shower',
    theme: 'Botanical Mediterranean Terrace',
    tagline: 'Artisanal non-alcoholic spirits, botanical spritzes, and vibrant tapas plates',
    icon: '🍸',
    defaultAdults: 12,
    defaultKids: 0,
    defaultDurationHours: 3.5,
    defaultBudget: 240,
    defaultTier: 'gourmet',
    defaultDietary: ['Alcohol-Free Focus', 'Vegan Options', 'Gluten-Free Options'],
    defaultVibe: 'Chic & Elegant',
    defaultCatering: 'hybrid_prep',
    notes: 'Zero-proof gin/aperitifs, tonic, fresh rosemary, dehydrated citrus wheels, patatas bravas, marinated olives, hummus & pita.'
  }
];

export const DIETARY_OPTIONS = [
  'Vegan',
  'Vegetarian',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free Safe',
  'Halal',
  'Kosher',
  'Keto / Low-Carb',
  'Low-Sugar',
  'Alcohol-Free Focus'
];

export const VIBE_OPTIONS = [
  'Casual & Fun',
  'Chic & Elegant',
  'High Energy Fiesta',
  'Cozy & Intimate',
  'Kid Friendly Wonderland',
  'Outdoor Festive'
];

export const EVENT_TYPE_OPTIONS = [
  'Birthday Bash',
  'Cocktail & Mixology Night',
  'Backyard BBQ & Cookout',
  'Dinner Party & Grazing',
  'Kids Birthday Party',
  'Game Night / Watch Party',
  'Housewarming',
  'Brunch Gathering',
  'Holiday / Seasonal Party',
  'Baby / Bridal Shower',
  'Outdoor Picnic'
];

