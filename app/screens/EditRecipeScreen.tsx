import { useNavigation, useRoute } from '@react-navigation/native';
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
    Dialog,
    IconButton,
    Portal,
    Text,
    TextInput,
} from 'react-native-paper';
import { useRecipeViewModel } from '../hooks/useRecipeViewModel';
import { Recipe } from '../models/Recipe';
import { RootStackParamList } from '../navigation/types';

type RouteParams = {
  recipe: Recipe;
};

export const EditRecipeScreen = observer(() => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { recipe } = route.params as RouteParams;
  const viewModel = useRecipeViewModel();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(recipe.title);
  const [category, setCategory] = useState(recipe.category);
  const [ingredients, setIngredients] = useState(recipe.ingredients);
  const [instructions, setInstructions] = useState(recipe.instructions);
  const [image, setImage] = useState(recipe.image);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      newInstructions.forEach((instruction, i) => {
        instruction.step = i + 1;
      });
      setInstructions(newInstructions);
    }
  };

  const handleSubmit = async () => {
    if (!title || !category) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
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
      let imageUrl = image;
      
      // Nếu image là URI local (mới chọn), upload ảnh mới
      if (image !== recipe.image) {
        imageUrl = await viewModel.uploadImage(image);
      }

      await viewModel.updateRecipe(recipe.id, {
        title,
        category,
        ingredients,
        instructions,
        image: imageUrl,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật công thức. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await viewModel.deleteRecipe(recipe.id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa công thức. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          <Image source={{ uri: image }} style={styles.image} />
          <View style={styles.imageOverlay}>
            <IconButton icon="camera" size={32} color="white" />
          </View>
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

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={[styles.button, styles.saveButton]}
              loading={loading}
              disabled={loading}
            >
              Lưu thay đổi
            </Button>
            <Button
              mode="contained"
              onPress={() => setShowDeleteDialog(true)}
              style={[styles.button, styles.deleteButton]}
              disabled={loading}
              buttonColor="#FF6B6B"
            >
              Xóa công thức
            </Button>
          </View>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Xác nhận xóa</Dialog.Title>
          <Dialog.Content>
            <Text>Bạn có chắc chắn muốn xóa công thức này?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Hủy</Button>
            <Button onPress={handleDelete} textColor="#FF6B6B">Xóa</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
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
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
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
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#00B386',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
}); 