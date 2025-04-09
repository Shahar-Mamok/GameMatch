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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { User, Game, UserGame } from '../../types';
import { Portal, Modal } from 'react-native-paper';


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
  discord_username: string | null;
  steam_username: string | null;
  epic_username: string | null;
}

interface UserGameResponse {
  game_id: string;
  games: Game;
}

const ProfileScreen = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
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
  const [socialAccounts, setSocialAccounts] = useState({
    discord: '',
    steam: '',
    epic: ''
  });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isGameModalVisible, setIsGameModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  useEffect(() => {
    loadProfileAndGames();
    loadAllGames(); 
  }, []);
  const [allGames, setAllGames] = useState<Game[]>([]);

  const loadAllGames = async () => {
    const { data, error } = await supabase.from('games').select('*');
    if (error) {
      console.error('Error loading all games:', error);
    } else {
      setAllGames(data);
    }
  };
  
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
  .eq('user_id', user.id);

if (gamesError) throw gamesError;


      setProfile(profileData);
      // Fix the type issue by properly handling the games object structure
      setGames((userGames || []).map(ug => {
        // Ensure we're getting a single Game object, not an array
        return typeof ug.games === 'object' && !Array.isArray(ug.games) 
          ? ug.games as Game 
          : {} as Game;
      }));
      setSelectedGameIds((userGames || []).map(ug => ug.game_id));

      
      setDisplayName(profileData.display_name || '');
      setUsername(profileData.username || '');
      setBio(profileData.bio || '');
      setAvatarUrl(profileData.avatar_url);
      setGamePreferences(profileData.game_preferences?.gameTypes || []);
      setPlayStyle(profileData.game_preferences?.playStyle || []);
      setSocialAccounts({
        discord: profileData.discord_username || '',
        steam: profileData.steam_username || '',
        epic: profileData.epic_username || ''
      });
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

      // Prepare the profile update data
      const profileUpdate = {
        display_name: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        game_preferences: {
          gameTypes: gamePreferences,
          playStyle: playStyle
        },
        discord_username: socialAccounts.discord.trim(),
        steam_username: socialAccounts.steam.trim(),
        epic_username: socialAccounts.epic.trim(),
        updated_at: new Date().toISOString()
      };

      // Update user profile
      const { error: profileError } = await supabase
        .from('users')
        .update(profileUpdate)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Handle game associations
      // First delete existing associations
      await supabase
        .from('user_games')
        .delete()
        .eq('user_id', user.id);

      // Then add new ones if there are any selected games
      if (selectedGameIds.length > 0) {
        const gameInserts = selectedGameIds.map(gameId => ({
          id: crypto.randomUUID(),
          user_id: user.id,
          game_id: gameId,
          created_at: new Date().toISOString()
        }));

        const { error: gamesError } = await supabase
          .from('user_games')
          .insert(gameInserts);

        if (gamesError) {
          console.error('Error inserting games:', gamesError);
          throw new Error('Failed to update game preferences');
        }
      }

      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [{ text: 'OK', onPress: () => setIsEditing(false) }]
      );

      // Refresh profile data
      await loadProfileAndGames();

      // Ensure we exit edit mode
      setIsEditing(false);

    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditPress = () => {
    if (isEditing) {
      // If we're currently editing, save changes
      handleSave();
    } else {
      // If we're not editing, enter edit mode
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    // Reset all form values to current profile values
    setDisplayName(profile?.display_name || '');
    setUsername(profile?.username || '');
    setBio(profile?.bio || '');
    setGamePreferences(profile?.game_preferences?.gameTypes || []);
    setPlayStyle(profile?.game_preferences?.playStyle || []);
    setSocialAccounts({
      discord: profile?.discord_username || '',
      steam: profile?.steam_username || '',
      epic: profile?.epic_username || ''
    });
    setIsEditing(false);
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

  const handleAddGames = () => {
    setIsGameModalVisible(true);
  };

  const handleGameSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = allGames.filter(game => 
      game.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGames(filtered);
  };

  const GameSelectionModal = () => (
    <Portal>
      <Modal
        visible={isGameModalVisible}
        onDismiss={() => setIsGameModalVisible(false)}
        contentContainerStyle={styles.gameModalContainer}
      >
        <View style={styles.gameModalContent}>
          <Text style={styles.modalTitle}>Select Games</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search games..."
            value={searchQuery}
            onChangeText={handleGameSearch}
            mode="outlined"
          />
          <ScrollView style={styles.gamesList}>
            {(filteredGames.length > 0 ? filteredGames : allGames).map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[
                  styles.gameItem,
                  selectedGameIds.includes(game.id) && styles.selectedGameItem,
                ]}
                onPress={() => {
                  if (selectedGameIds.includes(game.id)) {
                    setSelectedGameIds(prev => prev.filter(id => id !== game.id));
                  } else {
                    setSelectedGameIds(prev => [...prev, game.id]);
                  }
                }}
              >
                <Text style={[
                  styles.gameItemText,
                  selectedGameIds.includes(game.id) && styles.selectedGameItemText
                ]}>
                  {game.name}
                </Text>
                {game.platform && (
                  <Text style={styles.gamePlatform}>
                    {Array.isArray(game.platform) ? game.platform.join(', ') : game.platform}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setIsGameModalVisible(false)}
              style={styles.modalButton}
            >
              Done
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );

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
        {isEditing && (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name="game-controller" size={24} color="#7B2CBF" />
      <Text style={styles.sectionTitle}>Select Games</Text>
    </View>
    <View style={styles.preferencesGrid}>
      {allGames.map((game) => (
        <TouchableOpacity
          key={game.id}
          style={[
            styles.preferenceOption,
            selectedGameIds.includes(game.id) && styles.preferenceOptionSelected
          ]}
          onPress={() => {
            if (selectedGameIds.includes(game.id)) {
              setSelectedGameIds(selectedGameIds.filter(id => id !== game.id));
            } else {
              setSelectedGameIds([...selectedGameIds, game.id]);
            }
          }}
        >
          <Text
            style={[
              styles.preferenceOptionText,
              selectedGameIds.includes(game.id) && styles.preferenceOptionTextSelected
            ]}
          >
            {game.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
)}


        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="link-variant" size={24} color="#7B2CBF" />
            <Text style={styles.sectionTitle}>Gaming Accounts</Text>
          </View>
          {isEditing ? (
            <View>
              <TextInput
                label="Discord Username"
                value={socialAccounts.discord}
                onChangeText={(text) => setSocialAccounts(prev => ({ ...prev, discord: text }))}
                style={styles.input}
              />
              <TextInput
                label="Steam Username"
                value={socialAccounts.steam}
                onChangeText={(text) => setSocialAccounts(prev => ({ ...prev, steam: text }))}
                style={styles.input}
              />
              <TextInput
                label="Epic Username"
                value={socialAccounts.epic}
                onChangeText={(text) => setSocialAccounts(prev => ({ ...prev, epic: text }))}
                style={styles.input}
              />
            </View>
          ) : (
            <View>
              <View style={styles.socialAccountItem}>
                <MaterialCommunityIcons name="discord" size={24} color="#7289DA" />
                <Text style={styles.socialUsername}>{socialAccounts.discord || 'No Discord account linked'}</Text>
              </View>
              <View style={styles.socialAccountItem}>
                <MaterialCommunityIcons name="steam" size={24} color="#00ADEE" />
                <Text style={styles.socialUsername}>{socialAccounts.steam || 'No Steam account linked'}</Text>
              </View>
              <View style={styles.socialAccountItem}>
                <MaterialCommunityIcons name="gamepad" size={24} color="#2F2F2F" />
                <Text style={styles.socialUsername}>{socialAccounts.epic || 'No Epic account linked'}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.editButtonsContainer}>
          {isEditing ? (
            <>
              <Button
                mode="outlined"
                onPress={handleCancelEdit}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveButton}
                loading={loading}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              mode="contained"
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          )}
        </View>
      </View>

      <Portal>
        <Modal
          visible={isEditModalVisible}
          onDismiss={() => setIsEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              style={styles.input}
            />
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
            <TextInput
              label="Bio"
              value={bio}
              onChangeText={setBio}
              style={styles.input}
              multiline
            />
            <TextInput
              label="Discord Username"
              value={socialAccounts.discord}
              onChangeText={(text) => setSocialAccounts(prev => ({ ...prev, discord: text }))}
              style={styles.input}
            />
            <TextInput
              label="Steam Username"
              value={socialAccounts.steam}
              onChangeText={(text) => setSocialAccounts(prev => ({ ...prev, steam: text }))}
              style={styles.input}
            />
            <TextInput
              label="Epic Username"
              value={socialAccounts.epic}
              onChangeText={(text) => setSocialAccounts(prev => ({ ...prev, epic: text }))}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined"
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained"
                onPress={handleSave}
                style={styles.modalButtonPrimary}
              >
                Save Changes
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
      <GameSelectionModal />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
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
    padding: 20,
    paddingTop: 60,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    color: '#4A9EFF',
    marginBottom: 20,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    tintColor: '#7B2CBF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionContent: {
    color: '#6C7A8E',
    fontSize: 16,
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
    color: '#6C7A8E',
    fontSize: 16,
    fontStyle: 'italic',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 12,
    borderColor: '#7B2CBF',
    borderWidth: 1,
  },
  editButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 12,
    backgroundColor: '#7B2CBF',
  },
  saveButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
  modalContainer: {
    backgroundColor: '#1A1A1A',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalContent: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  gamesList: {
    maxHeight: 400,
  },
  gameItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedGameItem: {
    backgroundColor: 'rgba(123, 44, 191, 0.2)',
  },
  gameItemText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedGameItemText: {
    color: '#7B2CBF',
    fontWeight: 'bold',
  },
  gamePlatform: {
    color: '#666',
    fontSize: 14,
  },
  socialAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialUsername: {
    color: '#6C7A8E',
    fontSize: 16,
  },
  gameModalContainer: {
    backgroundColor: '#1A1A1A',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  gameModalContent: {
    flex: 1,
  },
});

export default ProfileScreen; 