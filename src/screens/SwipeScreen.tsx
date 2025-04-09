import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { PlayerCard } from '../components/PlayerCard';
import { SwipeButtons } from '../components/SwipeButtons';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { supabase } from '../lib/supabase';
import { User, UserWithGames } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;
const MAX_ROTATION = 15;

type Props = NativeStackScreenProps<RootStackParamList, 'Swipe'>;

export const SwipeScreen: React.FC<Props> = () => {
  const [users, setUsers] = useState<UserWithGames[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const nextScale = useSharedValue(0.9);
  const isSwiping = useSharedValue(false);
  const borderColor = useSharedValue('#e600ff');

  useEffect(() => {
    loadPotentialMatches();
    const cycleColors = () => {
      borderColor.value = withTiming('#00e6e6', {
        duration: 3000,
        easing: Easing.linear,
      }, () => {
        borderColor.value = withTiming('#e600ff', {
          duration: 3000,
          easing: Easing.linear,
        }, cycleColors);
      });
    };
    cycleColors();
  }, []);

  const loadPotentialMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user's games
      const { data: userGames, error: userGamesError } = await supabase
        .from('user_games')
        .select('game_id')
        .eq('user_id', user.id);

      if (userGamesError) throw userGamesError;
      const userGameIds = (userGames || []).map(ug => ug.game_id);

      console.log('User Game IDs:', userGameIds);

      // Get potential matches (users who share at least one game)
      const { data: potentialMatches, error: matchesError } = await supabase
        .from('users')
        .select(`
          *,
          user_games!inner (
            game_id,
            games (*)
          )
        `)
        .neq('id', user.id)
        .in('user_games.game_id', userGameIds);

      if (matchesError) throw matchesError;

      console.log('Potential Matches:', potentialMatches);

      if (potentialMatches) {
        // Transform the data to match our UserWithGames type
        const usersWithGames = potentialMatches.map(user => ({
          ...user,
          games: user.user_games.map(ug => ug.games)
        }));

        console.log('Users with Games:', usersWithGames);

        setUsers(usersWithGames);
        setCurrentIndex(0);
        setNextIndex(1);
      }
    } catch (error) {
      console.error('Error loading potential matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextUser = () => {
    if (users.length === 0) return;
    const newCurrentIndex = (currentIndex + 1) % users.length;
    const newNextIndex = (newCurrentIndex + 1) % users.length;
    setCurrentIndex(newCurrentIndex);
    setNextIndex(newNextIndex);
  };

  const animateAndNext = (direction: 'left' | 'right') => {
    'worklet';
    if (isSwiping.value) return;
    
    isSwiping.value = true;
    const xPosition = direction === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    
    translateX.value = withTiming(xPosition, { 
      duration: 200,
      easing: Easing.out(Easing.ease)
    });
    
    scale.value = withTiming(0.8, { duration: 200 });
    nextScale.value = withTiming(1, { duration: 200 });

    // Use setTimeout for consistent timing
    runOnJS(setTimeout)((() => {
      runOnJS(nextUser)();
      translateX.value = 0;
      translateY.value = 0;
      cardRotate.value = 0;
      scale.value = 1;
      nextScale.value = 0.9;
      isSwiping.value = false;
    }), 200);
  };

  const handleSwipeLeft = async () => {
    console.log('Swiped Left - Not interested');
    animateAndNext('left');
  };

  const handleSwipeRight = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const matchedUser = users[currentIndex];
      
      // Create a match
      const { error } = await supabase
        .from('matches')
        .insert({
          user1_id: user.id,
          user2_id: matchedUser.id,
          status: 'pending',
          matched_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log('Match created successfully');
    } catch (error) {
      console.error('Error creating match:', error);
    }
    
    animateAndNext('right');
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      if (!isSwiping.value) {
        scale.value = withSpring(1.05);
        nextScale.value = withSpring(0.95);
      }
    },
    onActive: (event) => {
      if (isSwiping.value) return;

      // Limit horizontal movement to screen width
      const boundedX = Math.max(Math.min(event.translationX, SCREEN_WIDTH), -SCREEN_WIDTH);
      translateX.value = boundedX;
      
      // Limit vertical movement
      const boundedY = Math.max(Math.min(event.translationY / 3, 100), -100);
      translateY.value = boundedY;
      
      // Calculate rotation based on horizontal position
      const rotationFactor = (boundedX / SCREEN_WIDTH) * MAX_ROTATION;
      cardRotate.value = rotationFactor;
      
      // Scale next card based on current card position
      const progress = Math.abs(boundedX) / SWIPE_THRESHOLD;
      const nextScaleValue = 0.9 + (Math.min(progress, 1) * 0.1);
      nextScale.value = nextScaleValue;

      // Auto-trigger swipe if beyond threshold
      if (Math.abs(boundedX) >= SWIPE_THRESHOLD) {
        if (boundedX > 0) {
          animateAndNext('right');
        } else {
          animateAndNext('left');
        }
      }
    },
    onEnd: (event) => {
      if (!isSwiping.value && Math.abs(event.translationX) < SWIPE_THRESHOLD) {
        // Return to center if not swiped far enough
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        cardRotate.value = withSpring(0);
        scale.value = withSpring(1);
        nextScale.value = withSpring(0.9);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${cardRotate.value}deg` },
      { scale: scale.value }
    ] as any,
    zIndex: 2,
    borderWidth: 4,
    borderColor: borderColor.value,
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: nextScale.value }
    ] as any,
    zIndex: 1,
  }));

  if (loading) {
    return (
      <LinearGradient
        colors={['#1a1a1a', '#2d1b4e', '#1a1a1a']}
        style={[styles.container, styles.loadingContainer]}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  if (users.length === 0) {
    return (
      <LinearGradient
        colors={['#1a1a1a', '#2d1b4e', '#1a1a1a']}
        style={[styles.container, styles.loadingContainer]}
      >
        <Text style={styles.noPlayersText}>No potential matches found</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d1b4e', '#1a1a1a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>GameMatch</Text>
        </View>
        
        <View style={styles.cardContainer}>
          {/* Next Card */}
          {users.length > 1 && (
            <Animated.View style={[styles.card, nextCardStyle]}>
              <PlayerCard user={users[nextIndex]} />
            </Animated.View>
          )}

          {/* Current Card */}
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.card, cardStyle]}>
              <PlayerCard user={users[currentIndex]} />
            </Animated.View>
          </PanGestureHandler>
        </View>

        <SwipeButtons
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d', // Dark background
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a', // Darker header
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e600ff', // Neon pink
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 80, // Space for buttons
  },
  card: {
    width: Math.min(SCREEN_WIDTH - 40, 360),
    aspectRatio: 0.7,
    position: 'absolute',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '@keyframes neonBorder': {
    '0%': { borderColor: '#e600ff' },
    '50%': { borderColor: '#00e6e6' },
    '100%': { borderColor: '#e600ff' },
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPlayersText: {
    color: '#e600ff', // Neon pink
    fontSize: 18,
    textAlign: 'center',
  },
});

export default SwipeScreen; 