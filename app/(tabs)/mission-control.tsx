import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PBEvent } from '@/types';
import NetInfo from '@react-native-community/netinfo';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const PB_URL = 'http://192.168.1.139:8080';

interface Station {
  id: string;
  name: string;
  status: string;
  location: string;
  crew_count?: number;
  created: string;
  updated: string;
}

interface DockingEvent {
  id: string;
  title: string;
  description?: string;
  datetime: string;
  station_id?: string;
  expand?: {
    station?: Station;
  };
}

const UpcomingLaunchCard = ({ item }: { item: PBEvent }) => {
  const imageUrl = item.image
    ? item.image.startsWith('http')
      ? item.image
      : `${PB_URL}/api/files/${item.collectionId}/${item.id}/${item.image}`
    : undefined;

  return (
    <TouchableOpacity style={styles.launchCard}>
      <Image source={{ uri: imageUrl }} style={styles.launchImage} />
      <View style={styles.launchContent}>
        <ThemedText style={styles.launchTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.launchDate}>
          {new Date(item.datetime).toLocaleDateString()} at {new Date(item.datetime).toLocaleTimeString()}
        </ThemedText>
        <ThemedText style={styles.launchProvider}>
          {item.expand?.launch_service_provider?.name}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const DockingEventCard = ({ item }: { item: DockingEvent }) => {
  return (
    <View style={styles.dockingCard}>
      <View style={styles.dockingHeader}>
        <ThemedText style={styles.dockingTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.dockingTime}>
          {new Date(item.datetime).toLocaleDateString()}
        </ThemedText>
      </View>
      {item.description && (
        <ThemedText style={styles.dockingDescription}>{item.description}</ThemedText>
      )}
      {item.expand?.station && (
        <ThemedText style={styles.dockingStation}>
          Station: {item.expand.station.name}
        </ThemedText>
      )}
    </View>
  );
};

const ActiveStationCard = ({ item }: { item: Station }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return '#4CAF50';
      case 'maintenance':
        return '#FF9800';
      case 'decommissioned':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.stationCard}>
      <View style={styles.stationHeader}>
        <ThemedText style={styles.stationName}>{item.name}</ThemedText>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
      </View>
      <ThemedText style={styles.stationLocation}>{item.location}</ThemedText>
      <ThemedText style={styles.stationStatus}>{item.status}</ThemedText>
      {item.crew_count && (
        <ThemedText style={styles.stationCrew}>Crew: {item.crew_count}</ThemedText>
      )}
    </View>
  );
};

export default function MissionControlScreen() {
  const [upcomingLaunches, setUpcomingLaunches] = useState<PBEvent[]>([]);
  const [dockingEvents, setDockingEvents] = useState<DockingEvent[]>([]);
  const [activeStations, setActiveStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchMissionData = async () => {
      try {
        setLoading(true);

        // Fetch upcoming launches
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const formatDateForPB = (date: Date) => date.toISOString().replace('T', ' ').substring(0, 19);

        const launchFilter = `(datetime >= "${formatDateForPB(now)}" && datetime <= "${formatDateForPB(oneWeekFromNow)}")`;
        const imageFilter = `(image != null && image != '')`;
        const filter = `${launchFilter} && ${imageFilter}`;
        const encodedFilter = encodeURIComponent(filter);

        const launchRes = await fetch(`${PB_URL}/api/collections/events/records?sort=datetime&expand=launchpad,launch_service_provider&filter=${encodedFilter}&limit=5`);
        const launchData = await launchRes.json();
        setUpcomingLaunches(launchData.items || []);

        // Fetch docking events (assuming there's a docking_events collection)
        try {
          const dockingRes = await fetch(`${PB_URL}/api/collections/docking_events/records?sort=datetime&expand=station&limit=5`);
          const dockingData = await dockingRes.json();
          setDockingEvents(dockingData.items || []);
        } catch (error) {
          console.log('Docking events collection not found, skipping...', error);
          setDockingEvents([]);
        }

        // Fetch active stations (assuming there's a stations collection)
        try {
          const stationRes = await fetch(`${PB_URL}/api/collections/stations/records?filter=status="operational"&limit=10`);
          const stationData = await stationRes.json();
          setActiveStations(stationData.items || []);
        } catch (error) {
          console.log('Stations collection not found, skipping...', error);
          setActiveStations([]);
        }

      } catch (error) {
        console.error("Failed to fetch mission data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissionData();
  }, [isOnline]);

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Loading Mission Control...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Mission Control', headerBackTitle: 'Back' }} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Upcoming Launches Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🚀 Upcoming Launches</ThemedText>
          {upcomingLaunches.length > 0 ? (
            <FlatList
              data={upcomingLaunches}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <UpcomingLaunchCard item={item} />}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No upcoming launches scheduled</ThemedText>
            </View>
          )}
        </View>

        {/* Docking Events Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🔗 Docking Events</ThemedText>
          {dockingEvents.length > 0 ? (
            <FlatList
              data={dockingEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <DockingEventCard item={item} />}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No docking events scheduled</ThemedText>
            </View>
          )}
        </View>

        {/* Active Stations Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🛰️ Active Stations</ThemedText>
          {activeStations.length > 0 ? (
            <FlatList
              data={activeStations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ActiveStationCard item={item} />}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No active stations found</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  launchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 100,
  },
  launchImage: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
  },
  launchContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  launchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  launchDate: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 2,
  },
  launchProvider: {
    fontSize: 12,
    color: '#999',
  },
  dockingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  dockingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dockingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  dockingTime: {
    fontSize: 12,
    color: '#ccc',
  },
  dockingDescription: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 8,
  },
  dockingStation: {
    fontSize: 12,
    color: '#999',
  },
  stationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stationLocation: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 4,
  },
  stationStatus: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  stationCrew: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});