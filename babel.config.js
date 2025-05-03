module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      '@babel/plugin-transform-optional-chaining',
      '@babel/plugin-transform-object-rest-spread',
      '@babel/plugin-transform-async-generator-functions',
      'react-native-reanimated/plugin',
      'module:react-native-dotenv',
      [
        'module-resolver',
        {
          root: ['./app'],
          alias: {
            '@': './app',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        },
      ],
    ],
  };
}; 