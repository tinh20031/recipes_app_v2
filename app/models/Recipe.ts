export interface Recipe {
  id: string;
  title: string;
  category: string;
  ingredients: string[];
  instructions: string[];
  is_favorite: boolean;
  image: string;
  datetime: string;
}

// Định nghĩa type cho form tạo recipe mới
export type CreateRecipeDTO = Omit<Recipe, 'id'>;

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeStep {
  id: string;
  recipeId: string;
  stepNumber: number;
  description: string;
  imageUrl?: string;
} 