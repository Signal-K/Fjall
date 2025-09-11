import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';

const PB_URL = 'http://192.168.1.139:8080';

interface Expedition {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  station: string;
  url?: string;
  crew: string[];
  patches?: string;
}

export default function ExpeditionsScreen() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${PB_URL}/api/collections/expeditions/records?expand=station&perPage=100`)
      .then(res => res.json())
      .then(data => {
        setExpeditions(data.items || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load expeditions');
        setLoading(false);
      });
  }, []);

  const renderExpedition = ({ item }: { item: Expedition }) => (
    <View style={styles.card}>
      {item.patches ? (
        <Image
          source={{
            uri: item.patches.startsWith('http')
              ? item.patches.replace(/^https?:\/?/, 'https://') // ensure double slash for malformed URLs
              : `${PB_URL}/api/files/expeditions/${item.id}/${item.patches}`
          }}
          style={styles.patch}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.patch, styles.patchPlaceholder]} />
      )}
      <View style={styles.info}>
        <ThemedText type="title" style={styles.name}>{item.name}</ThemedText>
        <ThemedText type="subtitle" style={styles.station}>{item.station}</ThemedText>
        <Text style={styles.timeframe}>
          {item.start_date} - {item.end_date}
        </Text>
        {item.url && (
          <Text style={styles.link} numberOfLines={1}>{item.url}</Text>
        )}
      </View>
    </View>
  );

  if (loading) return <ThemedView style={styles.center}><ThemedText>Loading...</ThemedText></ThemedView>;
  if (error) return <ThemedView style={styles.center}><ThemedText>{error}</ThemedText></ThemedView>;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#222', dark: '#111' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.pageTitle}>Expeditions</ThemedText>
      </ThemedView>
      <FlatList
        data={expeditions}
        renderItem={renderExpedition}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        numColumns={Dimensions.get('window').width > 600 ? 2 : 1}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 120,
    width: 200,
    alignSelf: 'center',
    marginTop: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#181818',
    borderRadius: 18,
    marginBottom: 18,
    marginHorizontal: 6,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    minHeight: 140,
  },
  patch: {
    width: 120,
    height: 120,
    backgroundColor: '#222',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  patchPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  info: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  station: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 4,
  },
  timeframe: {
    fontSize: 15,
    color: '#ccc',
    marginBottom: 6,
  },
  link: {
    color: '#4faaff',
    fontSize: 13,
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
