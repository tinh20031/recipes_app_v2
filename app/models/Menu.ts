import { Recipe } from './Recipe';

export interface MenuRecipeItem {
  recipe_id: string;
  recipe?: Recipe;  
  scheduled_date: string;
  notification_time?: string;
  cooking_duration?: number;
  completed: boolean;
  notes?: string;
}

export interface Menu {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  user_id: string;
  recipes: MenuRecipeItem[];
}

export interface MenuWithRecipes extends Omit<Menu, 'recipes'> {
  recipes: Recipe[];
}

export type CreateMenuDTO = Omit<Menu, 'id' | 'created_at' | 'user_id'>;

export interface MenuNotification {
  id: string;
  menu_id: string;
  recipe_id: string;
  scheduled_for: string;
  title: string;
  body: string;
  is_read: boolean;
} 