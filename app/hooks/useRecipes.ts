import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { Recipe } from '../models/Recipe';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('name');

      if (error) throw error;

      setRecipes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .insert([recipe])
        .select()
        .single();

      if (error) throw error;

      setRecipes(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setRecipes(prev =>
        prev.map(recipe => (recipe.id === id ? { ...recipe, ...data } : recipe))
      );
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    clearError,
  };
}; 