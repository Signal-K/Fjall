import { ThemedText } from '@/components/themed-text';
import { PBEvent } from '@/types';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';

const PB_URL = 'http://192.168.1.139:8080';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<PBEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${PB_URL}/api/collections/events/records/${id}?expand=launchpad,launch_service_provider`);
        const data = await res.json();
        setEvent(data);
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

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
        <ThemedText>Event not found.</ThemedText>
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
