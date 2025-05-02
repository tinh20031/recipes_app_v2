import { Recipe } from '../models/Recipe';

export type RootStackParamList = {
  Home: undefined;
  RecipeDetail: { recipe: Recipe };
  AddRecipe: undefined;
  EditRecipe: { recipe: Recipe };
}; 