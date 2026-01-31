import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { RegisterScreen } from '../screens/RegisterScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { QRScreen } from '../screens/QRScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          title: 'My Wallet',
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💰</Text>,
        }}
      />
      <Tab.Screen
        name="QRCode"
        component={QRScreen}
        options={{
          title: 'My QR Code',
          tabBarLabel: 'QR Code',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📱</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export function CustomerNavigator() {
  const { isLoading, isSignedIn } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isSignedIn ? (
          <Stack.Screen name="Main" component={CustomerTabs} />
        ) : (
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              animationEnabled: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const { Text } = require('react-native');
