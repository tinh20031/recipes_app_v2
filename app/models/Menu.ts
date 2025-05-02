import { Recipe } from './Recipe';

export interface MenuRecipeItem {
  recipe_id: string;
  recipe?: Recipe;
  scheduled_date: string;
  notification_time?: string;
  completed: boolean;
}

export interface Menu {
  id: string;
  name: string;
  recipes: string[]; // Array of recipe IDs
  created_at: string;
}

export interface MenuWithRecipes extends Omit<Menu, 'recipes'> {
  recipes: Recipe[];
}

export type CreateMenuDTO = Omit<Menu, 'id'>;

export interface MenuNotification {
  id: string;
  menu_id: string;
  recipe_id: string;
  scheduled_for: string;
  title: string;
  body: string;
  is_read: boolean;
} 