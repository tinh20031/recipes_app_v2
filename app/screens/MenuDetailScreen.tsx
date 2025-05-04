import { supabase } from '@/config/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';

interface Menu {
  id: string;
  name: string;
  recipes: string[];
  created_at: string;
}

interface Recipe {
  id: string;
  title: string;
  image: string;
  category: string;
}

export default function MenuDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id, refresh } = useLocalSearchParams();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMenuDetails();
  }, [id, refresh]);

  const fetchMenuDetails = async () => {
    try {
      setLoading(true);
      const { data: menuData, error: menuError } = await supabase
        .from('menus')
        .select('*')
        .eq('id', id)
        .single();

      if (menuError) throw menuError;
      setMenu(menuData);

      const { data: menuRecipes, error: menuRecipesError } = await supabase
        .from('menu_recipes')
        .select('recipe_id')
        .eq('menu_id', id);

      if (menuRecipesError) throw menuRecipesError;

      const recipeIds = (menuRecipes || []).map((mr: any) => mr.recipe_id);

      if (recipeIds.length > 0) {
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('*')
          .in('id', recipeIds);

        if (recipeError) throw recipeError;
        setRecipes(recipeData || []);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching menu details:', error);
      Alert.alert('Error', 'Failed to load menu details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMenuDetails();
  };

  const handleEditMenu = () => {
    router.push({
      pathname: '/screens/EditMenuScreen',
      params: { id: id as string }
    });
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <Card style={styles.recipeCard}>
      <Card.Cover source={{ uri: item.image }} style={styles.recipeImage} />
      <Card.Content>
        <Text variant="titleMedium">{item.title}</Text>
        <Text variant="bodyMedium" style={styles.category}>
          {item.category}
        </Text>
      </Card.Content>
    </Card>
  );

  if (!menu) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">{menu.name}</Text>
        <IconButton
          icon="pencil"
          onPress={handleEditMenu}
        />
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Recipes ({recipes.length})
      </Text>

      <FlatList
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      />
    </View>
  );
}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    padding: 16,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  recipeCard: {
    marginBottom: 12,
  },
  recipeImage: {
    height: 200,
  },
  category: {
    color: '#666',
    marginTop: 4,
  },
}); 