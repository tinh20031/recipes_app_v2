import { supabase } from '@/config/supabase';
import { Recipe } from '@/models/Recipe';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Snackbar, Text } from 'react-native-paper';

export default function AllRecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchRecipes = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .order('datetime', { ascending: false });

      if (fetchError) throw fetchError;
      setRecipes(data || []);
    } catch (err) {
      setError('Failed to load recipes');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecipes(false);
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <Card 
      style={styles.card}
      onPress={() => router.push({
        pathname: "/screens/RecipeDetailScreen",
        params: { id: item.id }
      })}
    >
      <Card.Cover 
        source={{ uri: item.image }}
        style={styles.cardImage} 
      />
      <Card.Title title={item.title} subtitle={item.category} />
      <Card.Actions>
        <Button 
          mode="outlined"
          onPress={() => router.push({
            pathname: "/screens/CreateMenuScreen",
            params: { recipeId: item.id }
          })}
        >
          Add to Menu
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text>No recipes found</Text>
          </View>
        )}
      />
      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        action={{
          label: 'Retry',
          onPress: () => fetchRecipes(),
        }}>
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardImage: {
    height: 200,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 