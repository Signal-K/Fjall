import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useColorScheme as _useColorScheme } from 'react-native';

export function useColorScheme() {
  const systemColorScheme = _useColorScheme();
  const [userColorScheme, setUserColorScheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setUserColorScheme(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    const newTheme = userColorScheme === 'dark' ? 'light' : 'dark';
    setUserColorScheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Return user preference if set, otherwise system preference
  const colorScheme = userColorScheme || systemColorScheme || 'light';

  return {
    colorScheme,
    toggleTheme,
    isUsingSystemTheme: userColorScheme === null,
  };
}