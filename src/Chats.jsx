import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const Chats = () => {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: 'green',
  },
});

export default Chats;