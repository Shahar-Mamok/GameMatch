import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserWithGames } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_CARD_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);

type PlayerCardProps = {
  user: UserWithGames;
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ user }) => {
  return (
    <View style={styles.card}>
      <Image 
        source={{ 
          uri: user.avatar_url || 'https://picsum.photos/400/600'
        }} 
        style={styles.image} 
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      <View style={styles.infoContainer}>
        <View style={styles.nameAge}>
          <Text style={styles.name}>{user.display_name || user.username || 'Anonymous'}</Text>
        </View>
        
        <View style={styles.gamesContainer}>
          {user.games.map((game, index) => (
            <View key={index} style={styles.gameTag}>
              <Text style={styles.gameText}>{game.name}</Text>
              {game.platform.map((platform, pIndex) => (
                <Text key={pIndex} style={styles.platformText}>{platform}</Text>
              ))}
            </View>
          ))}
        </View>

        {user.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    overflow: 'hidden',
    height: '100%',
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  infoContainer: {
    padding: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  nameAge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  gamesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  gameTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 8,
    padding: 6,
  },
  gameText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  platformText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  bioContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  bioText: {
    color: '#fff',
    fontSize: 13,
    fontStyle: 'italic',
  },
});

export default PlayerCard; 