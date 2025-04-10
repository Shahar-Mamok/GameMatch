import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { formatDate } from '../utils/dateUtils';

const ChatsScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not logged in');
        return;
      }

      // First, get all matches
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          matched_at,
          user1:users!matches_user1_id_fkey (id, username, display_name),
          user2:users!matches_user2_id_fkey (id, username, display_name)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('matched_at', { ascending: false });

      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
        setError(matchesError.message);
        return;
      }

      // Then, get the last message for each match
      const processedChats = await Promise.all(matches.map(async (match) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('content, sent_at')
          .eq('match_id', match.id)
          .order('sent_at', { ascending: false })
          .limit(1);

        const otherUser = match.user1.id === user.id ? match.user2 : match.user1;
        const lastMessage = messages && messages[0];

        return {
          matchId: match.id,
          user: otherUser,
          lastMessage: lastMessage?.content || "התחילו שיחה!",
          sentAt: lastMessage?.sent_at || match.matched_at
        };
      }));

      setChats(processedChats);
    } catch (err) {
      console.error('Error in fetchMatches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7B2CBF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>אין לך עדיין התאמות</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={item => item.matchId}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.chatItem}
            onPress={() => navigation.navigate('ChatRoom', { matchId: item.matchId })}
          >
            <View>
              <Text style={styles.userName}>{item.user.display_name || item.user.username}</Text>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
              <Text style={styles.sentAt}>{formatDate(item.sentAt)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
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
    backgroundColor: '#0A0A0A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    backgroundColor: '#0A0A0A',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sentAt: {
    fontSize: 12,
    color: '#999',
  },
});

export default ChatsScreen; 