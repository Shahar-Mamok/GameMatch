import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.navigate('Welcome');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>הגדרות</Text>
      
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>התראות</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#666', true: '#e600ff' }}
            thumbColor={notifications ? '#fff' : '#999'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>מצב לילה</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#666', true: '#e600ff' }}
            thumbColor={darkMode ? '#fff' : '#999'}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>התנתק</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e600ff',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingText: {
    fontSize: 16,
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#e600ff',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 