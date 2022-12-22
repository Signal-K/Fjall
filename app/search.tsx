import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PBEvent } from '@/types';
import NetInfo from '@react-native-community/netinfo';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ImageBackground, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const PB_URL = 'http://192.168.1.139:8080';

const SearchResultCard = ({ item, onPress }: { item: PBEvent, onPress: () => void }) => {
  const imageUrl = item.image
    ? item.image.startsWith('http')
      ? item.image
      : `${PB_URL}/api/files/${item.collectionId}/${item.id}/${item.image}`
    : undefined;
  const provider = item.expand?.launch_service_provider;
  const launchpad = item.expand?.launchpad;
  const providerLogoUrl = provider?.logo_url;

  return (
    <TouchableOpacity style={styles.resultCard} onPress={onPress}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.resultImage}
        resizeMode="cover"
      >
        <View style={styles.resultOverlay}>
          <ThemedText style={styles.resultTitle}>{item.title}</ThemedText>
          <View style={styles.resultProviderContainer}>
            {providerLogoUrl && <Image source={{ uri: providerLogoUrl }} style={styles.resultProviderLogo} />}
            <ThemedText style={styles.resultSub}>{provider?.name}</ThemedText>
          </View>
          <ThemedText style={styles.resultSub}>{launchpad?.name}</ThemedText>
          <ThemedText style={styles.resultDate}>
            {new Date(item.datetime).toLocaleDateString()}
          </ThemedText>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PBEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  const performSearch = async (query: string) => {
    if (!query.trim() || !isOnline) return;

    try {
      setLoading(true);

      // Get all events and filter client-side
      const res = await fetch(`${PB_URL}/api/collections/events/records?expand=launchpad,launch_service_provider&sort=-datetime`);
      const data = await res.json();

      const allEvents: PBEvent[] = data.items || [];

      // Filter client-side
      const filteredResults = allEvents.filter(event => {
        const titleMatch = event.title?.toLowerCase().includes(query.toLowerCase());
        const descMatch = event.description?.toLowerCase().includes(query.toLowerCase());
        const providerMatch = event.expand?.launch_service_provider?.name?.toLowerCase().includes(query.toLowerCase());

        return titleMatch || descMatch || providerMatch;
      });

      setSearchResults(filteredResults);

    } catch (error) {
      console.error("Failed to search:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      performSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultPress = (event: PBEvent) => {
    router.push(`/event/${event.id}`);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Search Events', headerBackTitle: 'Back' }} />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for launches..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {!loading && searchQuery.length < 2 && (
        <View style={styles.placeholderContainer}>
          <ThemedText style={styles.placeholderText}>
            Type at least 2 characters to search
          </ThemedText>
        </View>
      )}

      {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
        <View style={styles.placeholderContainer}>
          <ThemedText style={styles.placeholderText}>
            No results found for &quot;{searchQuery}&quot;
          </ThemedText>
        </View>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SearchResultCard item={item} onPress={() => handleResultPress(item)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={searchResults.length === 0 ? styles.emptyList : {}}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  searchContainer: {
    padding: 20,
    paddingTop: 10,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
  resultCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
  },
  resultImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  resultOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 15,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  resultProviderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultProviderLogo: {
    width: 20,
    height: 20,
    marginRight: 6,
    resizeMode: 'contain',
  },
  resultSub: {
    fontSize: 14,
    color: '#ccc',
  },
  resultDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});