export interface Recipe {
  id: string;
  title: string;
  category: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  instructions: Array<{
    step: number;
    description: string;
  }>;
  is_favorite: boolean;
  image: string;
  datetime: string;
  cooking_time?: number; // in minutes
  servings?: number;
}

// Định nghĩa type cho form tạo recipe mới
export type CreateRecipeDTO = Omit<Recipe, 'id'>;

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  name: string;
  amount: number;
  unit: string;
}

export interface RecipeStep {
  id: string;
  recipeId: string;
  stepNumber: number;
  description: string;
  imageUrl?: string;
} 