import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';

interface RecipeCardProps {
  id: string;
  title: string;
  image: string;
  cookingTime: number;
  rating: number;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  image,
  cookingTime,
  rating,
  isFavorite = false,
  onFavoritePress,
}) => {
  const theme = useTheme();

  return (
    <Link href={`/recipe/${id}`} asChild>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: image }} style={styles.image} />
        <View style={styles.ratingContainer}>
          <Text style={[styles.rating, { color: theme.colors.primary }]}>
            {rating.toFixed(1)}
          </Text>
        </View>
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          iconColor={isFavorite ? theme.colors.error : theme.colors.text}
          style={styles.favoriteButton}
          onPress={onFavoritePress}
        />
        <Card.Content style={styles.content}>
          <Text variant="titleMedium" numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.timeContainer}>
            <IconButton
              icon="clock-outline"
              size={16}
              iconColor={theme.colors.primary}
            />
            <Text variant="bodySmall">{cookingTime} phút</Text>
          </View>
        </Card.Content>
      </Card>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    height: 150,
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
  },
  rating: {
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  content: {
    paddingVertical: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 