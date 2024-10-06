import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function GoalSettings() {
  return (
    <View style={styles.container}>
      <Text>Goal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D5E5E4', // background color
    padding: 20,
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center',     // Center the content horizontally
  },
});
