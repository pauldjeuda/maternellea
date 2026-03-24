import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const WelcomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Maternellea - Welcome Screen (Mock)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 20, fontWeight: 'bold' },
});
