import { supabase } from '@/config/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Card, FAB, IconButton, Modal, Portal, Text, useTheme } from 'react-native-paper';

interface Menu {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  recipeCount: number;
}

export default function AllMenusScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const { data: menusData, error: menusError } = await supabase
        .from('menus')
        .select('*')
        .order('start_date', { ascending: false });
      if (menusError) throw menusError;
      const { data: menuRecipesData, error: menuRecipesError } = await supabase
        .from('menu_recipes')
        .select('menu_id');
      if (menuRecipesError) throw menuRecipesError;
      const recipeCountMap: Record<string, number> = {};
      (menuRecipesData || []).forEach((mr: { menu_id: string }) => {
        recipeCountMap[mr.menu_id] = (recipeCountMap[mr.menu_id] || 0) + 1;
      });
      const menusWithCount: Menu[] = (menusData || []).map((menu: any) => ({
        ...menu,
        recipeCount: recipeCountMap[menu.id] || 0,
      }));
      setMenus(menusWithCount);
    } catch (error) {
      console.error('Error fetching menus:', error);
      Alert.alert('Error', 'Failed to load menus');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMenus();
  };

  const handleDeleteMenu = async () => {
    if (!selectedMenu) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', selectedMenu.id);

      if (error) throw error;

      setMenus(menus.filter(menu => menu.id !== selectedMenu.id));
      setShowDeleteModal(false);
      setSelectedMenu(null);
      Alert.alert('Success', 'Menu deleted successfully');
    } catch (error) {
      console.error('Error deleting menu:', error);
      Alert.alert('Error', 'Failed to delete menu');
    } finally {
      setLoading(false);
    }
  };

  const renderMenuItem = ({ item }: { item: Menu }) => (
    <Card
      style={styles.menuCard}
      onPress={() => router.push(`/screens/MenuDetailScreen?id=${item.id}`)}
      onLongPress={() => {
        setSelectedMenu(item);
        setShowDeleteModal(true);
      }}
    >
      <Card.Content>
        <View style={styles.menuHeader}>
          <Text variant="titleMedium">{item.name}</Text>
          <IconButton
            icon="dots-vertical"
            onPress={() => {
              setSelectedMenu(item);
              setShowDeleteModal(true);
            }}
          />
        </View>
        <Text variant="bodyMedium">
          {item.recipeCount} recipes
        </Text>
        <Text variant="bodySmall" style={styles.date}>
          Start: {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'N/A'}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={menus}
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
        onPress={() => router.push('/screens/CreateMenuScreen')}
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
}

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
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    marginTop: 4,
    color: '#666',
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