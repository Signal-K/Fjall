import { ThemedText } from '@/components/themed-text';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface NativeMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export const NativeMap: React.FC<NativeMapProps> = ({ latitude, longitude, name }) => {
  const [MapView, setMapView] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);

  useEffect(() => {
    // Use setTimeout to defer the import and avoid build-time analysis
    const timer = setTimeout(() => {
      try {
        // Use Function constructor to create a dynamic require that bypasses static analysis
        const requireMaps = new Function('return require("react-native-maps")')();
        setMapView(() => requireMaps.default);
        setMarker(() => requireMaps.Marker);
      } catch (error) {
        console.warn('Failed to load react-native-maps:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!MapView || !Marker) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="small" color="#fff" />
        <ThemedText style={styles.loadingText}>Loading map...</ThemedText>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation={false}
      showsMyLocationButton={false}
      scrollEnabled={true}
      zoomEnabled={true}
    >
      <Marker
        coordinate={{
          latitude: latitude,
          longitude: longitude,
        }}
        title={name}
        description={`Launch pad location`}
      />
    </MapView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  loadingText: {
    color: '#fff',
    marginTop: 8,
  }
});