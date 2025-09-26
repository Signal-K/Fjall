import { ThemedText } from '@/components/themed-text';
import { Mission, Pad, PBEvent } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { PB_URL } from '@/constants/pocketbase';
import { Ionicons } from '@expo/vector-icons';

// Platform-specific map component
const PlatformMap = ({ latitude, longitude, name }: { latitude: number; longitude: number; name: string }) => {
  const [MapComponent, setMapComponent] = useState<any>(null);

  useEffect(() => {
    const loadMapComponent = async () => {
      if (Platform.OS === 'web') {
        try {
          const { WebMap } = await import('../../components/WebMap');
          setMapComponent(() => WebMap);
        } catch (error) {
          console.warn('Failed to load WebMap:', error);
        }
      } else {
        try {
          const { NativeMap } = await import('../../components/NativeMap');
          setMapComponent(() => NativeMap);
        } catch (error) {
          console.warn('Failed to load NativeMap:', error);
        }
      }
    };

    loadMapComponent();
  }, []);

  if (!MapComponent) {
    return (
      <View style={[styles.map, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' }]}>
        <ActivityIndicator size="small" color="#fff" />
        <ThemedText style={{ color: '#fff', marginTop: 8 }}>Loading map...</ThemedText>
      </View>
    );
  }

  return <MapComponent latitude={latitude} longitude={longitude} name={name} />;
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<PBEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline] = useState(true); // Always online for now
  const [following, setFollowing] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [providerData, setProviderData] = useState<any>(null);
  const [missionData, setMissionData] = useState<Mission | null>(null);
  const [padData, setPadData] = useState<Pad | null>(null);

  useEffect(() => {
    if (!event) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const launchTime = new Date(event.datetime).getTime();
      const timeLeft = launchTime - now;

      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [event]);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const cacheKey = `event_${id}`;
        // Load from cache first (show immediately) but still fetch fresh/expanded data in background
        const cachedRaw = await AsyncStorage.getItem(cacheKey);
        let usedCache = false;
        if (cachedRaw) {
          try {
            const parsed = JSON.parse(cachedRaw);
            const { data: cachedEvent, timestamp } = parsed;
            const now = Date.now();
            const cacheAge = now - timestamp;
            const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
            if (cacheAge < cacheExpiry) {
              setEvent(cachedEvent);
              setLoading(false);
              usedCache = true;
              // continue to fetch fresh data below to populate expanded/provider/pad fields
            }
          } catch (e) {
            // ignore malformed cache and continue
            console.warn('Failed to parse cached event:', e);
          }
        }

        if (isOnline) {
          // If we showed a cached event, avoid showing the spinner again while we refresh in background
          if (!usedCache) setLoading(true);
          // First try without expand to see raw data
          const res = await fetch(`${PB_URL}/api/collections/events/records/${id}`);
          const rawData = await res.json();
          console.log('Raw event data:', rawData);
          
          // Then try with expand
          const resExpanded = await fetch(`${PB_URL}/api/collections/events/records/${id}?expand=launchpad,spacedevs_id`);
          const data = await resExpanded.json();
          console.log('Expanded event data:', data);
          setEvent(data);

          // If we have a provider ID, fetch the provider data separately
          if (data.spacedevs_id && typeof data.spacedevs_id === 'string') {
            console.log('Fetching provider data for ID:', data.spacedevs_id);
            
            // Try different collection names
            const collectionNames = ['spacedevs_providers', 'providers', 'launch_providers', 'launch_service_providers', 'spacedevs', 'agencies'];
            
            for (const collectionName of collectionNames) {
              try {
                console.log(`Trying collection: ${collectionName}`);
                const providerUrl = `${PB_URL}/api/collections/${collectionName}/records/${data.spacedevs_id}`;
                console.log('Provider URL:', providerUrl);
                
                const providerRes = await fetch(providerUrl);
                console.log(`Response status for ${collectionName}:`, providerRes.status);
                
                if (providerRes.ok) {
                  const providerInfo = await providerRes.json();
                  console.log('Provider info found:', providerInfo);
                  setProviderData(providerInfo);
                  break; // Stop trying other collections
                } else {
                  const errorText = await providerRes.text();
                  console.log(`Collection ${collectionName} failed with status ${providerRes.status}:`, errorText);
                }
              } catch (providerError) {
                console.log(`Collection ${collectionName} failed with error:`, providerError instanceof Error ? providerError.message : 'Unknown error');
              }
            }
          } else {
            console.log('No provider ID found or not a string:', data.spacedevs_id);
          }

          // If we have a mission ID, fetch the mission data
          if (data.mission_id && typeof data.mission_id === 'string') {
            try {
              console.log('Fetching mission data for ID:', data.mission_id);
              const missionRes = await fetch(`${PB_URL}/api/collections/missions/records/${data.mission_id}`);
              if (missionRes.ok) {
                const missionInfo = await missionRes.json();
                console.log('Mission info:', missionInfo);
                setMissionData(missionInfo);
              } else {
                console.log('Failed to fetch mission data');
              }
            } catch (missionError) {
              console.error('Failed to fetch mission:', missionError);
            }
          }

          // If we have a pad ID, fetch the pad data
          if (data.pad_id && typeof data.pad_id === 'string') {
            try {
              console.log('Fetching pad data for ID:', data.pad_id);
              const padRes = await fetch(`${PB_URL}/api/collections/pads/records/${data.pad_id}`);
              if (padRes.ok) {
                const padInfo = await padRes.json();
                console.log('Pad info:', padInfo);
                setPadData(padInfo);
              } else {
                console.log('Failed to fetch pad data');
              }
            } catch (padError) {
              console.error('Failed to fetch pad:', padError);
            }
          }

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

  const handleBack = () => router.back();

  const HeaderLeft = () => (
    <TouchableOpacity onPress={handleBack} style={{ marginLeft: 10 }}>
      <Ionicons name="arrow-back-circle-outline" size={30} color="white" />
    </TouchableOpacity>
  );

  const HeaderRight = () => (
    <View style={{ flexDirection: 'row', marginRight: 10 }}>
      <TouchableOpacity style={{ marginRight: 15 }}>
        <Ionicons name="add-circle-outline" size={30} color="white" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="notifications-outline" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );

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

  const provider = (event.expand as any)?.spacedevs_id || event.spacedevs_id;
  const launchpad = (event.expand as any)?.launchpad;

  console.log('Event data:', event);
  console.log('Provider data:', provider);
  console.log('Event expand:', event.expand);
  console.log('Direct spacedevs_id:', event.spacedevs_id);
  console.log('Provider type:', typeof provider);

  const date = new Date(event.datetime);
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const localTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  // Assume Florida Launch Pad time (Eastern Time)
  const floridaTime = new Date(date.getTime() - (4 * 60 * 60 * 1000)); // UTC to EDT (assuming event is in UTC)
  const floridaTimeString = floridaTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' });

  // Normalize provider/pad sources: prefer fetched providerData/padData, fall back to expanded objects
  const providerObj = providerData || (provider && typeof provider === 'object' ? provider : null);
  const providerIdString = provider && typeof provider === 'string' ? provider : null;
  const padObj = padData || (launchpad && typeof launchpad === 'object' ? launchpad : null);

  return (
    <View style={styles.container}>
        <Stack.Screen options={{
          headerTransparent: true,
          headerLeft: HeaderLeft,
          headerRight: HeaderRight,
        }} />
        <ScrollView>
            {imageUrl && <Image source={{ uri: imageUrl }} style={styles.coverImage} />}
            <View style={styles.contentContainer}>
                <ThemedText style={styles.title}>{event.title}</ThemedText>
                <View style={styles.dateWidget}>
                    <View style={styles.dateHeader}>
                        <Ionicons name="calendar-outline" size={20} color="#fff" />
                        <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
                    </View>
          {/* Status / go-for-launch info (from PocketBase fields) */}
          {(event.status_abbrev || event.status_description) && (
            <View style={{ marginTop: 8, marginBottom: 8 }}>
              <ThemedText style={{ color: '#fff', fontWeight: '600' }}>{event.status_abbrev || ''}</ThemedText>
              {event.status_description ? (
                <ThemedText style={{ color: '#ccc', fontSize: 12 }}>{event.status_description}</ThemedText>
              ) : null}
            </View>
          )}

          {/* Show a brief recent update if available */}
          {event.updates && Array.isArray(event.updates) && event.updates.length > 0 && (
            <View style={{ marginTop: 8, marginBottom: 8 }}>
              <ThemedText style={{ color: '#ddd', fontSize: 13, fontWeight: '600' }}>{event.updates[0].title || 'Update'}</ThemedText>
              {event.updates[0].description ? (
                <ThemedText style={{ color: '#aaa', fontSize: 12 }}>{event.updates[0].description}</ThemedText>
              ) : null}
            </View>
          )}

        {/* Provider: prefer fetched providerData, then expanded object, then show a simple ID fallback */}
        {providerObj && (
          <View style={styles.providerWidget}>
            {providerObj?.logo_url && (
              <Image source={{ uri: providerObj.logo_url }} style={styles.providerLogo} />
            )}
            <View style={styles.providerInfo}>
              <ThemedText style={styles.providerName}>{providerObj?.name || 'Unknown Provider'}</ThemedText>
              {providerObj?.type && (
                <ThemedText style={styles.providerType}>{providerObj.type}</ThemedText>
              )}
              {providerObj?.country_code && (
                <ThemedText style={styles.providerCountry}>{providerObj.country_code}</ThemedText>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.followButton, following && styles.followingButton]} 
              onPress={() => setFollowing(!following)}
            >
              <ThemedText style={styles.followButtonText}>{following ? 'Following' : 'Follow'}</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {!providerObj && providerIdString && (
          <View style={styles.providerWidget}>
            <Image 
              source={{ uri: 'https://logos-world.net/wp-content/uploads/2020/09/SpaceX-Logo.png' }} 
              style={styles.providerLogo} 
            />
            <View style={styles.providerInfo}>
              <ThemedText style={styles.providerName}>{providerIdString}</ThemedText>
              <ThemedText style={styles.providerType}>Provider ID</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.followButton, following && styles.followingButton]} 
              onPress={() => setFollowing(!following)}
            >
              <ThemedText style={styles.followButtonText}>{following ? 'Following' : 'Follow'}</ThemedText>
            </TouchableOpacity>
          </View>
        )}

                    <ThemedText style={styles.liftoffTime}>
                        Liftoff at {localTime} (local time) • {floridaTimeString} (launch pad)
                    </ThemedText>
                    <ThemedText style={styles.confirmationText}>
                        Liftoff time confirmed by official or reliable sources
                    </ThemedText>
                </View>

                <View style={styles.countdownSection}>
                    <ThemedText style={styles.countdownHeader}>T-Minus</ThemedText>
                    <View style={styles.countdownWidget}>
                        <ThemedText style={styles.countdownText}>
                            {countdown.days.toString().padStart(2, '0')} : {countdown.hours.toString().padStart(2, '0')} : {countdown.minutes.toString().padStart(2, '0')} : {countdown.seconds.toString().padStart(2, '0')}
                        </ThemedText>
                    </View>
                    <View style={styles.notificationSection}>
                        <Ionicons name="notifications-outline" size={16} color="#ccc" />
                        <ThemedText style={styles.notificationText}>
                            Now targeting {formattedDate} at {date.toISOString().split('T')[1].substring(0, 5)} UTC
                        </ThemedText>
                    </View>
                </View>

                {missionData && (
                    <View style={styles.missionWidget}>
                        <ThemedText style={styles.orbitType}>{missionData.orbit_type || 'Orbit'}</ThemedText>
                        <ThemedText style={styles.missionName}>{missionData.name}</ThemedText>
                        {missionData.description && (
                            <ThemedText style={styles.missionDescription}>{missionData.description}</ThemedText>
                        )}
                    </View>
                )}

        {/* Pad: prefer fetched padData, then expanded launchpad object */}
        {padObj && (
          <View style={styles.padWidget}>
            <ThemedText style={styles.padName}>{padObj?.name || 'Unknown Pad'}</ThemedText>

            {( (padObj as any)?.latitude && (padObj as any)?.longitude ) && (
              <View style={styles.mapContainer}>
                <PlatformMap
                  latitude={(padObj as any).latitude}
                  longitude={(padObj as any).longitude}
                  name={(padObj as any).name}
                />
              </View>
            )}

            {(padObj as any)?.country_code && (
              <ThemedText style={styles.countryCode}>{(padObj as any).country_code}</ThemedText>
            )}
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
  },
  providerWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  providerLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  providerType: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 2,
  },
  providerCountry: {
    fontSize: 14,
    color: '#ccc',
  },
  followButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  followingButton: {
    backgroundColor: '#28a745',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateWidget: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  liftoffTime: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  confirmationText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  countdownSection: {
    marginBottom: 20,
  },
  countdownHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  countdownWidget: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 60, // Ensure enough height for the numbers
  },
  countdownText: {
    fontSize: 28, // Slightly smaller to fit better
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
    letterSpacing: 1, // Reduced letter spacing
    lineHeight: 32, // Ensure proper line height
  },
  notificationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
  },
  missionWidget: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  orbitType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  missionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  missionDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  padWidget: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  padName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapText: {
    fontSize: 14,
    color: '#007bff',
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
  countryCode: {
    fontSize: 14,
    color: '#ccc',
    textTransform: 'uppercase',
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  }
});
