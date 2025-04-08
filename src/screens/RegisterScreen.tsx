import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  async function handleRegister() {
    if (!email || !password || !username) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }

    try {
      setLoading(true);

      // יצירת משתמש
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (error) throw error;

      // יצירת פרופיל
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email.toLowerCase(),
          username
        });

      if (profileError) throw profileError;

      Alert.alert('הצלחה', 'ההרשמה הושלמה בהצלחה!', [
        { text: 'OK', onPress: () => navigation.navigate('Login' as never) }
      ]);

    } catch (err: any) {
      Alert.alert('שגיאה', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        label="שם משתמש"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        label="אימייל"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="סיסמה"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        style={styles.button}
      >
        הרשמה
      </Button>
      <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
        <Text style={styles.link}>יש לך כבר חשבון? התחבר</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  link: {
    marginTop: 15,
    textAlign: 'center',
    color: '#2196F3',
  },
}); 