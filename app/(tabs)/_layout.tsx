import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, Portal, useTheme } from 'react-native-paper';

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState('all-recipes');

  // Only show FAB in all-recipes tab
  const showFAB = currentTab === 'all-recipes';

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.outline,
          headerShown: true,
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarHideOnKeyboard: true
        }}
        screenListeners={{
          state: (e) => {
            const route = e.data.state.routes[e.data.state.index];
            setCurrentTab(route.name);
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'Saved',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="bookmark" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="all-recipes"
          options={{
            title: 'All Recipes',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="food-variant" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="bell" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {showFAB && (
        <Portal>
          <FAB.Groupx
            open={isMenuVisible}
            visible
            icon={isMenuVisible ? 'close' : 'plus'}
            actions={[
              {
                icon: 'plus',
                label: 'Create Recipe',
                onPress: () => router.push('/screens/CreateRecipeScreen'),
              },
              {
                icon: 'food',
                label: 'Create Menu',
                onPress: () => router.push('/screens/CreateMenuScreen'),
              },
            ]}
            onStateChange={({ open }) => setIsMenuVisible(open)}
            style={styles.fab}
          />
        </Portal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
