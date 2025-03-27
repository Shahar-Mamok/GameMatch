import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { MainTabParamList } from '../../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens
const DiscoverScreen = () => (
  <SafeAreaView style={styles.screen}>
    <Text style={styles.text}>Discover Screen</Text>
  </SafeAreaView>
);

const MatchesScreen = () => (
  <SafeAreaView style={styles.screen}>
    <Text style={styles.text}>Matches Screen</Text>
  </SafeAreaView>
);

const ChatScreen = () => (
  <SafeAreaView style={styles.screen}>
    <Text style={styles.text}>Chat Screen</Text>
  </SafeAreaView>
);

const ProfileScreen = () => (
  <SafeAreaView style={styles.screen}>
    <Text style={styles.text}>Profile Screen</Text>
  </SafeAreaView>
);

export const HomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background.dark,
          borderTopColor: colors.background.darker,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        headerStyle: {
          backgroundColor: colors.background.dark,
        },
        headerTintColor: colors.text.primary,
      }}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.darker,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.text.primary,
    fontSize: 18,
  },
}); 