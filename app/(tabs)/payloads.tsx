import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Payload } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';

const PB_URL = 'http://http://172.20.0.2:8080';
const { height, width } = Dimensions.get('window');

const PayloadCard = ({ item, onPress }: { item: Payload, onPress: () => void }) => {
  console.log('Payload item:', item);
  console.log('Payload image_url field:', item.image_url);
  const imageUrl = item.image_url || undefined;
  console.log('Attempting to load payload image from URL:', imageUrl);

  // Fallback: use a default background if no image
  const backgroundStyle = imageUrl
    ? { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
    : { backgroundColor: '#1a1a1a' };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        >
          <View style={styles.cardOverlay}>
            <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
            {item.type && <ThemedText style={styles.cardSub}>Type: {item.type}</ThemedText>}
            {item.mass_kg && <ThemedText style={styles.cardSub}>Mass: {item.mass_kg} kg</ThemedText>}
            {item.manufacturer && <ThemedText style={styles.cardSub}>Manufacturer: {item.manufacturer}</ThemedText>}
            {item.description && <ThemedText style={styles.cardSub}>{item.description}</ThemedText>}
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.cardImage, backgroundStyle]}>
          <View style={styles.cardOverlay}>
            <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
            {item.type && <ThemedText style={styles.cardSub}>Type: {item.type}</ThemedText>}
            {item.mass_kg && <ThemedText style={styles.cardSub}>Mass: {item.mass_kg} kg</ThemedText>}
            {item.manufacturer && <ThemedText style={styles.cardSub}>Manufacturer: {item.manufacturer}</ThemedText>}
            {item.description && <ThemedText style={styles.cardSub}>{item.description}</ThemedText>}
            <ThemedText style={styles.noImageText}>No Image Available</ThemedText>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function PayloadsScreen() {
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchPayloads = async () => {
      try {
        // Load from cache first
        const cachedData = await AsyncStorage.getItem('payloads_cache');
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const now = Date.now();
          const cacheAge = now - timestamp;
          const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
          if (cacheAge < cacheExpiry) {
            setPayloads(data);
            setLoading(false);
          }
        }

        if (isOnline) {
          setLoading(true);

          const res = await fetch(`${PB_URL}/api/collections/payloads/records?expand=manufacturer`);
          const data = await res.json();
          const pbPayloads: Payload[] = data.items || [];

          setPayloads(pbPayloads);

          // Cache the data
          const cacheData = {
            data: pbPayloads,
            timestamp: Date.now()
          };
          await AsyncStorage.setItem('payloads_cache', JSON.stringify(cacheData));
        } else {
          // If offline, do nothing, use cached data if available
        }
      } catch (error) {
        console.error("Failed to fetch payloads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayloads();
  }, [isOnline]);

  const handleCardPress = (payload: Payload) => {
    // For now, just log the payload. Could navigate to detail page later
    console.log('Payload pressed:', payload);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={payloads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PayloadCard item={item} onPress={() => handleCardPress(item)} />}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={height}
        ListEmptyComponent={
          <View style={styles.centered}>
            <ThemedText>{isOnline ? 'No payloads to display.' : 'No cached payloads available. Please check your connection.'}</ThemedText>
          </View>
        }
        contentContainerStyle={payloads.length === 0 ? styles.centered : {}}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width,
    height: height,
    justifyContent: 'flex-end',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  cardOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
    paddingBottom: 100, // Add padding to avoid tab bar
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardSub: {
    fontSize: 18,
    color: '#eee',
    marginBottom: 4,
  },
  noImageText: {
    fontSize: 16,
    color: '#ccc',
    fontStyle: 'italic',
    marginTop: 20,
  },
});