import { RecipeCard } from '@/components/RecipeCard';
import { useRecipes } from '@/hooks/useRecipes';
import { useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Searchbar, Text } from 'react-native-paper';

export default function SavedScreen() {
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState('');
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

  // Fetch saved recipes when screen is focused or mounted
  useEffect(() => {
    if (isFocused) {
      fetchSavedRecipes();
    }
  }, [isFocused]);

  const fetchSavedRecipes = useCallback(async () => {
    await fetchRecipes({
      showLoading: true,
      filter: (query) => query.eq('is_favorite', true)
    });
  }, [fetchRecipes]);

  const handleFavoriteChange = async (recipeId: string, isFavorite: boolean) => {
    await toggleFavorite(recipeId);
    if (!isFavorite) {
      // Refresh the list after unfavoriting
      fetchSavedRecipes();
    }
  };

  const filteredRecipes = searchRecipes(searchQuery);

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
        placeholder="Search saved recipes"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredRecipes}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onFavoriteChange={handleFavoriteChange}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchSavedRecipes}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text>No saved recipes found</Text>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>
        )}
      />
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
  list: {
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
  },
}); 