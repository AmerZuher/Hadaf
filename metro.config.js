const { getDefaultConfig } = require('expo/metro-config');


/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude problematic directories from the watcher
config.resolver.blockList = [
  /node_modules\/.*\/build\/.*/,
  /node_modules\/.*\/bin\/.*/,
  /node_modules\/expo-modules-core\/expo-module-gradle-plugin\/.*/,
  /android\/.*/,
  /ios\/.*/,
];

module.exports = config;
