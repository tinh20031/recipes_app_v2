import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Button,
    IconButton,
    Text,
    TextInput
} from 'react-native-paper';
import { useRecipeViewModel } from '../hooks/useRecipeViewModel';
import { CreateRecipeDTO } from '../models/Recipe';
import { RootStackParamList } from '../navigation/types';

export const AddRecipeScreen = observer(() => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const viewModel = useRecipeViewModel();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState<{ name: string; amount: string; unit: string }[]>([
    { name: '', amount: '', unit: '' },
  ]);
  const [instructions, setInstructions] = useState<{ step: number; description: string }[]>([
    { step: 1, description: '' },
  ]);
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const updateIngredient = (index: number, field: keyof typeof ingredients[0], value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const addInstruction = () => {
    setInstructions([
      ...instructions,
      { step: instructions.length + 1, description: '' },
    ]);
  };

  const updateInstruction = (index: number, description: string) => {
    const newInstructions = [...instructions];
    newInstructions[index].description = description;
    setInstructions(newInstructions);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index);
      // Cập nhật lại số thứ tự
      newInstructions.forEach((instruction, i) => {
        instruction.step = i + 1;
      });
      setInstructions(newInstructions);
    }
  };

  const handleSubmit = async () => {
    if (!title || !category || !image) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin và thêm ảnh');
      return;
    }

    if (ingredients.some(i => !i.name || !i.amount || !i.unit)) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin nguyên liệu');
      return;
    }

    if (instructions.some(i => !i.description)) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các bước thực hiện');
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await viewModel.uploadImage(image);
      
      const recipe: CreateRecipeDTO = {
        title,
        category,
        ingredients,
        instructions,
        image: imageUrl,
      };

      await viewModel.addRecipe(recipe);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm công thức. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <IconButton icon="camera" size={40} />
            <Text>Thêm ảnh</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        <TextInput
          label="Tên món"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          label="Danh mục"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>Nguyên liệu</Text>
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientRow}>
            <TextInput
              label="Tên"
              value={ingredient.name}
              onChangeText={(value) => updateIngredient(index, 'name', value)}
              style={[styles.input, styles.ingredientName]}
            />
            <TextInput
              label="Số lượng"
              value={ingredient.amount}
              onChangeText={(value) => updateIngredient(index, 'amount', value)}
              style={[styles.input, styles.ingredientAmount]}
              keyboardType="numeric"
            />
            <TextInput
              label="Đơn vị"
              value={ingredient.unit}
              onChangeText={(value) => updateIngredient(index, 'unit', value)}
              style={[styles.input, styles.ingredientUnit]}
            />
            <IconButton
              icon="delete"
              onPress={() => removeIngredient(index)}
              disabled={ingredients.length === 1}
            />
          </View>
        ))}
        <Button
          mode="outlined"
          onPress={addIngredient}
          style={styles.addButton}
        >
          Thêm nguyên liệu
        </Button>

        <Text style={styles.sectionTitle}>Các bước thực hiện</Text>
        {instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionRow}>
            <Text style={styles.stepNumber}>{instruction.step}</Text>
            <TextInput
              label="Mô tả"
              value={instruction.description}
              onChangeText={(value) => updateInstruction(index, value)}
              style={[styles.input, styles.instructionInput]}
              multiline
            />
            <IconButton
              icon="delete"
              onPress={() => removeInstruction(index)}
              disabled={instructions.length === 1}
            />
          </View>
        ))}
        <Button
          mode="outlined"
          onPress={addInstruction}
          style={styles.addButton}
        >
          Thêm bước
        </Button>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading}
        >
          Thêm công thức
        </Button>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientName: {
    flex: 2,
    marginRight: 8,
  },
  ingredientAmount: {
    flex: 1,
    marginRight: 8,
  },
  ingredientUnit: {
    flex: 1,
    marginRight: 8,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    marginRight: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  instructionInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
}); 