// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure asset extensions are properly configured
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp', 'svg');

module.exports = config;

