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
  start_date: string;
  end_date: string;
  recipes: MenuRecipeItem[];
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