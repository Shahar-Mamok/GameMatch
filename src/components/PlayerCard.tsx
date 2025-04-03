import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_CARD_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);

type PlayerCardProps = {
  player: {
    name: string;
    age: number;
    games: string[];
    platforms: string[];
    level: string;
    availability: string;
    imageUrl: string;
  };
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: player.imageUrl }} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      <View style={styles.infoContainer}>
        <View style={styles.nameAge}>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.age}>, {player.age}</Text>
        </View>
        
        <View style={styles.platformContainer}>
          {player.platforms.map((platform, index) => (
            <View key={index} style={styles.platform}>
              <Text style={styles.platformText}>{platform}</Text>
            </View>
          ))}
        </View>

        <View style={styles.gamesContainer}>
          {player.games.map((game, index) => (
            <Text key={index} style={styles.gameText}>
              {game}
            </Text>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>Level</Text>
            <Text style={styles.levelText}>{player.level}</Text>
          </View>
          <View style={styles.availabilityContainer}>
            <Text style={styles.availabilityLabel}>Online</Text>
            <Text style={styles.availabilityText}>{player.availability}</Text>
          </View>
        </View>
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
  age: {
    fontSize: 20,
    color: '#fff',
    marginLeft: 4,
  },
  platformContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  platform: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platformText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  gamesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  gameText: {
    color: '#fff',
    fontSize: 13,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  levelContainer: {
    alignItems: 'flex-start',
  },
  levelLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginBottom: 2,
  },
  levelText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  availabilityContainer: {
    alignItems: 'flex-end',
  },
  availabilityLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginBottom: 2,
  },
  availabilityText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
}); 