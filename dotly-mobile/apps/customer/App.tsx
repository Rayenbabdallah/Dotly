import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { CustomerNavigator } from './src/navigation/CustomerNavigator';

export default function App() {
  return (
    <AuthProvider>
      <CustomerNavigator />
      <StatusBar barStyle="dark-content" />
    </AuthProvider>
  );
}
