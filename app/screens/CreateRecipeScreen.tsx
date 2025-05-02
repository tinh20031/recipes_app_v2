import { supabase } from '@/config/supabase';
import { CreateRecipeDTO } from '@/models/Recipe';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, SegmentedButtons, TextInput, Title, useTheme } from 'react-native-paper';

const BUCKET_NAME = 'recipes';
const MEAL_TYPES = [
  { value: 'Breakfast', label: 'Breakfast' },
  { value: 'Lunch', label: 'Lunch' },
  { value: 'Dinner', label: 'Dinner' },
];

export default function CreateRecipeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<CreateRecipeDTO>({
    title: '',
    category: '',
    ingredients: [],
    instructions: [],
    image: '',
    is_favorite: false,
    datetime: new Date().toISOString(),
  });
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;

      const fileContent = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, fileContent, {
          contentType: `image/${fileExt}`,
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return urlData?.publicURL || null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Need permission to access image library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });

      if (!result.canceled) {
        setLoading(true);
        try {
          const file = result.assets[0];
          const publicURL = await uploadImageToSupabase(file.uri);
          
          if (publicURL) {
            setLocalImageUri(file.uri);
            setRecipe(prev => ({ ...prev, image: publicURL }));
          } else {
            throw new Error('Failed to upload image');
          }
        } catch (error) {
          console.error('Error uploading:', error);
          Alert.alert(
            'Upload Error',
            'Failed to upload image. Please try again later.'
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Error',
        'Failed to pick image. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, '']);
  const updateIngredient = (text: string, index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = text;
    setIngredients(newIngredients);
  };

  const addInstruction = () => setInstructions([...instructions, '']);
  const updateInstruction = (text: string, index: number) => {
    const newInstructions = [...instructions];
    newInstructions[index] = text;
    setInstructions(newInstructions);
  };

  const handleSubmit = async () => {
    if (!recipe.title || !recipe.category || !recipe.image) {
      Alert.alert('Error', 'Please fill in all fields and add an image');
      return;
    }

    setLoading(true);
    try {
      const recipeData = {
        ...recipe,
        ingredients: ingredients.filter(Boolean),
        instructions: instructions.filter(Boolean),
      };

      const { error } = await supabase
        .from('recipes')
        .insert(recipeData);

      if (error) throw error;
      router.back();
    } catch (error) {
      console.error('Error creating recipe:', error);
      Alert.alert('Error', 'Could not create recipe. Please try again later.');
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
      
      <View style={styles.imageContainer}>
        {localImageUri ? (
          <Image source={{ uri: localImageUri }} style={styles.image} />
        ) : (
          <Button
            mode="outlined"
            onPress={pickImage}
            style={styles.imageButton}
            icon="camera"
            loading={loading}
            disabled={loading}
          >
            Choose Image
          </Button>
        )}
      </View>

      <TextInput
        label="Recipe Name"
        value={recipe.title}
        onChangeText={(text) => setRecipe(prev => ({ ...prev, title: text }))}
        style={styles.input}
      />

      <Title style={styles.sectionTitle}>Category</Title>
      <SegmentedButtons
        value={recipe.category}
        onValueChange={(value) => setRecipe(prev => ({ ...prev, category: value }))}
        buttons={MEAL_TYPES}
        style={styles.segmentedButtons}
      />

      <Title style={styles.sectionTitle}>Ingredients</Title>
      {ingredients.map((ingredient, index) => (
        <TextInput
          key={index}
          label={`Ingredient ${index + 1}`}
          value={ingredient}
          onChangeText={(text) => updateIngredient(text, index)}
          style={styles.input}
        />
      ))}
      <Button
        mode="outlined"
        onPress={addIngredient}
        style={styles.addButton}
        icon="plus"
      >
        Add Ingredient
      </Button>

      <Title style={styles.sectionTitle}>Instructions</Title>
      {instructions.map((instruction, index) => (
        <TextInput
          key={index}
          label={`Step ${index + 1}`}
          value={instruction}
          onChangeText={(text) => updateInstruction(text, index)}
          style={styles.input}
          multiline
        />
      ))}
      <Button
        mode="outlined"
        onPress={addInstruction}
        style={styles.addButton}
        icon="plus"
      >
        Add Step
      </Button>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        loading={loading}
        disabled={loading}
      >
        Save Recipe
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  imageContainer: {
    height: 200,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageButton: {
    width: '100%',
    height: '100%',
  },
  input: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  addButton: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
}); 