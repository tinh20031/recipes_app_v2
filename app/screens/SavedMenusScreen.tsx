import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function SavedMenusScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Thực đơn đã lưu</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 