import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Card, FAB, Modal, Portal, Text, useTheme } from 'react-native-paper';
import { Menu } from '../models/Menu';
import { MenuViewModel } from '../viewmodels/MenuViewModel';

const menuViewModel = new MenuViewModel();

export const MenuScreen = observer(() => {
  const theme = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    await menuViewModel.fetchMenus();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMenus();
    setRefreshing(false);
  };

  const handleCreateMenu = () => {
    router.push('/menus/create');
  };

  const handleEditMenu = (menu: Menu) => {
    router.push({
      pathname: '/menus/[id]',
      params: { id: menu.id }
    });
  };

  const handleDeleteMenu = async () => {
    if (selectedMenu) {
      await menuViewModel.deleteMenu(selectedMenu.id);
      setShowDeleteModal(false);
      setSelectedMenu(null);
    }
  };

  const renderMenuItem = ({ item }: { item: Menu }) => {
    const activeRecipes = item.recipes.filter(r => !r.completed).length;
    const totalRecipes = item.recipes.length;

    return (
      <Card
        style={styles.menuCard}
        onPress={() => handleEditMenu(item)}
        onLongPress={() => {
          setSelectedMenu(item);
          setShowDeleteModal(true);
        }}
      >
        <Card.Content>
          <Text variant="titleMedium">{item.name}</Text>
          <Text variant="bodyMedium">{item.description}</Text>
          <View style={styles.menuInfo}>
            <Text variant="bodySmall">
              {format(new Date(item.startDate), 'MMM d')} - {format(new Date(item.endDate), 'MMM d, yyyy')}
            </Text>
            <Text variant="bodySmall">
              {activeRecipes} of {totalRecipes} recipes remaining
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={menuViewModel.menus}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleCreateMenu}
      />

      <Portal>
        <Modal
          visible={showDeleteModal}
          onDismiss={() => setShowDeleteModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleMedium">Delete Menu</Text>
          <Text variant="bodyMedium">
            Are you sure you want to delete "{selectedMenu?.name}"? This action cannot be undone.
          </Text>
          <View style={styles.modalActions}>
            <Button onPress={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleDeleteMenu}>
              Delete
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  menuCard: {
    marginBottom: 12,
  },
  menuInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
});

export default MenuScreen; 