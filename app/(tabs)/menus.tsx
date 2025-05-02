import { Stack } from 'expo-router';
import React from 'react';
import MenuScreen from '../screens/MenuScreen';

export default function MenusTab() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Menus',
        }}
      />
      <MenuScreen />
    </>
  );
} 