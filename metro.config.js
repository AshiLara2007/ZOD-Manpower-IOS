const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Remove console logs in production
config.transformer.minifierConfig = {
  compress: {
    drop_console: true,
    drop_debugger: true,
  },
};

// Enable tree shaking
config.transformer.optimizer = {
  treeshake: true,
  modules: true,
};

module.exports = config;