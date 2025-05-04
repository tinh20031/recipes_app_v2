import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Avatar, List, Searchbar } from 'react-native-paper';
import { Recipe } from '../models/Recipe';

interface RecipeSelectorProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  selectedRecipe?: Recipe | null;
}

export const RecipeSelector = ({ recipes, onSelectRecipe, selectedRecipe }: RecipeSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <List.Item
      title={item.title}
      description={item.category}
      left={props => 
        item.image ? (
          <Avatar.Image {...props} size={40} source={{ uri: item.image }} />
        ) : (
          <Avatar.Icon {...props} size={40} icon="food" />
        )
      }
      onPress={() => onSelectRecipe(item)}
      style={[
        styles.recipeItem,
        selectedRecipe?.id === item.id && styles.selectedRecipe
      ]}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search recipes"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  recipeItem: {
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedRecipe: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default RecipeSelector; 