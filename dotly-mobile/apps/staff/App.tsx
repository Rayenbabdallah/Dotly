import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { StaffNavigator } from './src/navigation/StaffNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StaffNavigator />
      <StatusBar barStyle="dark-content" />
    </AuthProvider>
  );
}
