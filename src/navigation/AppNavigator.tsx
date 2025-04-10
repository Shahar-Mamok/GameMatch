import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SwipeScreen from '../screens/SwipeScreen';
import ChatsScreen from '../screens/ChatsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Swipe" 
        component={SwipeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Chats" 
        component={ChatsScreen}
        options={{ 
          title: 'השיחות שלי',
          headerStyle: {
            backgroundColor: '#0d0d0d',
          },
          headerTintColor: '#e600ff',
        }}
      />
    </Stack.Navigator>
  );
} 