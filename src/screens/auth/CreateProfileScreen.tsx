import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { RootStackScreenProps } from '../../types/navigation';

export const CreateProfileScreen = ({ navigation }: RootStackScreenProps<'CreateProfile'>) => {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateProfile = async () => {
    try {
      setLoading(true);

      if (!username.trim()) {
        Alert.alert('Error', 'Username is required');
        return;
      }

      // TODO: Implement profile creation logic
      // For now, just navigate to Home
      navigation.navigate('Home', { screen: 'Profile' });
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Create Your Profile</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.text.secondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Bio (optional)"
          placeholderTextColor={colors.text.secondary}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreateProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Profile...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.darker,
  },
  form: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.background.dark,
    borderRadius: 8,
    padding: 16,
    color: colors.text.primary,
    fontSize: 16,
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 