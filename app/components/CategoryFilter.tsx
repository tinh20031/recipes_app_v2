import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <TouchableOpacity
        style={[
          styles.categoryButton,
          !selectedCategory && styles.selectedButton,
        ]}
        onPress={() => onSelectCategory(null)}
      >
        <Text
          style={[
            styles.categoryText,
            !selectedCategory && styles.selectedText,
          ]}
        >
          Tất cả
        </Text>
      </TouchableOpacity>

      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.selectedButton,
          ]}
          onPress={() => onSelectCategory(category)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedText,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 50,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  selectedButton: {
    backgroundColor: '#00B386',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedText: {
    color: 'white',
    fontWeight: '600',
  },
}); 