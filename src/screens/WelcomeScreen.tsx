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
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(titlePosition, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(subtitlePosition, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e600ff',
    textAlign: 'center',
    boxShadow: '0 0 10px #e600ff',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: '#cccccc',
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
