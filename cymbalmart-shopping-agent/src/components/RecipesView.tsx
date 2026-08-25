import React, { useState } from 'react';
import { useParty } from '../context/PartyContext';
import { SignatureRecipe } from '../types/party';
import { customRecipeAPI } from '../services/partyService';
import { 
  GlassWater, 
  Sparkles, 
  Clock, 
  Plus, 
  Check, 
  Wine
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RecipesView: React.FC = () => {
  const { currentPlan, scaleRecipeServings, addCustomRecipe, addItem } = useParty();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customType, setCustomType] = useState<'cocktail' | 'mocktail' | 'appetizer' | 'dessert' | 'main'>('cocktail');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!currentPlan) return null;

  const recipes = currentPlan.signatureRecipes || [];

  const handleGenerateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const newRecipe = await customRecipeAPI(currentPlan.profile, customType, customPrompt);
      addCustomRecipe(newRecipe);
      
      // Also optionally add its key ingredients to the master shopping list
      newRecipe.ingredients.forEach(ing => {
        addItem({
          name: ing.item,
          category: customType === 'cocktail' || customType === 'mocktail' ? 'beverages' : 'food_catering',
          quantity: 1,
          unit: ing.amount,
          quantityMath: `For ${newRecipe.name} (${newRecipe.servings} servings)`,
          estimatedPrice: 6.99,
          storeCategory: customType === 'cocktail' ? 'liquor' : 'grocery',
          dietaryBadges: newRecipe.dietaryTags,
          priority: 'recommended',
          notes: `Ingredient for ${newRecipe.name}`,
        });
      });

      setIsModalOpen(false);
      setCustomPrompt('');
      try {
        confetti({ particleCount: 40, spread: 60 });
      } catch (_) {}
    } catch (err) {
      console.error('Failed to generate recipe:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header briefing */}
      <div className="bg-white border border-black/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">Atelier Bar & Kitchen</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal italic text-black tracking-tight mt-1">
              Curated Cocktail & Culinary Atelier
            </h1>
            <p className="text-xs text-black/60 font-sans mt-0.5">
              Batch craft cocktails and signature grazing recipes tailored to the event aesthetic.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formulate Recipe</span>
          </button>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recipes.map(recipe => (
          <div
            key={recipe.id}
            className="bg-white border border-black/10 p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xs hover:border-black/30 transition-colors"
          >
            <div className="space-y-5">
              
              {/* Recipe Top Bar */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-[#F4F1EA] text-black uppercase tracking-widest">
                      {recipe.type === 'cocktail' && 'Batch Cocktail'}
                      {recipe.type === 'mocktail' && '0% ABV Mocktail'}
                      {recipe.type === 'appetizer' && 'Grazing Plate'}
                      {recipe.type === 'dessert' && 'Confection'}
                      {recipe.type === 'main' && 'Signature Entrée'}
                    </span>

                    {recipe.prepTimeMinutes && (
                      <span className="text-[11px] text-black/50 flex items-center gap-1 font-sans">
                        <Clock className="w-3 h-3" />
                        {recipe.prepTimeMinutes}m prep
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-normal italic text-black tracking-tight">
                    {recipe.name}
                  </h3>
                </div>

                {/* Servings Stepper */}
                <div className="flex items-center bg-[#F8F7F4] p-1 border border-black/10 shrink-0">
                  <button
                    onClick={() => scaleRecipeServings(recipe.id, recipe.servings - 2)}
                    className="w-5 h-5 flex items-center justify-center text-black/60 hover:text-black font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-bold text-black px-2">
                    {recipe.servings} <span className="font-sans font-normal text-black/50 text-[10px]">servings</span>
                  </span>
                  <button
                    onClick={() => scaleRecipeServings(recipe.id, recipe.servings + 2)}
                    className="w-5 h-5 flex items-center justify-center text-black/60 hover:text-black font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <p className="text-xs text-black/70 leading-relaxed font-sans font-light">
                {recipe.description}
              </p>

              {/* Dietary Tags */}
              {recipe.dietaryTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {recipe.dietaryTags.map(tag => (
                    <span key={tag} className="text-[9px] font-sans uppercase tracking-wider font-semibold px-2 py-0.5 bg-[#F8F7F4] text-black border border-black/10">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Ingredients List */}
              <div className="p-4 bg-[#F8F7F4] border border-black/10 space-y-2.5">
                <span className="text-[10px] font-bold text-black/50 uppercase tracking-[0.2em] block font-sans">
                  Batch Specifications:
                </span>
                <ul className="space-y-1.5 text-xs text-black font-sans">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center justify-between border-b border-black/5 pb-1">
                      <span>{ing.item}</span>
                      <span className="font-mono font-semibold text-black">
                        {ing.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step-by-Step Method */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-black/50 uppercase tracking-[0.2em] block font-sans">
                  Preparation Method:
                </span>
                <ol className="space-y-2 text-xs text-black/80 font-sans">
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="font-mono text-black/40 text-[10px] shrink-0 mt-0.5 font-bold">
                        0{idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

            </div>

            <div className="pt-4 border-t border-black/10 text-[10px] font-sans uppercase tracking-wider text-black/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-black" />
              <span>Ingredients auto-mapped to Master Manifest</span>
            </div>
          </div>
        ))}
      </div>

      {/* Custom AI Recipe Generator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-black/20 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-black/50 font-bold">AI Atelier</span>
                <h3 className="font-serif text-xl italic text-black font-normal">
                  Formulate Bespoke Recipe
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-black/50 hover:text-black text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateRecipe} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-black/60 mb-1.5 font-sans">
                  Classification
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['cocktail', 'mocktail', 'appetizer', 'dessert', 'main'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCustomType(t)}
                      className={`px-2 py-2 text-[10px] font-sans uppercase tracking-wider font-semibold border transition-all ${
                        customType === t
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black/60 border-black/15 hover:border-black'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-black/60 mb-1.5 font-sans">
                  Flavor Profile & Requirements
                </label>
                <textarea
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g. Botanical gin with elderflower and grapefruit, or a vegan truffle crostini with caramelized figs."
                  className="w-full bg-[#FDFCFB] border border-black/15 rounded-none px-3 py-2 text-xs text-black placeholder-black/30 focus:outline-none focus:border-black font-sans resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !customPrompt.trim()}
                className="w-full py-3 px-4 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Calculating Ratios & Directions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create & Append to Manifest</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

