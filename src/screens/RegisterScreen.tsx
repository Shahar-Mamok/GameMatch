import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const theme = useTheme();

  async function handleRegister() {
    if (!email || !password || !username) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('Starting registration with:', { email, username });

      // Create auth user with email confirmation
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!authData?.user) {
        throw new Error('No user data returned');
      }

      console.log('Auth successful, user created:', authData.user.id);

      // Create user profile using service role (if available) or wait for email verification
      try {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email.toLowerCase(),
            username,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Continue even if profile creation fails - it can be created later
        }
      } catch (profileErr) {
        console.error('Profile creation attempt failed:', profileErr);
        // Continue with the registration process
      }

      // Show success message
      setError('Registration successful! Please check your email to verify your account before logging in.');
      
      // Navigate to login after a delay
      setTimeout(() => {
        navigation.navigate('Login' as never);
      }, 3000);

    } catch (err: any) {
      console.error('Registration error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
        stack: err.stack
      });
      setError(err.message || 'An unexpected error occurred during registration');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
        
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        >
          Register
        </Button>

        <View style={styles.footer}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    padding: 5,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: '#2196F3',
  },
}); 