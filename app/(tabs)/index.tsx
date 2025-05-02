import { RecipeCard } from '@/components/RecipeCard';
import { RecipeFilter } from '@/components/RecipeFilter';
import { supabase } from '@/config/supabase';
import { Recipe } from '@/models/Recipe';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Searchbar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const categories = ['Tất cả', 'Buổi sáng', 'Buổi trưa', 'Buổi tối'];

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory]);

  const fetchRecipes = async () => {
    let query = supabase.from('recipes').select('*');
    
    if (selectedCategory !== 'Tất cả') {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching recipes:', error);
      return;
    }
    setRecipes(data || []);
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFavorite = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('recipes')
      .update({ is_favorite: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating favorite status:', error);
      return;
    }

    setRecipes(recipes.map(recipe =>
      recipe.id === id ? { ...recipe, is_favorite: !currentStatus } : recipe
    ));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Searchbar
          placeholder="Tìm kiếm công thức..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <RecipeFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </View>

      <FlatList
        data={filteredRecipes}
        renderItem={({ item }) => (
          <RecipeCard
            id={item.id}
            title={item.title}
            image={item.image}
            cookingTime={item.cooking_time}
            rating={item.rating || 0}
            isFavorite={item.is_favorite}
            onFavoritePress={() => toggleFavorite(item.id, item.is_favorite)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    marginVertical: 8,
    elevation: 2,
  },
  list: {
    padding: 8,
  },
});
