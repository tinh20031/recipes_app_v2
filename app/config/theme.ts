import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  customFontFamily: {
    regular: {
      fontFamily: 'SpaceMono',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'SpaceMono',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'SpaceMono',
      fontWeight: 'bold',
    },
  },
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2AAF7F',
    secondary: '#f1c40f',
    error: '#e74c3c',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#2C3E50',
    placeholder: '#95A5A6',
  },
  fonts: configureFonts({config: fontConfig}),
  roundness: 12,
}; 