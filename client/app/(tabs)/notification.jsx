import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function notification() {  // It's a good practice to use PascalCase for component names
  return (
    <View style={styles.container}>
      <Text>Notifications</Text>
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
