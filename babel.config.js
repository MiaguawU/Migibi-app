module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['import', { libraryName: '@ant-design/react-native' }], // Tu plugin de Ant Design
      'react-native-reanimated/plugin', // EL PLUGIN DE REANIMATED VA AL FINAL
    ],
  };
};