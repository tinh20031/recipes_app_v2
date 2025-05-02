import { Stack } from 'expo-router';
import React from 'react';
import MenuFormScreen from '../../screens/MenuFormScreen';

export default function EditMenuScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Menu',
          presentation: 'modal',
        }}
      />
      <MenuFormScreen />
    </>
  );
} 