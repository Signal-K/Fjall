import EventDetailModal from '@/components/event-detail-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Launch } from '@/types';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';

const API_URL = 'https://ll.thespacedevs.com/2.2.0/launch/?mode=list';

const LaunchCard = ({ item, onPress }: { item: Launch, onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <ImageBackground
        source={{ uri: item.image || undefined }}
        style={styles.cardImage}
        resizeMode="cover"
      >
        <View style={styles.cardOverlay}>
          <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
          <ThemedText style={styles.cardSub}>{item.launch_service_provider?.name}</ThemedText>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then(data => {
        setLaunches(data.results || []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch launches:", error);
        setLoading(false);
      });
  }, []);

  const handleCardPress = (launch: Launch) => {
    setSelectedLaunch(launch);
    setModalVisible(true);
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
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.pageTitle}>Feed</ThemedText>
      </ThemedView>

      <FlatList
        data={launches}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <LaunchCard item={item} onPress={() => handleCardPress(item)} />}
        contentContainerStyle={styles.listContainer}
      />

      <EventDetailModal
        event={selectedLaunch}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  cardImage: {
    width: '100%',
    height: 400,
    justifyContent: 'flex-end',
  },
  cardOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 16,
    color: '#eee',
  },
});
