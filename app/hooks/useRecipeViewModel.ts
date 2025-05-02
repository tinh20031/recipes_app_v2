import { RecipeViewModel } from '../viewmodels/RecipeViewModel';

let viewModel: RecipeViewModel | null = null;

export const useRecipeViewModel = () => {
  if (!viewModel) {
    viewModel = new RecipeViewModel();
  }
  return viewModel;
}; 