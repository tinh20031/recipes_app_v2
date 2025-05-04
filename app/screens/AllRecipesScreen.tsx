import { supabase } from '@/config/supabase';
import { useRecipes } from '@/hooks/useRecipes';
import { Recipe } from '@/models/Recipe';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';

export default function AllRecipesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { refresh: refreshParam } = useLocalSearchParams();
  const { recipes, loading, error, refresh, fetchRecipes } = useRecipes();

  // Refresh data when screen comes into focus or when refresh param is present
  useFocusEffect(
    React.useCallback(() => {
      fetchRecipes();
    }, [])
  );

  useEffect(() => {
    if (refreshParam === 'true') {
      fetchRecipes();
      // Remove the refresh param from URL
      router.setParams({ refresh: undefined });
    }
  }, [refreshParam]);

  useEffect(() => {
    // Subscribe to recipe changes
    const subscription = supabase
      .channel('recipes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recipes'
        },
        () => {
          // Refresh recipes when any change occurs
          fetchRecipes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleEditRecipe = (recipe: Recipe) => {
    router.push(`/(tabs)/edit-recipe/${recipe.id}`);
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;
      // No need to manually refresh as the subscription will handle it
    } catch (err) {
      console.error('Error deleting recipe:', err);
    }
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge">{item.title}</Text>
        <Text variant="bodyMedium">{item.category}</Text>
        <Text variant="bodySmall">Thời gian nấu: {item.cooking_time} phút</Text>
        <Text variant="bodySmall">Khẩu phần: {item.servings}</Text>
      </Card.Content>
      <Card.Actions>
        <IconButton
          icon="pencil"
          onPress={() => handleEditRecipe(item)}
        />
        <IconButton
          icon="delete"
          onPress={() => handleDeleteRecipe(item.id)}
        />
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Tất cả công thức</Text>
      
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
            />
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
}); 