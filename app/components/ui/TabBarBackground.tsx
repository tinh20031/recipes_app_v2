import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function TabBarBackground() {
  const theme = useTheme();

  if (Platform.OS === 'ios') {
    return <BlurView intensity={80} style={StyleSheet.absoluteFill} />;
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: theme.colors.elevation.level2 },
      ]}
    />
  );
} 