import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface WebMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export const WebMap: React.FC<WebMapProps> = ({ latitude, longitude, name }) => {
  // For web, show a simple coordinate display instead of trying to load maps
  // This avoids any Google Maps API requirements and native module issues
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{name}</ThemedText>
      <ThemedText style={styles.coordinates}>
        📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </ThemedText>
      <ThemedText style={styles.note}>
        Interactive maps require Google Maps API key configuration
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
  },
  note: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  }
});