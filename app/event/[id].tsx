import { ThemedText } from '@/components/themed-text';
import { PBEvent } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';

const PB_URL = 'http://192.168.1.139:8080';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<PBEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const cacheKey = `event_${id}`;
        // Load from cache first
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const now = Date.now();
          const cacheAge = now - timestamp;
          const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
          if (cacheAge < cacheExpiry) {
            setEvent(data);
            setLoading(false);
            return;
          }
        }

        if (isOnline) {
          setLoading(true);
          const res = await fetch(`${PB_URL}/api/collections/events/records/${id}?expand=launchpad,launch_service_provider`);
          const data = await res.json();
          setEvent(data);

          // Cache the data
          const cacheData = {
            data,
            timestamp: Date.now()
          };
          await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } else {
          // If offline and no cache, set null
          setEvent(null);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, isOnline]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ThemedText>{isOnline ? 'Event not found.' : 'Event not cached. Please check your connection.'}</ThemedText>
      </View>
    );
  }

  const imageUrl = event.image
    ? event.image.startsWith('http')
      ? event.image
      : `${PB_URL}/api/files/${event.collectionId}/${event.id}/${event.image}`
    : undefined;

  const provider = event.expand?.launch_service_provider;
  const launchpad = event.expand?.launchpad;

  return (
    <View style={styles.container}>
        <Stack.Screen options={{ title: event.title, headerBackTitle: 'Back' }} />
        <ScrollView>
            {imageUrl && <Image source={{ uri: imageUrl }} style={styles.coverImage} />}
            <View style={styles.contentContainer}>
                <ThemedText style={styles.title}>{event.title}</ThemedText>
                <ThemedText style={styles.date}>{new Date(event.datetime).toLocaleString()}</ThemedText>
                
                {provider && (
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Launch Provider</ThemedText>
                        <ThemedText>{provider.name}</ThemedText>
                    </View>
                )}

                {launchpad && (
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Launch Pad</ThemedText>
                        <ThemedText>{launchpad.name}</ThemedText>
                    </View>
                )}

                {event.description && (
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Details</ThemedText>
                        <ThemedText style={styles.description}>{event.description}</ThemedText>
                    </View>
                )}
            </View>
        </ScrollView>
    </View>
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
  coverImage: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#aaa',
  },
  description: {
    fontSize: 16,
    color: '#eee',
    lineHeight: 24,
  }
});
