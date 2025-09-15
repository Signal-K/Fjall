import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function TabLayout() {
  const tabBarActiveTintColor = useThemeColor({}, 'tint');
  const tabBarBackgroundColor = useThemeColor({}, 'background');
  const tabBarBorderColor = useThemeColor({ light: 'rgba(0, 0, 0, 0.1)', dark: 'rgba(255, 255, 255, 0.1)' }, 'text');
  const tabBarActiveBackgroundColor = useThemeColor({ light: 'rgba(0, 122, 255, 0.08)', dark: 'rgba(0, 122, 255, 0.12)' }, 'tint');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: tabBarBackgroundColor,
            borderColor: tabBarBorderColor,
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveBackgroundColor: tabBarActiveBackgroundColor,
        tabBarInactiveBackgroundColor: 'transparent',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name="house"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="payloads"
        options={{
          title: 'Payloads',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name="cube"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="expeditions"
        options={{
          title: 'Expeditions',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name="globe.americas"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mission-control"
        options={{
          title: 'Control',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={24}
              name="command"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingBottom: 0,
    paddingTop: 8,
  },
  tabBarItem: {
    borderRadius: 25,
    marginHorizontal: 4,
    marginVertical: 8,
    paddingVertical: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
