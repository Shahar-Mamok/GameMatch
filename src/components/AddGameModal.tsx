import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, Button, Searchbar, Chip } from 'react-native-paper';
import { supabase } from '../lib/supabase';

type Game = {
  id: string;
  name: string;
  genre: string;
  platform: string[];
};

type AddGameModalProps = {
  visible: boolean;
  onDismiss: () => void;
  userId: string;
  onGameAdded: () => void;
};

export default function AddGameModal({
  visible,
  onDismiss,
  userId,
  onGameAdded,
}: AddGameModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = games.filter(game =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGames(filtered);
    } else {
      setFilteredGames(games);
    }
  }, [searchQuery, games]);

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching games:', error);
      return;
    }
    setGames(data);
    setFilteredGames(data);
  };

  const handleAddGame = async () => {
    if (!selectedGame || !userId) return;

    const { error } = await supabase
      .from('user_games')
      .insert([
        {
          user_id: userId,
          game_id: selectedGame.id,
        },
      ]);

    if (error) {
      console.error('Error adding game:', error);
      return;
    }

    onGameAdded();
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Text style={styles.title}>Add Game</Text>
        <Searchbar
          placeholder="Search games..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <ScrollView style={styles.gameList}>
          {filteredGames.map(game => (
            <Chip
              key={game.id}
              selected={selectedGame?.id === game.id}
              onPress={() => setSelectedGame(game)}
              style={styles.gameChip}
            >
              {game.name}
            </Chip>
          ))}
        </ScrollView>
        {selectedGame && (
          <View style={styles.selectedGameInfo}>
            <Text style={styles.selectedGameName}>{selectedGame.name}</Text>
            <Text style={styles.selectedGameGenre}>Genre: {selectedGame.genre}</Text>
            <View style={styles.platformContainer}>
              {selectedGame.platform.map(platform => (
                <Chip key={platform} style={styles.platformChip}>
                  {platform}
                </Chip>
              ))}
            </View>
          </View>
        )}
        <Button
          mode="contained"
          onPress={handleAddGame}
          disabled={!selectedGame}
          style={styles.addButton}
        >
          Add Game
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchbar: {
    marginBottom: 15,
  },
  gameList: {
    maxHeight: 200,
  },
  gameChip: {
    margin: 5,
  },
  selectedGameInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  selectedGameName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedGameGenre: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  platformContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  platformChip: {
    margin: 5,
    backgroundColor: '#6B46C1',
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#6B46C1',
  },
}); 