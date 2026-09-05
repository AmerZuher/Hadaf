const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');


/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude native build directories from the watcher (not JS packages' own
// build/ output, which Metro needs to resolve, e.g. expo-router/build/*).
// Anchored to the project root so this doesn't also match unrelated
// node_modules folders that happen to be named "android"/"ios"
// (e.g. expo-symbols/build/android/).
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
config.resolver.blockList = [
  /node_modules\/expo-modules-core\/expo-module-gradle-plugin\/.*/,
  new RegExp(`^${escapeRegExp(path.join(__dirname, 'android'))}/.*`),
  new RegExp(`^${escapeRegExp(path.join(__dirname, 'ios'))}/.*`),
];

module.exports = config;
