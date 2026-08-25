import { Router, Request, Response } from 'express';
import {
  generatePartyPlanWithAI,
  chatWithPartyAgent,
  suggestDietarySwapAI,
  generateCustomRecipeAI,
  optimizeBudgetAI,
} from './geminiService';

export const apiRouter = Router();

apiRouter.post('/generate-plan', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = req.body;
    if (!profile || !profile.eventType) {
      res.status(400).json({ error: 'Valid party profile is required' });
      return;
    }
    const plan = await generatePartyPlanWithAI(profile);
    res.json(plan);
  } catch (error: any) {
    console.error('API /generate-plan error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate party plan' });
  }
});

apiRouter.post('/agent-chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, currentPlan, history } = req.body;
    if (!message || !currentPlan) {
      res.status(400).json({ error: 'Message and currentPlan are required' });
      return;
    }
    const result = await chatWithPartyAgent(message, currentPlan, history || []);
    res.json(result);
  } catch (error: any) {
    console.error('API /agent-chat error:', error);
    res.status(500).json({ error: error.message || 'Agent chat failed' });
  }
});

apiRouter.post('/dietary-swap', async (req: Request, res: Response): Promise<void> => {
  try {
    const { item, restriction, partyTheme } = req.body;
    if (!item || !restriction) {
      res.status(400).json({ error: 'Item and restriction are required' });
      return;
    }
    const swap = await suggestDietarySwapAI(item, restriction, partyTheme || 'Celebration');
    res.json(swap);
  } catch (error: any) {
    console.error('API /dietary-swap error:', error);
    res.status(500).json({ error: error.message || 'Dietary swap failed' });
  }
});

apiRouter.post('/recipe-generator', async (req: Request, res: Response): Promise<void> => {
  try {
    const { profile, drinkOrDishType, promptDetails } = req.body;
    if (!profile) {
      res.status(400).json({ error: 'Party profile is required' });
      return;
    }
    const recipe = await generateCustomRecipeAI(profile, drinkOrDishType || 'cocktail', promptDetails || '');
    res.json(recipe);
  } catch (error: any) {
    console.error('API /recipe-generator error:', error);
    res.status(500).json({ error: error.message || 'Recipe generation failed' });
  }
});

apiRouter.post('/budget-optimizer', async (req: Request, res: Response): Promise<void> => {
  try {
    const { plan, targetBudget } = req.body;
    if (!plan || !targetBudget) {
      res.status(400).json({ error: 'Plan and targetBudget are required' });
      return;
    }
    const result = await optimizeBudgetAI(plan, targetBudget);
    res.json(result);
  } catch (error: any) {
    console.error('API /budget-optimizer error:', error);
    res.status(500).json({ error: error.message || 'Budget optimization failed' });
  }
});
