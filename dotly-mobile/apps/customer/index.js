import { ExpoRoot } from 'expo-router';

const ctx = require.context('./', true, /^\.\/[^/]+\.tsx?$/);
export const unstable_Root = ExpoRoot({ ctx });
