import React from 'react';
import { StyleSheet } from 'react-native';
import AllMenusScreen from '../screens/AllMenusScreen';

export default function MenusScreen() {
  return <AllMenusScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 