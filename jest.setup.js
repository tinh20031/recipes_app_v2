const mockRecipes = [
  {
    id: '1',
    title: 'Test Recipe 1',
    category: 'Test Category',
    image: 'https://example.com/image1.jpg',
    is_favorite: false,
    datetime: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Test Recipe 2',
    category: 'Another Category',
    image: 'https://example.com/image2.jpg',
    is_favorite: true,
    datetime: '2023-01-02T00:00:00Z',
  },
];

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('@/config/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    then: jest.fn().mockResolvedValue({ data: mockRecipes, error: null }),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
})); 