import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { FAB } from 'react-native-paper';
import { useRecipeViewModel } from '../hooks/useRecipeViewModel';
import { Recipe } from '../models/Recipe';
import { RootStackParamList } from '../navigation/types';

interface RecipeDetailScreenProps {
  route: {
    params: {
      recipe: Recipe;
    };
  };
}

export const RecipeDetailScreen = observer(({ route }: RecipeDetailScreenProps) => {
  const { recipe } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const viewModel = useRecipeViewModel();

  const handleFavoritePress = () => {
    viewModel.toggleFavorite(recipe.id);
  };

  const handleEditPress = () => {
    navigation.navigate('EditRecipe', { recipe });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.image }} style={styles.image} />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <MaterialIcons
              name={recipe.is_favorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={recipe.is_favorite ? '#FF6B6B' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.category}>{recipe.category}</Text>

          <Text style={styles.sectionTitle}>Nguyên liệu</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <Text key={index} style={styles.ingredient}>
              • {ingredient.amount} {ingredient.unit} {ingredient.name}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Các bước thực hiện</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionContainer}>
              <Text style={styles.stepNumber}>{instruction.step}</Text>
              <Text style={styles.instruction}>{instruction.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="pencil"
        onPress={handleEditPress}
        color="white"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
  },
  ingredient: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    lineHeight: 24,
  },
  instructionContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B386',
    marginRight: 12,
    width: 24,
  },
  instruction: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#00B386',
  },
}); 