import { Stack } from 'expo-router';
import React from 'react';
import MenuFormScreen from '../../screens/MenuFormScreen';

export default function CreateMenuScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Menu',
          presentation: 'modal',
        }}
      />
      <MenuFormScreen />
    </>
  );
} 