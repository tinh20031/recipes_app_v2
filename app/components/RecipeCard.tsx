import { supabase } from '@/config/supabase';
import { Recipe } from '@/models/Recipe';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Card, IconButton, Snackbar } from 'react-native-paper';

interface RecipeCardProps {
  recipe: Recipe;
  onFavoriteChange?: (recipeId: string, isFavorite: boolean) => void;
}

export function RecipeCard({ recipe, onFavoriteChange }: RecipeCardProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(recipe.is_favorite);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFavoriteToggle = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('recipes')
        .update({ is_favorite: !isFavorite })
        .eq('id', recipe.id);

      if (updateError) throw updateError;

      setIsFavorite(!isFavorite);
      onFavoriteChange?.(recipe.id, !isFavorite);
    } catch (err) {
      setError('Failed to update favorite status');
      setIsFavorite(isFavorite); // Revert state on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card 
        style={styles.card}
        onPress={() => router.push({
          pathname: "/screens/RecipeDetailScreen",
          params: { id: recipe.id }
        })}
      >
        <Card.Cover 
          source={{ uri: recipe.image }} 
          style={styles.cardImage}
        />
        <Card.Title
          title={recipe.title}
          subtitle={recipe.category}
          right={(props) => (
            <IconButton
              {...props}
              icon={isFavorite ? 'heart' : 'heart-outline'}
              onPress={handleFavoriteToggle}
              disabled={isLoading}
              iconColor={isFavorite ? '#e91e63' : undefined}
            />
          )}
        />
      </Card>
      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        action={{
          label: 'Dismiss',
          onPress: () => setError(''),
        }}>
        {error}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardImage: {
    height: 200,
  },
}); 