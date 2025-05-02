import { RecipeCard } from '@/components/RecipeCard';
import { useRecipes } from '@/hooks/useRecipes';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Chip, Searchbar, Text, useTheme } from 'react-native-paper';

export default function HomeScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner'];

  const {
    recipes,
    loading,
    error,
    refreshing,
    fetchRecipes,
    toggleFavorite,
    searchRecipes,
    refresh
  } = useRecipes();

  useEffect(() => {
    fetchRecipes({ category: selectedCategory });
  }, [selectedCategory, fetchRecipes]);

  const filteredRecipes = searchRecipes(searchQuery);

  const handleFavoriteChange = (recipeId: string, isFavorite: boolean) => {
    toggleFavorite(recipeId);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search recipes"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.chip,
              selectedCategory === category && styles.selectedChip
            ]}
            mode="flat"
          >
            {category}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filteredRecipes}
        renderItem={({ item }) => (
          <RecipeCard 
            recipe={item}
            onFavoriteChange={handleFavoriteChange}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.recipeList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text>No recipes found</Text>
          </View>
        )}
      />

      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  chip: {
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedChip: {
    backgroundColor: '#e0e0e0',
  },
  recipeList: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 16,
  },
});
