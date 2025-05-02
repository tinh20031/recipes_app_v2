import { Recipe } from '@/models/Recipe';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, IconButton } from 'react-native-paper';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const router = useRouter();

  return (
    <Card 
      style={styles.card}
      onPress={() => router.push({
        pathname: "/screens/RecipeDetailScreen",
        params: { id: recipe.id }
      })}
    >
      <Card.Cover source={{ uri: recipe.image }} />
      <Card.Title
        title={recipe.title}
        subtitle={recipe.category}
        right={(props) => (
          <IconButton
            {...props}
            icon={recipe.is_favorite ? 'heart' : 'heart-outline'}
            onPress={() => {/* Handle favorite toggle */}}
          />
        )}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
}); 