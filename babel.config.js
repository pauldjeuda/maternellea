module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@':             './src',
          '@components':   './src/components',
          '@features':     './src/features',
          '@navigation':   './src/navigation',
          '@store':        './src/store',
          '@services':     './src/services',
          '@theme':        './src/theme',
          '@types':        './src/types',
          '@utils':        './src/utils',
          '@hooks':        './src/hooks',
          '@constants':    './src/constants',
          '@assets':       './src/assets',
          '@config':       './src/config',
          '@providers':    './src/providers',
        },
      },
    ],
    'react-native-reanimated/plugin', // Must be last
  ],
};
