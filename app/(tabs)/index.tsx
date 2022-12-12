import CountdownTimer from '@/components/countdown-timer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PBEvent } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';

const PB_URL = 'http://192.168.1.139:8080';
const { height, width } = Dimensions.get('window');

const LaunchCard = ({ item, onPress }: { item: PBEvent, onPress: () => void }) => {
  const imageUrl = item.image
    ? item.image.startsWith('http')
      ? item.image
      : `${PB_URL}/api/files/${item.collectionId}/${item.id}/${item.image}`
    : undefined;
  const isFuture = new Date(item.datetime).getTime() > new Date().getTime();
  const provider = item.expand?.launch_service_provider;
  const launchpad = item.expand?.launchpad;
  const providerLogoUrl = provider?.logo_url;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
      >
        <View style={styles.cardOverlay}>
          {isFuture && <CountdownTimer targetDate={item.datetime} />}
          <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
          <View style={styles.providerContainer}>
            {providerLogoUrl && <Image source={{ uri: providerLogoUrl }} style={styles.providerLogo} />}
            <ThemedText style={styles.cardSub}>{provider?.name}</ThemedText>
          </View>
          <ThemedText style={styles.cardSub}>{launchpad?.name}</ThemedText>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [launches, setLaunches] = useState<PBEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        // Load from cache first
        const cachedData = await AsyncStorage.getItem('launches_cache');
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const now = Date.now();
          const cacheAge = now - timestamp;
          const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
          if (cacheAge < cacheExpiry) {
            setLaunches(data);
            setLoading(false);
          }
        }

        if (isOnline) {
          setLoading(true);

          const now = new Date();
          const fourWeeksAgo = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);
          const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

          const formatDateForPB = (date: Date) => date.toISOString().replace('T', ' ').substring(0, 19);

          const dateFilter = `(datetime >= "${formatDateForPB(fourWeeksAgo)}" && datetime <= "${formatDateForPB(oneWeekFromNow)}")`;
          const imageFilter = `(image != null && image != '')`;
          const filter = `${dateFilter} && ${imageFilter}`;
          const encodedFilter = encodeURIComponent(filter);

          const res = await fetch(`${PB_URL}/api/collections/events/records?sort=-datetime&expand=launchpad,launch_service_provider&filter=${encodedFilter}`);
          const data = await res.json();
          const pbEvents: PBEvent[] = data.items || [];

          const nowTimestamp = now.getTime();
          pbEvents.sort((a, b) => {
            const dateA = new Date(a.datetime).getTime();
            const dateB = new Date(b.datetime).getTime();
            
            const aIsUpcoming = dateA >= nowTimestamp;
            const bIsUpcoming = dateB >= nowTimestamp;

            if (aIsUpcoming && !bIsUpcoming) return -1;
            if (!aIsUpcoming && bIsUpcoming) return 1;

            if (aIsUpcoming && bIsUpcoming) {
              return dateA - dateB; // Sort upcoming ascending (soonest first)
            }

            // Both are past, sort descending (most recent first)
            return dateB - dateA;
          });

          setLaunches(pbEvents);

          // Cache the data
          const cacheData = {
            data: pbEvents,
            timestamp: Date.now()
          };
          await AsyncStorage.setItem('launches_cache', JSON.stringify(cacheData));
        } else {
          // If offline, do nothing, use cached data if available
        }
      } catch (error) {
        console.error("Failed to fetch launches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLaunches();
  }, [isOnline]);

  const handleCardPress = (launch: PBEvent) => {
    router.push(`/event/${launch.id}`);
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
        data={launches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LaunchCard item={item} onPress={() => handleCardPress(item)} />}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={height}
        ListEmptyComponent={
          <View style={styles.centered}>
            <ThemedText>{isOnline ? 'No launches to display.' : 'No cached launches available. Please check your connection.'}</ThemedText>
          </View>
        }
        contentContainerStyle={launches.length === 0 ? styles.centered : {}}
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
  },
  providerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
});


