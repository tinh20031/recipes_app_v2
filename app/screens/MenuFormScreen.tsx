import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, List, Modal, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { RecipeSelector } from '../components/RecipeSelector';
import { useRecipes } from '../hooks/useRecipes';
import { CreateMenuDTO, MenuRecipeItem } from '../models/Menu';
import { Recipe } from '../models/Recipe';
import { MenuViewModel } from '../viewmodels/MenuViewModel';

const menuViewModel = new MenuViewModel();

export const MenuFormScreen = observer(() => {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { recipes: availableRecipes, loading: loadingRecipes } = useRecipes();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [recipes, setRecipes] = useState<MenuRecipeItem[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeDate, setRecipeDate] = useState(new Date());
  const [recipeTime, setRecipeTime] = useState(new Date());
  const [showRecipeDatePicker, setShowRecipeDatePicker] = useState(false);
  const [showRecipeTimePicker, setShowRecipeTimePicker] = useState(false);
  const [cookingDuration, setCookingDuration] = useState('');

  useEffect(() => {
    if (isEditing) {
      const menu = menuViewModel.menus.find(m => m.id === id);
      if (menu) {
        setName(menu.name);
        setDescription(menu.description || '');
        setStartDate(new Date(menu.startDate));
        setEndDate(new Date(menu.endDate));
        setRecipes(menu.recipes);
      }
    }
  }, [id]);

  const handleSave = async () => {
    const menuData: CreateMenuDTO = {
      name,
      description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      recipes,
      isActive: true,
    };

    if (isEditing) {
      await menuViewModel.updateMenu(id, menuData);
    } else {
      await menuViewModel.createMenu(menuData);
    }

    router.back();
  };

  const handleAddRecipe = () => {
    if (selectedRecipe) {
      const newRecipe: MenuRecipeItem = {
        recipeId: selectedRecipe.id,
        recipe: selectedRecipe,
        scheduledDate: recipeDate.toISOString(),
        notificationTime: `${recipeTime.getHours().toString().padStart(2, '0')}:${recipeTime.getMinutes().toString().padStart(2, '0')}`,
        cookingDuration: parseInt(cookingDuration) || undefined,
        completed: false,
      };

      setRecipes([...recipes, newRecipe]);
      setShowRecipeModal(false);
      setSelectedRecipe(null);
      setCookingDuration('');
    }
  };

  const handleRemoveRecipe = (recipeId: string, scheduledDate: string) => {
    setRecipes(recipes.filter(r => 
      !(r.recipeId === recipeId && r.scheduledDate === scheduledDate)
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="Menu Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.input}
      />

      <View style={styles.dateContainer}>
        <Button
          onPress={() => setShowStartDatePicker(true)}
          mode="outlined"
          style={styles.dateButton}
        >
          Start Date: {startDate.toLocaleDateString()}
        </Button>

        <Button
          onPress={() => setShowEndDatePicker(true)}
          mode="outlined"
          style={styles.dateButton}
        >
          End Date: {endDate.toLocaleDateString()}
        </Button>
      </View>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={(event, date) => {
            setShowStartDatePicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          onChange={(event, date) => {
            setShowEndDatePicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>Recipes</Text>

      {recipes.map((recipe, index) => (
        <List.Item
          key={`${recipe.recipeId}-${recipe.scheduledDate}`}
          title={recipe.recipe?.name}
          description={`${new Date(recipe.scheduledDate).toLocaleDateString()} at ${recipe.notificationTime}`}
          left={props => <List.Icon {...props} icon="food" />}
          right={props => (
            <IconButton
              {...props}
              icon="delete"
              onPress={() => handleRemoveRecipe(recipe.recipeId, recipe.scheduledDate)}
            />
          )}
        />
      ))}

      <Button
        mode="contained"
        onPress={() => setShowRecipeModal(true)}
        style={styles.addButton}
      >
        Add Recipe
      </Button>

      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.saveButton}
      >
        {isEditing ? 'Update Menu' : 'Create Menu'}
      </Button>

      <Portal>
        <Modal
          visible={showRecipeModal}
          onDismiss={() => setShowRecipeModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>Add Recipe to Menu</Text>

          <RecipeSelector
            recipes={availableRecipes}
            onSelectRecipe={setSelectedRecipe}
            selectedRecipe={selectedRecipe}
          />

          <Button
            onPress={() => setShowRecipeDatePicker(true)}
            mode="outlined"
            style={styles.modalButton}
          >
            Date: {recipeDate.toLocaleDateString()}
          </Button>

          <Button
            onPress={() => setShowRecipeTimePicker(true)}
            mode="outlined"
            style={styles.modalButton}
          >
            Notification Time: {recipeTime.toLocaleTimeString()}
          </Button>

          <TextInput
            label="Cooking Duration (minutes)"
            value={cookingDuration}
            onChangeText={setCookingDuration}
            keyboardType="numeric"
            style={styles.modalInput}
          />

          {showRecipeDatePicker && (
            <DateTimePicker
              value={recipeDate}
              mode="date"
              onChange={(event, date) => {
                setShowRecipeDatePicker(false);
                if (date) setRecipeDate(date);
              }}
            />
          )}

          {showRecipeTimePicker && (
            <DateTimePicker
              value={recipeTime}
              mode="time"
              onChange={(event, date) => {
                setShowRecipeTimePicker(false);
                if (date) setRecipeTime(date);
              }}
            />
          )}

          <View style={styles.modalActions}>
            <Button onPress={() => setShowRecipeModal(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleAddRecipe}
              disabled={!selectedRecipe}
            >
              Add
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  addButton: {
    marginTop: 16,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalButton: {
    marginVertical: 8,
  },
  modalInput: {
    marginVertical: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
});

export default MenuFormScreen; 