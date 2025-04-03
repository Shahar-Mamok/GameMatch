import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
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
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

type Props = NativeStackScreenProps<RootStackParamList, 'Swipe'>;

// Mock players data
const mockPlayers = [
  {
    name: "Alex",
    age: 25,
    games: ["Valorant", "League of Legends", "CS:GO"],
    platforms: ["PC", "PS5"],
    level: "Pro",
    availability: "Evenings",
    imageUrl: "https://picsum.photos/400/600"
  },
  {
    name: "Sarah",
    age: 23,
    games: ["Overwatch", "Apex Legends"],
    platforms: ["PC"],
    level: "Expert",
    availability: "Weekends",
    imageUrl: "https://picsum.photos/400/601"
  },
  {
    name: "Mike",
    age: 28,
    games: ["FIFA 24", "NBA 2K24", "Rocket League"],
    platforms: ["PS5", "Xbox"],
    level: "Intermediate",
    availability: "Nights",
    imageUrl: "https://picsum.photos/400/602"
  },
  {
    name: "Emma",
    age: 21,
    games: ["Minecraft", "Stardew Valley", "Animal Crossing"],
    platforms: ["Switch", "PC"],
    level: "Casual",
    availability: "Flexible",
    imageUrl: "https://picsum.photos/400/603"
  }
];

export const SwipeScreen: React.FC<Props> = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(mockPlayers[0]);
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  const scale = useSharedValue(1);

  const nextPlayer = () => {
    const nextIndex = (currentIndex + 1) % mockPlayers.length;
    setCurrentIndex(nextIndex);
    setCurrentPlayer(mockPlayers[nextIndex]);
  };

  const animateAndNext = (direction: 'left' | 'right') => {
    'worklet';
    const xPosition = direction === 'left' ? -SCREEN_WIDTH * 1.5 : SCREEN_WIDTH * 1.5;
    
    translateX.value = withTiming(xPosition, { duration: 300 });
    scale.value = withTiming(0.8, { duration: 300 }, () => {
      runOnJS(nextPlayer)();
      translateX.value = withTiming(0, { duration: 0 });
      translateY.value = withTiming(0, { duration: 0 });
      cardRotate.value = withTiming(0, { duration: 0 });
      scale.value = withTiming(1, { duration: 0 });
    });
  };

  const handleSwipeLeft = () => {
    console.log('Swiped Left - Not interested');
    animateAndNext('left');
  };

  const handleSwipeRight = () => {
    console.log('Swiped Right - Interested');
    animateAndNext('right');
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      scale.value = withSpring(1.05);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY / 3;
      cardRotate.value = event.translationX * 0.1;
    },
    onEnd: (event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        if (event.translationX > 0) {
          animateAndNext('right');
        } else {
          animateAndNext('left');
        }
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        cardRotate.value = withSpring(0);
        scale.value = withSpring(1);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${cardRotate.value}deg` },
        { scale: scale.value }
      ],
    };
  });

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
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.card, cardStyle]}>
              <PlayerCard player={currentPlayer} />
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
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
  },
});

export default SwipeScreen; 