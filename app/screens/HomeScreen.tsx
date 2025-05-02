import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native';
import { FAB } from 'react-native-paper';
import { CategoryFilter } from '../components/CategoryFilter';
import { RecipeCard } from '../components/RecipeCard';
import { SearchBar } from '../components/SearchBar';
import { useRecipeViewModel } from '../hooks/useRecipeViewModel';
import { Recipe } from '../models/Recipe';
import { RootStackParamList } from '../navigation/types';

export const HomeScreen = observer(() => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const viewModel = useRecipeViewModel();

  useEffect(() => {
    viewModel.fetchRecipes();
  }, []);

  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleFavoritePress = (recipeId: string) => {
    viewModel.toggleFavorite(recipeId);
  };

  const handleRefresh = () => {
    viewModel.fetchRecipes();
  };

  const handleAddRecipe = () => {
    navigation.navigate('AddRecipe');
  };

  if (viewModel.loading && !viewModel.recipes.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00B386" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={viewModel.searchQuery}
        onChangeText={(text) => viewModel.setSearchQuery(text)}
      />
      <CategoryFilter
        categories={viewModel.categories}
        selectedCategory={viewModel.selectedCategory}
        onSelectCategory={(category) => viewModel.setSelectedCategory(category)}
      />
      <FlatList
        data={viewModel.filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => handleRecipePress(item)}
            onFavoritePress={() => handleFavoritePress(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={viewModel.loading}
            onRefresh={handleRefresh}
            colors={['#00B386']}
          />
        }
      />
      <FAB
        style={styles.fab}
        icon="plus"
        color="white"
        onPress={handleAddRecipe}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#00B386',
  },
}); 