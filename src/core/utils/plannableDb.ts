import recipesDb from '../data/recipes-db.json';
import outdoorDb from '../data/outdoor-db.json';
import { RecipeDetails } from '../domain/types';

export const plannableDb = {
  ...recipesDb,
  ...outdoorDb,
} as unknown as Record<string, RecipeDetails>;
