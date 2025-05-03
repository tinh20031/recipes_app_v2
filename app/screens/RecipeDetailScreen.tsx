import { supabase } from '@/config/supabase';
import { useRecipeViewModel } from '@/hooks/useRecipeViewModel';
import { Recipe } from '@/models/Recipe';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, IconButton, Text, useTheme } from 'react-native-paper';

const RecipeDetailScreen = observer(() => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'procedure'>('ingredients');
  const theme = useTheme();
  const recipeViewModel = useRecipeViewModel();

  useEffect(() => {
    fetchRecipeDetails();
  }, [id]);

  const fetchRecipeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRecipe(data);
    } catch (err) {
      console.error('Error fetching recipe details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await recipeViewModel.deleteRecipe(id as string);
      router.back();
    } catch (err) {
      console.error('Error deleting recipe:', err);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: "/screens/EditRecipeScreen",
      params: { id }
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Cover source={{ uri: recipe.image }} style={styles.image} />
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="white" />
          <Text style={styles.timeText}>
            {recipe.cooking_time || 20} mins
          </Text>
        </View>
        <Card.Title
          title={recipe.title}
          titleStyle={styles.title}
          subtitle={recipe.category}
          right={(props) => (
            <View style={styles.actionButtons}>
              <IconButton
                {...props}
                icon="pencil"
                onPress={handleEdit}
                iconColor={theme.colors.primary}
              />
              <IconButton
                {...props}
                icon="delete"
                onPress={handleDelete}
                iconColor={theme.colors.error}
              />
            </View>
          )}
        />
      </Card>

      <View style={styles.tabContainer}>
        <Button
          mode={activeTab === 'ingredients' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('ingredients')}
          style={[styles.tabButton, activeTab === 'ingredients' && styles.activeTab]}
        >
          Ingredients
        </Button>
        <Button
          mode={activeTab === 'procedure' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('procedure')}
          style={[styles.tabButton, activeTab === 'procedure' && styles.activeTab]}
        >
          Procedure
        </Button>
      </View>

      <View style={styles.servingInfo}>
        <MaterialCommunityIcons name="account" size={20} color={theme.colors.primary} />
        <Text style={styles.servingText}>{recipe.servings || 1} serving</Text>
        <Text style={styles.itemCount}>
          {activeTab === 'ingredients' 
            ? `${recipe.ingredients?.length || 0} items`
            : `${recipe.instructions?.length || 0} steps`
          }
        </Text>
      </View>

      {activeTab === 'ingredients' ? (
        <View style={styles.ingredientsList}>
          {recipe.ingredients?.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <MaterialCommunityIcons 
                name="food-variant" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={styles.ingredientName}>
                {typeof ingredient === 'string' ? ingredient : ingredient.name}
              </Text>
              {typeof ingredient !== 'string' && (
                <Text style={styles.ingredientAmount}>
                  {ingredient.amount} {ingredient.unit}
                </Text>
              )}
            </View>
          ))}
          {(!recipe.ingredients || recipe.ingredients.length === 0) && (
            <Text style={styles.emptyText}>No ingredients added yet.</Text>
          )}
        </View>
      ) : (
        <View style={styles.procedureList}>
          {recipe.instructions?.map((instruction, index) => (
            <View key={index} style={styles.stepItem}>
              <Chip mode="outlined" style={styles.stepNumber}>
                Step {typeof instruction === 'string' ? index + 1 : instruction.step}
              </Chip>
              <Text style={styles.stepText}>
                {typeof instruction === 'string' ? instruction : instruction.description}
              </Text>
            </View>
          ))}
          {(!recipe.instructions || recipe.instructions.length === 0) && (
            <Text style={styles.emptyText}>No instructions added yet.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 200,
  },
  timeContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  tabButton: {
    flex: 1,
  },
  activeTab: {
    elevation: 2,
  },
  servingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  servingText: {
    flex: 1,
    fontSize: 16,
  },
  itemCount: {
    fontSize: 16,
    opacity: 0.7,
  },
  ingredientsList: {
    padding: 16,
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
  },
  ingredientAmount: {
    fontSize: 16,
    opacity: 0.7,
  },
  procedureList: {
    padding: 16,
    gap: 16,
  },
  stepItem: {
    gap: 8,
  },
  stepNumber: {
    alignSelf: 'flex-start',
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
    padding: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default RecipeDetailScreen; 