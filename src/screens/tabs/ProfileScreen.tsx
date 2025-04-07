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
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface Game {
  id: string;
  name: string;
  genre: string;
  platform: string;
  image_url: string;
  description: string;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  game_preferences: {
    gameTypes: ('competitive' | 'casual' | 'coop')[];
    playStyle: ('aggressive' | 'defensive' | 'balanced')[];
  };
  stats: {
    [gameId: string]: {
      rank?: string;
      level?: number;
      winRate?: number;
      playTime?: number;
    };
  };
}

const ProfileScreen = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          games (
            id,
            name,
            genre,
            platform,
            image_url,
            description
          )
        `)
        .eq('user_id', user.id);

      if (gamesError) throw gamesError;

      setProfile(profileData);
      setGames(userGames.map(ug => ug.games));
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

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Reload profile after update
      await loadProfileAndGames();
      Alert.alert('Success', 'Profile updated successfully');
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
        base64: true,
      });

      if (!result.canceled) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        // Upload image to Supabase Storage
        const filePath = `${user.id}/avatar.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, {
            uri: result.assets[0].uri,
            type: 'image/jpeg',
            name: 'avatar.jpg',
          }, {
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update profile with new avatar URL
        await handleUpdateProfile({ avatar_url: publicUrl });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image');
    }
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
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
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
          <Text style={styles.displayName}>{profile?.display_name || 'Add Display Name'}</Text>
          <Text style={styles.username}>@{profile?.username}</Text>
        </View>
      </LinearGradient>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#7B2CBF" />
            <Text style={styles.sectionTitle}>Bio</Text>
          </View>
          <Text style={styles.bio}>{profile?.bio || 'No bio yet'}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="game-controller" size={24} color="#7B2CBF" />
            <Text style={styles.sectionTitle}>Game Preferences</Text>
          </View>
          <View style={styles.preferencesContainer}>
            {profile?.game_preferences?.gameTypes?.map((type, index) => (
              <LinearGradient
                key={index}
                colors={['#7B2CBF', '#2196F3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.preferenceTag}
              >
                <Text style={styles.preferenceText}>{type}</Text>
              </LinearGradient>
            )) || <Text style={styles.emptyText}>No game preferences set</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy" size={24} color="#7B2CBF" />
            <Text style={styles.sectionTitle}>Play Style</Text>
          </View>
          <View style={styles.preferencesContainer}>
            {profile?.game_preferences?.playStyle?.map((style, index) => (
              <LinearGradient
                key={index}
                colors={['#2196F3', '#7B2CBF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.preferenceTag}
              >
                <Text style={styles.preferenceText}>{style}</Text>
              </LinearGradient>
            )) || <Text style={styles.emptyText}>No play style set</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="apps" size={24} color="#7B2CBF" />
            <Text style={styles.sectionTitle}>Games</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gamesContainer}>
            {games.length > 0 ? (
              games.map((game) => (
                <TouchableOpacity key={game.id} style={styles.gameCard}>
                  <Image source={{ uri: game.image_url }} style={styles.gameImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gameOverlay}
                  >
                    <Text style={styles.gameName}>{game.name}</Text>
                    {profile?.stats?.[game.id] && (
                      <View style={styles.gameStats}>
                        <Text style={styles.statText}>Level: {profile.stats[game.id].level}</Text>
                        {profile.stats[game.id].rank && (
                          <Text style={styles.statText}>Rank: {profile.stats[game.id].rank}</Text>
                        )}
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No games added yet</Text>
            )}
          </ScrollView>
        </View>
      </View>
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
  bio: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
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
  gameStats: {
    flexDirection: 'row',
    gap: 10,
  },
  statText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
});

export default ProfileScreen; 