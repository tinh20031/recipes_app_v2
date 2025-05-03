import { useRecipeViewModel } from '@/hooks/useRecipeViewModel';
import { useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Snackbar, Text } from 'react-native-paper';

export default observer(function AllRecipesScreen() {
  const router = useRouter();
  const recipeViewModel = useRecipeViewModel();

  useEffect(() => {
    recipeViewModel.fetchRecipes();
  }, []);

  const onRefresh = () => {
    recipeViewModel.fetchRecipes();
  };

  if (recipeViewModel.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (recipeViewModel.error) {
    return (
      <View style={styles.centered}>
        <Text>{recipeViewModel.error}</Text>
        <Button onPress={onRefresh}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipeViewModel.filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => router.push(`/screens/RecipeDetailScreen?id=${item.id}`)}
          >
            <Card.Cover source={{ uri: item.image }} />
            <Card.Title
              title={item.title}
              subtitle={item.category}
            />
            <Card.Content>
              <Text>Cooking Time: {item.cooking_time || 20} mins</Text>
              <Text>Servings: {item.servings || 1}</Text>
            </Card.Content>
          </Card>
        )}
        refreshControl={
          <RefreshControl
            refreshing={recipeViewModel.loading}
            onRefresh={onRefresh}
          />
        }
      />
      <Snackbar
        visible={!!recipeViewModel.error}
        onDismiss={() => recipeViewModel.setError(null)}
        action={{
          label: 'Dismiss',
          onPress: () => recipeViewModel.setError(null),
        }}
      >
        {recipeViewModel.error}
      </Snackbar>
    </View>
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
  card: {
    margin: 8,
  },
}); 