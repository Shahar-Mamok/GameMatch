import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SwipeScreen } from './src/screens/SwipeScreen';
import { supabase } from './src/lib/supabase';
import { Text, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState('Checking connection...');

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data } = await supabase.auth.getSession();
        setConnectionStatus('Connected to Supabase! 🎉');
      } catch (error) {
        setConnectionStatus(`Connection failed: ${error.message}`);
      }
    }

    checkConnection();
  }, []);

  return (
    <NavigationContainer>
      <View style={{ position: 'absolute', top: 50, left: 0, right: 0, zIndex: 1000 }}>
        <Text style={{ textAlign: 'center', color: connectionStatus.includes('Connected') ? 'green' : 'red', padding: 10 }}>
          {connectionStatus}
        </Text>
      </View>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Swipe" component={SwipeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 