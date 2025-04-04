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
  Easing,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;
const MAX_ROTATION = 15;

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
  const [nextIndex, setNextIndex] = useState(1);
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const nextScale = useSharedValue(0.9);
  const isSwiping = useSharedValue(false);

  const nextPlayer = () => {
    const newCurrentIndex = (currentIndex + 1) % mockPlayers.length;
    const newNextIndex = (newCurrentIndex + 1) % mockPlayers.length;
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
      runOnJS(nextPlayer)();
      translateX.value = 0;
      translateY.value = 0;
      cardRotate.value = 0;
      scale.value = 1;
      nextScale.value = 0.9;
      isSwiping.value = false;
    }), 200);
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

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${cardRotate.value}deg` },
        { scale: scale.value }
      ],
      zIndex: 2,
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: nextScale.value }
      ],
      zIndex: 1,
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
          {/* Next Card */}
          <Animated.View style={[styles.card, nextCardStyle]}>
            <PlayerCard player={mockPlayers[nextIndex]} />
          </Animated.View>

          {/* Current Card */}
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.card, cardStyle]}>
              <PlayerCard player={mockPlayers[currentIndex]} />
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