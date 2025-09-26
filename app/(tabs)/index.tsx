import CountdownTimer from '@/components/countdown-timer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PBEvent } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';

import { PB_URL } from '@/constants/pocketbase';
const { height, width } = Dimensions.get('window');

const LaunchCard = ({ item, onPress }: { item: PBEvent, onPress: () => void }) => {
  const imageUrl = item.image
    ? item.image.startsWith('http')
      ? item.image
      : `${PB_URL}/api/files/${item.collectionId}/${item.id}/${item.image}`
    : undefined;
  const provider = item.expand?.launch_service_provider;
  const launchpad = item.expand?.launchpad;
  const providerLogoUrl = provider?.logo_url;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
        blurRadius={0.5}
      >
        <View style={styles.cardOverlay}>
          <View style={styles.contentContainer}>
            <CountdownTimer targetDate={item.datetime} />
            <ThemedText style={styles.cardTitle} lightColor="#fff" darkColor="#fff">{item.title}</ThemedText>
            <View style={styles.providerContainer}>
              {providerLogoUrl && (
                <Image
                  source={{ uri: providerLogoUrl }}
                  style={styles.providerLogo}
                />
              )}
              <ThemedText style={styles.cardSub} lightColor="#eee" darkColor="#eee">{provider?.name}</ThemedText>
            </View>
            <ThemedText style={styles.cardSub} lightColor="#eee" darkColor="#eee">{launchpad?.name}</ThemedText>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [launches, setLaunches] = useState<PBEvent[]>([]);
  const launchesRef = useRef<PBEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        // If already focused, user tapped home tab again - scroll to top with smooth animation
        flatListRef.current?.scrollToOffset({
          offset: 0,
          animated: true,
        });
      } else {
        setIsFocused(true);
      }
    }, [isFocused])
  );

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

          // Only update state if the fetched data differs from current to avoid
          // resetting the FlatList position while the user is scrolling.
          const newIds = pbEvents.map((p) => p.id);
          const currentIds = launchesRef.current.map((l) => l.id);
          const sameLength = currentIds.length === newIds.length;
          const isSame = sameLength && currentIds.every((id, idx) => id === newIds[idx]);

          if (!isSame) {
            setLaunches(pbEvents);
            launchesRef.current = pbEvents;
          }

          // Cache the data regardless so we have an up-to-date cache timestamp.
          const cacheData = {
            data: pbEvents,
            timestamp: Date.now(),
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
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/search')}>
            <View style={styles.iconCircle}>
              <ThemedText style={styles.iconText}>🔍</ThemedText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
            <View style={styles.iconCircle}>
              <ThemedText style={styles.iconText}>⚙️</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        ref={flatListRef}
        data={launches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LaunchCard item={item} onPress={() => handleCardPress(item)} />}
        // Use snapping to a fixed interval (screen height) but disable paging
        // so the scroll feels natural and less jumpy.
        pagingEnabled={false}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={height}
        // Make deceleration quicker for snappier but smoother feel
        decelerationRate="fast"
        // Prevent momentum from causing multiple snaps/skips
        disableIntervalMomentum={true}
        bounces={false}
        scrollEventThrottle={16}
        // Keeping clipped subviews off reduces stuttering when animating large
        // images that cover the full screen.
        removeClippedSubviews={false}
        // Render a bit more ahead of time to reduce pop-in during fast scrolls
        initialNumToRender={2}
        maxToRenderPerBatch={5}
        windowSize={9}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        // If the list is empty, center the message vertically
        ListEmptyComponent={
          <View style={styles.centered}>
            <ThemedText>{isOnline ? 'No launches to display.' : 'No cached launches available. Please check your connection.'}</ThemedText>
          </View>
        }
        contentContainerStyle={launches.length === 0 ? styles.centered : {}}
        // Fallback if snapping fails to avoid jumping back to start
        onScrollToIndexFailed={() => { /* no-op */ }}
        onMomentumScrollEnd={(ev) => {
          // Ensure the list snaps to the nearest item to avoid partially
          // visible cards and skipping.
          const offsetY = ev.nativeEvent.contentOffset?.y ?? 0;
          const index = Math.round(offsetY / height);
          flatListRef.current?.scrollToIndex({ index, animated: true });
        }}
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
  header: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconText: {
    fontSize: 20,
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
    justifyContent: 'flex-end',
  },
  contentContainer: {
    opacity: 1,
    transform: [{ translateY: 0 }],
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


