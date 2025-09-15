import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Stack } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export default function SettingsScreen() {
  const { theme, setTheme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Settings', headerBackTitle: 'Back' }} />

      <View style={styles.content}>
        <ThemedText type="title">Settings</ThemedText>

        <View style={styles.spacer} />

        <ThemedText type="subtitle">Theme</ThemedText>
        <View style={styles.themeButtons}>
          <Pressable onPress={() => setTheme('light')} style={[styles.button, theme === 'light' && styles.selected]}>
            <ThemedText>Light</ThemedText>
          </Pressable>
          <Pressable onPress={() => setTheme('dark')} style={[styles.button, theme === 'dark' && styles.selected]}>
            <ThemedText>Dark</ThemedText>
          </Pressable>
          <Pressable onPress={() => setTheme('system')} style={[styles.button, theme === 'system' && styles.selected]}>
            <ThemedText>System</ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  spacer: {
    height: 20,
  },
  themeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#888',
  },
  selected: {
    borderColor: '#fff',
    backgroundColor: '#333',
  },
});