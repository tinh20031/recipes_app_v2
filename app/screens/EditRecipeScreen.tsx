import { supabase } from '@/config/supabase';
import { useRecipeViewModel } from '@/hooks/useRecipeViewModel';
import { Recipe } from '@/models/Recipe';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, TextInput, Title, useTheme } from 'react-native-paper';

const EditRecipeScreen = observer(() => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const recipeViewModel = useRecipeViewModel();
  const [recipe, setRecipe] = useState<Recipe>({
    id: '',
    title: '',
    category: '',
    ingredients: [],
    instructions: [],
    image: '',
    cooking_time: 0,
    servings: 1,
    is_favorite: false,
    datetime: new Date().toISOString(),
  });

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRecipe(data);
    } catch (err) {
      console.error('Error fetching recipe:', err);
      Alert.alert('Error', 'Failed to load recipe');
    }
  };

  const handleUpdate = async () => {
    if (!recipe.title || !recipe.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const updatedRecipe = {
        title: recipe.title,
        category: recipe.category,
        ingredients: recipe.ingredients.map(ing => {
          if (typeof ing === 'string') {
            return { name: ing, amount: 1, unit: 'piece' };
          }
          return ing;
        }),
        instructions: recipe.instructions.map((inst, index) => {
          if (typeof inst === 'string') {
            return { step: index + 1, description: inst };
          }
          return inst;
        }),
        cooking_time: recipe.cooking_time,
        servings: recipe.servings,
      };

      // Update in Supabase
      const { error: updateError } = await supabase
        .from('recipes')
        .update(updatedRecipe)
        .eq('id', id);

      if (updateError) throw updateError;

      // Update in local state
      await recipeViewModel.updateRecipe(id as string, updatedRecipe);
      
      // Navigate back with a flag to refresh
      router.push({
        pathname: '/(tabs)/all-recipes',
        params: { refresh: 'true' }
      });
    } catch (err) {
      console.error('Error updating recipe:', err);
      Alert.alert('Error', 'Failed to update recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <IconButton
        icon="close"
        style={styles.closeButton}
        onPress={() => router.back()}
      />

      <Title style={styles.title}>Edit Recipe</Title>

      <TextInput
        label="Recipe Name"
        value={recipe.title}
        onChangeText={(text) => setRecipe({ ...recipe, title: text })}
        style={styles.input}
      />

      <TextInput
        label="Category"
        value={recipe.category}
        onChangeText={(text) => setRecipe({ ...recipe, category: text })}
        style={styles.input}
      />

      <TextInput
        label="Cooking Time (minutes)"
        value={recipe.cooking_time?.toString()}
        onChangeText={(text) => setRecipe({ ...recipe, cooking_time: parseInt(text) || 0 })}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        label="Servings"
        value={recipe.servings?.toString()}
        onChangeText={(text) => setRecipe({ ...recipe, servings: parseInt(text) || 1 })}
        keyboardType="numeric"
        style={styles.input}
      />

      <Title style={styles.sectionTitle}>Ingredients</Title>
      {recipe.ingredients?.map((ingredient, index) => (
        <View key={index} style={styles.ingredientRow}>
          <TextInput
            value={typeof ingredient === 'string' ? ingredient : ingredient.name}
            onChangeText={(text) => {
              const newIngredients = [...recipe.ingredients];
              if (typeof ingredient === 'string') {
                newIngredients[index] = { name: text, amount: 1, unit: 'piece' };
              } else {
                newIngredients[index] = { ...ingredient, name: text };
              }
              setRecipe({ ...recipe, ingredients: newIngredients });
            }}
            style={styles.ingredientInput}
          />
          <IconButton
            icon="delete"
            onPress={() => {
              const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
              setRecipe({ ...recipe, ingredients: newIngredients });
            }}
          />
        </View>
      ))}
      <Button
        mode="outlined"
        onPress={() => {
          setRecipe({
            ...recipe,
            ingredients: [...recipe.ingredients, { name: '', amount: 1, unit: 'piece' }],
          });
        }}
        style={styles.addButton}
        icon="plus"
      >
        Add Ingredient
      </Button>

      <Title style={styles.sectionTitle}>Instructions</Title>
      {recipe.instructions?.map((instruction, index) => (
        <View key={index} style={styles.instructionRow}>
          <TextInput
            value={typeof instruction === 'string' ? instruction : instruction.description}
            onChangeText={(text) => {
              const newInstructions = [...recipe.instructions];
              if (typeof instruction === 'string') {
                newInstructions[index] = { step: index + 1, description: text };
              } else {
                newInstructions[index] = { ...instruction, description: text };
              }
              setRecipe({ ...recipe, instructions: newInstructions });
            }}
            multiline
            style={styles.instructionInput}
          />
          <IconButton
            icon="delete"
            onPress={() => {
              const newInstructions = recipe.instructions.filter((_, i) => i !== index);
              setRecipe({ ...recipe, instructions: newInstructions });
            }}
          />
        </View>
      ))}
      <Button
        mode="outlined"
        onPress={() => {
          setRecipe({
            ...recipe,
            instructions: [...recipe.instructions, { step: recipe.instructions.length + 1, description: '' }],
          });
        }}
        style={styles.addButton}
        icon="plus"
      >
        Add Step
      </Button>

      <Button
        mode="contained"
        onPress={handleUpdate}
        style={styles.updateButton}
        loading={loading}
        disabled={loading}
      >
        Update Recipe
      </Button>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientInput: {
    flex: 1,
    marginRight: 8,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  instructionInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    marginBottom: 16,
  },
  updateButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});

export default EditRecipeScreen; 