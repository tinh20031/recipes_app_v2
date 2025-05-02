import { supabase } from '@/config/supabase';
import { Recipe } from '@/models/Recipe';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { useCallback, useState } from 'react';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecipes = useCallback(async (options?: { 
    category?: string;
    showLoading?: boolean;
    filter?: (query: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, any>;
  }) => {
    const { category, showLoading = true, filter } = options || {};
    if (showLoading) setLoading(true);
    setError('');

    try {
      let query = supabase
        .from('recipes')
        .select('*')
        .order('datetime', { ascending: false });

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      if (filter) {
        query = filter(query);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      
      setRecipes(data || []);
    } catch (err) {
      setError('Failed to load recipes');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    // Optimistic update
    const updatedRecipes = recipes.map(r => 
      r.id === recipeId ? { ...r, is_favorite: !r.is_favorite } : r
    );
    setRecipes(updatedRecipes);

    try {
      const { error: updateError } = await supabase
        .from('recipes')
        .update({ is_favorite: !recipe.is_favorite })
        .eq('id', recipeId);

      if (updateError) throw updateError;
    } catch (err) {
      // Revert on error
      setRecipes(recipes);
      setError('Failed to update favorite status');
      console.error('Error updating favorite:', err);
    }
  }, [recipes]);

  const searchRecipes = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return recipes;
    
    const term = searchTerm.toLowerCase();
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(term) ||
      recipe.category.toLowerCase().includes(term)
    );
  }, [recipes]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchRecipes({ showLoading: false });
  }, [fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    refreshing,
    fetchRecipes,
    toggleFavorite,
    searchRecipes,
    refresh,
  };
} 