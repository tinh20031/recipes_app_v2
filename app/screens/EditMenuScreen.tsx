import { supabase } from '@/config/supabase';
import { Recipe } from '@/models/Recipe';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, TextInput, Title, useTheme } from 'react-native-paper';

export default function EditMenuScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [menuName, setMenuName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchMenuDetails();
    fetchAvailableRecipes();
  }, [id]);

  const fetchMenuDetails = async () => {
    setLoading(true);
    try {
      // Lấy thông tin menu
      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .select('*')
        .eq('id', id)
        .single();
      if (menuError) throw menuError;
      setMenuName(menu.name || '');
      setDescription(menu.description || '');
      setStartDate(menu.start_date || '');
      setEndDate(menu.end_date || '');

      // Lấy danh sách recipe của menu
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
        setSelectedRecipes(recipeData || []);
      } else {
        setSelectedRecipes([]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không lấy được thông tin menu');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('title');
      if (error) throw error;
      setAvailableRecipes(data || []);
    } catch (error) {
      Alert.alert('Lỗi', 'Không lấy được danh sách công thức');
    }
  };

  const handleAddRecipe = (recipe: Recipe) => {
    setSelectedRecipes([...selectedRecipes, recipe]);
  };

  const handleRemoveRecipe = (recipeId: string) => {
    setSelectedRecipes(selectedRecipes.filter(r => r.id !== recipeId));
  };

  const handleSave = async () => {
    if (!menuName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên menu');
      return;
    }
    if (!startDate) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày bắt đầu');
      return;
    }
    if (!endDate) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày kết thúc');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      Alert.alert('Lỗi', 'Ngày bắt đầu phải trước ngày kết thúc');
      return;
    }
    if (selectedRecipes.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một công thức');
      return;
    }

    setLoading(true);
    try {
      // Cập nhật thông tin menu
      const { error: updateError } = await supabase
        .from('menus')
        .update({
          name: menuName.trim(),
          description: description.trim(),
          start_date: startDate,
          end_date: endDate
        })
        .eq('id', id);
      if (updateError) throw updateError;

      // Xóa hết các recipe cũ
      await supabase.from('menu_recipes').delete().eq('menu_id', id);

      // Thêm lại các recipe mới
      const newMenuRecipes = selectedRecipes.map(recipe => ({
        menu_id: id,
        recipe_id: recipe.id
      }));
      if (newMenuRecipes.length > 0) {
        const { error: insertError } = await supabase
          .from('menu_recipes')
          .insert(newMenuRecipes);
        if (insertError) throw insertError;
      }

      Alert.alert('Thành công', 'Menu đã được cập nhật', [
        { text: 'OK', onPress: () => router.push({
          pathname: '/screens/MenuDetailScreen',
          params: { id: id as string, refresh: 'true' }
        })}
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Cập nhật menu thất bại');
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

      <Title style={styles.title}>Chỉnh sửa Menu</Title>

      <TextInput
        label="Tên Menu"
        value={menuName}
        onChangeText={setMenuName}
        style={styles.input}
      />

      <TextInput
        label="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.input}
      />

      <TextInput
        label="Ngày bắt đầu (yyyy-mm-dd)"
        value={startDate}
        onChangeText={setStartDate}
        style={styles.input}
      />

      <TextInput
        label="Ngày kết thúc (yyyy-mm-dd)"
        value={endDate}
        onChangeText={setEndDate}
        style={styles.input}
      />

      <Title style={styles.subtitle}>Công thức đã chọn</Title>
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

      <Title style={styles.subtitle}>Chọn thêm công thức</Title>
      <TextInput
        label="Tìm kiếm công thức"
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
        onPress={handleSave}
        style={styles.createButton}
        loading={loading}
        disabled={loading}
      >
        Lưu thay đổi
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  selectedRecipes: {
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
  },
  recipeList: {
    marginBottom: 16,
  },
  recipeCard: {
    marginBottom: 8,
  },
  recipeImage: {
    height: 150,
  },
  createButton: {
    marginTop: 16,
    marginBottom: 32,
  },
}); 