import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, TextInput, useTheme } from 'react-native-paper';

interface RecipeFormProps {
  onSubmit: (recipe: {
    title: string;
    category: string;
    cookingTime: string;
    ingredients: string[];
    instructions: string[];
    image: string;
    date: Date;
  }) => void;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [image, setImage] = useState('');
  const [date, setDate] = useState(new Date());

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const updateIngredient = (text: string, index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = text;
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const updateInstruction = (text: string, index: number) => {
    const newInstructions = [...instructions];
    newInstructions[index] = text;
    setInstructions(newInstructions);
  };

  const handleSubmit = () => {
    onSubmit({
      title,
      category,
      cookingTime,
      ingredients: ingredients.filter(Boolean),
      instructions: instructions.filter(Boolean),
      image,
      date,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Button
        mode="outlined"
        onPress={pickImage}
        style={styles.imageButton}
        icon="camera"
      >
        Chọn ảnh
      </Button>

      <TextInput
        label="Tên món"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        label="Phân loại"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />

      <TextInput
        label="Thời gian nấu (phút)"
        value={cookingTime}
        onChangeText={setCookingTime}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.section}>
        <Button
          mode="contained-tonal"
          onPress={addIngredient}
          style={styles.addButton}
        >
          Thêm nguyên liệu
        </Button>
        {ingredients.map((ingredient, index) => (
          <TextInput
            key={index}
            label={`Nguyên liệu ${index + 1}`}
            value={ingredient}
            onChangeText={(text) => updateIngredient(text, index)}
            style={styles.input}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Button
          mode="contained-tonal"
          onPress={addInstruction}
          style={styles.addButton}
        >
          Thêm bước
        </Button>
        {instructions.map((instruction, index) => (
          <TextInput
            key={index}
            label={`Bước ${index + 1}`}
            value={instruction}
            onChangeText={(text) => updateInstruction(text, index)}
            style={styles.input}
            multiline
          />
        ))}
      </View>

      <DateTimePicker
        value={date}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          if (selectedDate) {
            setDate(selectedDate);
          }
        }}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
      >
        Lưu công thức
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  imageButton: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  addButton: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
}); 