import { supabase } from '@/config/supabase';
import { Recipe } from '@/models/Recipe';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, TextInput, Title, useTheme } from 'react-native-paper';

export default function CreateMenuScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAvailableRecipes();
  }, []);

  const fetchAvailableRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('title');

      if (error) throw error;
      setAvailableRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      Alert.alert('Error', 'Failed to load available recipes');
    }
  };

  const handleAddRecipe = (recipe: Recipe) => {
    setSelectedRecipes([...selectedRecipes, recipe]);
  };

  const handleRemoveRecipe = (recipeId: string) => {
    setSelectedRecipes(selectedRecipes.filter(r => r.id !== recipeId));
  };

  const handleCreateMenu = async () => {
    if (!menuName) {
      Alert.alert('Error', 'Please enter a menu name');
      return;
    }

    if (selectedRecipes.length === 0) {
      Alert.alert('Error', 'Please select at least one recipe');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('menus')
        .insert({
          name: menuName,
          recipes: selectedRecipes.map(r => r.id),
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      Alert.alert('Success', 'Menu created successfully');
      router.back();
    } catch (error) {
      console.error('Error creating menu:', error);
      Alert.alert('Error', 'Failed to create menu');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = availableRecipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedRecipes.some(r => r.id === recipe.id)
  );

  return (
    <ScrollView style={styles.container}>
      <IconButton
        icon="close"
        style={styles.closeButton}
        onPress={() => router.back()}
      />

      <Title style={styles.title}>Create New Menu</Title>

      <TextInput
        label="Menu Name"
        value={menuName}
        onChangeText={setMenuName}
        style={styles.input}
      />

      <Title style={styles.subtitle}>Selected Recipes</Title>
      <ScrollView horizontal style={styles.selectedRecipes}>
        {selectedRecipes.map(recipe => (
          <Chip
            key={recipe.id}
            style={styles.chip}
            onClose={() => handleRemoveRecipe(recipe.id)}
            closeIcon="close"
          >
            {recipe.title}
          </Chip>
        ))}
      </ScrollView>

      <Title style={styles.subtitle}>Available Recipes</Title>
      <TextInput
        label="Search Recipes"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
        left={<TextInput.Icon icon="magnify" />}
      />

      <View style={styles.recipeList}>
        {filteredRecipes.map(recipe => (
          <Card
            key={recipe.id}
            style={styles.recipeCard}
            onPress={() => handleAddRecipe(recipe)}
          >
            <Card.Cover source={{ uri: recipe.image }} style={styles.recipeImage} />
            <Card.Title
              title={recipe.title}
              subtitle={recipe.category}
              left={props => (
                <MaterialCommunityIcons
                  name="food"
                  size={24}
                  color={theme.colors.primary}
                />
              )}
            />
          </Card>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={handleCreateMenu}
        style={styles.createButton}
        loading={loading}
        disabled={loading}
      >
        Create Menu
      </Button>
    </ScrollView>
  );
}

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
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  selectedRecipes: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  recipeList: {
    gap: 16,
  },
  recipeCard: {
    marginBottom: 16,
  },
  recipeImage: {
    height: 120,
  },
  createButton: {
    marginTop: 24,
    marginBottom: 32,
  },
}); 