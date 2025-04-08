import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { User, Game, UserGame } from '../../types';

const { width } = Dimensions.get('window');

// Add type for icon names
type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface UserProfile {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  bio: string | null;
  game_preferences: {
    gameTypes: string[];
    playStyle: string[];
  } | null;
  stats: Record<string, any> | null;
  display_name: string | null;
  genre: string | null;
  platform: string | null;
}

interface UserGameResponse {
  game_id: string;
  games: Game;
}

const ProfileScreen = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [gamePreferences, setGamePreferences] = useState<string[]>([]);
  const [playStyle, setPlayStyle] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [genre, setGenre] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');

  useEffect(() => {
    loadProfileAndGames();
  }, []);

  const loadProfileAndGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Load user's games
      const { data: userGames, error: gamesError } = await supabase
        .from('user_games')
        .select(`
          game_id,
          games (*)
        `)
        .eq('user_id', user.id) as { data: UserGameResponse[] | null, error: any };

      if (gamesError) throw gamesError;

      setProfile(profileData);
      // Now userGames is properly typed
      setGames((userGames || []).map(ug => ug.games));
      
      setDisplayName(profileData.display_name || '');
      setUsername(profileData.username || '');
      setBio(profileData.bio || '');
      setAvatarUrl(profileData.avatar_url);
      setGamePreferences(profileData.game_preferences?.gameTypes || []);
      setPlayStyle(profileData.game_preferences?.playStyle || []);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setError(error.message || 'Failed to load profile');
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfileAndGames();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Update users table with all fields
      const { error: userError } = await supabase
        .from('users')
        .update({
          display_name: displayName,
          username,
          bio,
          avatar_url: avatarUrl,
          game_preferences: {
            gameTypes: gamePreferences,
            playStyle: playStyle
          },
          genre: games[0]?.genre || null, // Take genre from first game if exists
          platform: games[0]?.platform || null, // Take platform from first game if exists
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (userError) throw userError;

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        // Convert image to blob
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();

        // Upload image to Supabase Storage
        const filePath = `${user.id}/avatar.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, blob, {
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        setAvatarUrl(publicUrl);
        
        // Update user profile with new avatar URL
        const { error: updateError } = await supabase
          .from('users')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const renderEditableSection = (
    title: string,
    icon: IconName,
    value: string,
    setValue: (value: string) => void,
    placeholder: string,
    multiline: boolean = false
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color="#7B2CBF" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {isEditing ? (
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          multiline={multiline}
          mode="outlined"
          outlineColor="#7B2CBF"
          activeOutlineColor="#2196F3"
        />
      ) : (
        <Text style={styles.sectionText}>{value || `No ${title.toLowerCase()} yet`}</Text>
      )}
    </View>
  );

  const renderPreferencesSection = (
    title: string,
    icon: IconName,
    preferences: string[],
    setPreferences: (prefs: string[]) => void,
    options: string[]
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color="#7B2CBF" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {isEditing ? (
        <View style={styles.preferencesGrid}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.preferenceOption,
                preferences.includes(option) && styles.preferenceOptionSelected
              ]}
              onPress={() => {
                if (preferences.includes(option)) {
                  setPreferences(preferences.filter(p => p !== option));
                } else {
                  setPreferences([...preferences, option]);
                }
              }}
            >
              <Text style={[
                styles.preferenceOptionText,
                preferences.includes(option) && styles.preferenceOptionTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.preferencesContainer}>
          {preferences.map((pref, index) => (
            <LinearGradient
              key={index}
              colors={['#7B2CBF', '#2196F3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.preferenceTag}
            >
              <Text style={styles.preferenceText}>{pref}</Text>
            </LinearGradient>
          ))}
          {preferences.length === 0 && (
            <Text style={styles.emptyText}>No {title.toLowerCase()} set</Text>
          )}
        </View>
      )}
    </View>
  );

  const addGame = () => {
    setIsAddingGame(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7B2CBF" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#7B2CBF']}
        />
      }
    >
      <LinearGradient
        colors={['#7B2CBF', '#2196F3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleImagePick} style={styles.avatarOuterContainer}>
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#fff" />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          {isEditing ? (
            <TextInput
              style={styles.displayNameInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Add Display Name"
              mode="flat"
              underlineColor="transparent"
              placeholderTextColor="rgba(255,255,255,0.7)"
              theme={{ colors: { text: '#fff' } }}
            />
          ) : (
            <Text style={styles.displayName}>{displayName || 'Add Display Name'}</Text>
          )}
          <Text style={styles.username}>@{username}</Text>
        </View>
      </LinearGradient>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.content}>
        {renderEditableSection('Bio', 'information-circle', bio, setBio, 'Tell us about yourself...', true)}
        
        {renderPreferencesSection(
          'Game Preferences',
          'game-controller',
          gamePreferences,
          setGamePreferences,
          ['Competitive', 'Casual', 'Co-op', 'Story-driven', 'Multiplayer', 'Solo']
        )}

        {renderPreferencesSection(
          'Play Style',
          'trophy',
          playStyle,
          setPlayStyle,
          ['Aggressive', 'Defensive', 'Balanced', 'Support', 'Leader', 'Follower']
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="apps" size={24} color="#7B2CBF" />
            <Text style={styles.sectionTitle}>Games</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gamesContainer}>
            {games.length > 0 ? (
              games.map((game) => (
                <TouchableOpacity key={game.id} style={styles.gameCard}>
                  <Image source={{ uri: 'https://via.placeholder.com/200x300' }} style={styles.gameImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gameOverlay}
                  >
                    <Text style={styles.gameName}>{game.name}</Text>
                    <View style={styles.gameTags}>
                      {game.genre && <Text style={styles.gameTag}>{game.genre}</Text>}
                      {game.platform && game.platform.map((p, i) => (
                        <Text key={i} style={styles.gameTag}>{p}</Text>
                      ))}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No games added yet</Text>
            )}
          </ScrollView>
          {isEditing && (
            <Button 
              mode="contained" 
              onPress={addGame}
              style={styles.addButton}
              icon="plus"
            >
              Add Game
            </Button>
          )}
        </View>

        <Button
          mode="contained"
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          style={[styles.editButton, isEditing && styles.saveButton]}
          icon={isEditing ? "check" : "pencil"}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </View>

      {isAddingGame && (
        <View style={styles.modalOverlay}>
          <View style={styles.addGameModal}>
            <Text style={styles.modalTitle}>Add New Game</Text>
            <TextInput
              style={styles.input}
              value={newGameName}
              onChangeText={setNewGameName}
              placeholder="Game name"
              mode="outlined"
              outlineColor="#7B2CBF"
              activeOutlineColor="#2196F3"
            />
            <TextInput
              style={styles.input}
              value={genre}
              onChangeText={setGenre}
              placeholder="Genre (e.g. FPS, RPG, MOBA)"
              mode="outlined"
              outlineColor="#7B2CBF"
              activeOutlineColor="#2196F3"
            />
            <TextInput
              style={styles.input}
              value={platform}
              onChangeText={setPlatform}
              placeholder="Platform (e.g. PC, PS5, Xbox)"
              mode="outlined"
              outlineColor="#7B2CBF"
              activeOutlineColor="#2196F3"
            />
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined" 
                onPress={() => {
                  setIsAddingGame(false);
                  setNewGameName('');
                  setGenre('');
                  setPlatform('');
                }}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained"
                onPress={async () => {
                  if (newGameName) {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                      await supabase
                        .from('users')
                        .update({
                          genre,
                          platform,
                        })
                        .eq('id', user.id);
                    }
                    setGenre('');
                    setPlatform('');
                    setIsAddingGame(false);
                    setNewGameName('');
                  }
                }}
                style={[styles.modalButton, styles.modalButtonPrimary]}
                disabled={!newGameName}
              >
                Add Game
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
  },
  avatarOuterContainer: {
    marginBottom: 15,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#7B2CBF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7B2CBF',
    padding: 8,
    borderRadius: 20,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  displayNameInput: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 100,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  preferenceOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7B2CBF',
  },
  preferenceOptionSelected: {
    backgroundColor: '#7B2CBF',
  },
  preferenceOptionText: {
    color: '#7B2CBF',
    fontSize: 14,
    fontWeight: '500',
  },
  preferenceOptionTextSelected: {
    color: '#fff',
  },
  gamesContainer: {
    marginHorizontal: -5,
  },
  gameCard: {
    width: width * 0.6,
    height: 200,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  gameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  gameName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  gameTags: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 5,
  },
  gameTag: {
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(123, 44, 191, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    margin: 10,
    borderRadius: 5,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontStyle: 'italic',
  },
  addButton: {
    marginTop: 10,
  },
  editButton: {
    marginTop: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addGameModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
  },
  modalButtonPrimary: {
    backgroundColor: '#7B2CBF',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  preferenceTag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  preferenceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProfileScreen; 