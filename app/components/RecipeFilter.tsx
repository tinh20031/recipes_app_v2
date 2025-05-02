import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

interface RecipeFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const RecipeFilter: React.FC<RecipeFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {categories.map((category) => (
          <Chip
            key={category}
            selected={category === selectedCategory}
            onPress={() => onSelectCategory(category)}
            style={[
              styles.chip,
              category === selectedCategory && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            textStyle={[
              styles.chipText,
              category === selectedCategory && styles.selectedChipText,
            ]}
          >
            {category}
          </Chip>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 20,
  },
  chipText: {
    fontSize: 14,
  },
  selectedChipText: {
    color: 'white',
  },
}); 