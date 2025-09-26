import { ThemeProvider as CustomThemeProvider } from '@/hooks/use-theme';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  // Don't throw here — running without Clerk is allowed for local dev.
  // Throwing during module initialization prevents the whole app from
  // rendering which shows up as an endless loading state. Instead, we
  // render the app without Clerk and warn in the console so developers can
  // notice and set the env var if they need authentication features.
  console.warn('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Continuing without Clerk (local dev only).');
}

export default function RootLayout() {
  const AppInner = (
    <CustomThemeProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </CustomThemeProvider>
  );

  // If we have a publishable key, provide Clerk context; otherwise render
  // the app without authentication for local development.
  return publishableKey ? (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {AppInner}
    </ClerkProvider>
  ) : (
    AppInner
  );
}
