import * as FileSystem from 'expo-file-system';
import { makeAutoObservable, runInAction } from 'mobx';
import { supabase } from '../config/supabase';
import { CreateRecipeDTO, Recipe } from '../models/Recipe';

export class RecipeViewModel {
  recipes: Recipe[] = [];
  loading: boolean = false;
  error: string | null = null;
  searchQuery: string = '';
  selectedCategory: string | null = null;
  categories: string[] = [];

  constructor() {
    makeAutoObservable(this);
    this.fetchCategories();
  }

  setLoading(status: boolean) {
    this.loading = status;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  setSelectedCategory(category: string | null) {
    this.selectedCategory = category;
  }

  setRecipes(recipes: Recipe[]) {
    this.recipes = recipes;
  }

  setCategories(categories: string[]) {
    this.categories = categories;
  }

  get filteredRecipes() {
    return this.recipes
      .filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            recipe.category.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesCategory = !this.selectedCategory || recipe.category === this.selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  }

  get favoriteRecipes() {
    return this.recipes.filter(recipe => recipe.is_favorite);
  }

  async fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const uniqueCategories = [...new Set(data.map(item => item.category))];
      runInAction(() => {
        this.setCategories(uniqueCategories);
      });
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to fetch categories');
    }
  }

  async fetchRecipes() {
    try {
      this.setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('datetime', { ascending: false });

      if (error) throw error;

      runInAction(() => {
        this.setRecipes(data);
        this.setLoading(false);
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : 'Failed to fetch recipes');
        this.setLoading(false);
      });
    }
  }

  async addRecipe(recipe: CreateRecipeDTO) {
    try {
      this.setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          ...recipe,
          is_favorite: false,
          datetime: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      runInAction(() => {
        this.recipes.unshift(data);
        this.setLoading(false);
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : 'Failed to add recipe');
        this.setLoading(false);
      });
    }
  }

  async updateRecipe(id: string, updates: Partial<Recipe>) {
    try {
      this.setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      runInAction(() => {
        const index = this.recipes.findIndex(r => r.id === id);
        if (index !== -1) {
          this.recipes[index] = data;
        }
        this.setLoading(false);
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : 'Failed to update recipe');
        this.setLoading(false);
      });
    }
  }

  async deleteRecipe(id: string) {
    try {
      this.setLoading(true);
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      runInAction(() => {
        this.recipes = this.recipes.filter(r => r.id !== id);
        this.setLoading(false);
      });
    } catch (error) {
      runInAction(() => {
        this.setError(error instanceof Error ? error.message : 'Failed to delete recipe');
        this.setLoading(false);
      });
    }
  }

  async toggleFavorite(recipeId: string) {
    try {
      const recipe = this.recipes.find(r => r.id === recipeId);
      if (recipe) {
        await this.updateRecipe(recipeId, {
          is_favorite: !recipe.is_favorite
        });
      }
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to toggle favorite');
    }
  }

  async uploadImage(uri: string): Promise<string> {
    try {
      const fileExt = uri.substring(uri.lastIndexOf('.') + 1);
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data, error } = await supabase.storage
        .from('recipe-images')
        .upload(filePath, base64, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }
} 