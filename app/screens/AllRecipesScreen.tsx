import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function AllRecipesScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Tất cả công thức</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 