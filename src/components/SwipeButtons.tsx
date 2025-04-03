import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

type SwipeButtonsProps = {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

export const SwipeButtons: React.FC<SwipeButtonsProps> = ({
  onSwipeLeft,
  onSwipeRight,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, styles.noButton]} 
        onPress={onSwipeLeft}
      >
        <Text style={styles.buttonText}>❌</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.yesButton]}
        onPress={onSwipeRight}
      >
        <Text style={styles.buttonText}>❤️</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  noButton: {
    backgroundColor: '#FF4B4B',
  },
  yesButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 24,
  },
}); 