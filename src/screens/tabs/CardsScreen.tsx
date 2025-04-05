import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import SwipeScreen from '../SwipeScreen';

const CardsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SwipeScreen />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    marginTop: 60, // מרווח מהחלק העליון
  },
});

export default CardsScreen; 