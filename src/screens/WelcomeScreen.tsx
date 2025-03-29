import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const titleOpacity = new Animated.Value(0);
  const titlePosition = new Animated.Value(50);
  const subtitleOpacity = new Animated.Value(0);
  const subtitlePosition = new Animated.Value(25);
  const buttonScale = new Animated.Value(1);
  const buttonOpacity = new Animated.Value(0);

  useEffect(() => {
    // Welcome text animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(titlePosition, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(subtitlePosition, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Button fade in
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for the button
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGetStarted = () => {
    navigation.navigate('Auth');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2d1b4e', '#1a1a1a']}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.content}>
        <Animated.Text 
          style={[
            styles.title,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titlePosition }],
            },
          ]}
        >
          Welcome to GameMatch! 🎮
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.subtitle,
            {
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitlePosition }],
            },
          ]}
        >
          Find your perfect gaming partner
        </Animated.Text>
        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <View style={styles.buttonGlow} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#cccccc',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 50,
  },
  buttonContainer: {
    position: 'relative',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#7B2CBF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#7B2CBF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 27,
    backgroundColor: '#7B2CBF',
    opacity: 0.3,
    zIndex: -1,
  },
}); 