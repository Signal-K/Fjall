import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

interface WebMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export const WebMap: React.FC<WebMapProps> = ({ latitude, longitude, name }) => {
  // Use OpenStreetMap embed to avoid API keys. This renders an interactive OSM map in an iframe.
  // Compose the OSM embed URL centered on the coordinates with a marker via the `marker` query in openstreetmap.org's embed.
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.05}%2C${latitude - 0.03}%2C${longitude + 0.05}%2C${latitude + 0.03}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  // On web, render an iframe. On native webview-like environments, fall back to a static coordinate view.
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.title}>{name}</ThemedText>
        <View style={styles.mapWrapper}>
          <iframe
            title={`map-${name}`}
            src={osmUrl}
            style={styles.iframe}
            loading="lazy"
          />
        </View>
        <ThemedText style={styles.coordinates}>📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}</ThemedText>
      </View>
    );
  }

  // Non-web fallback (shouldn't be used since this is the web map component)
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{name}</ThemedText>
      <ThemedText style={styles.coordinates}>📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}</ThemedText>
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
  mapWrapper: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  iframe: {
    border: 0,
    width: '100%',
    height: '100%',
  } as any,
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