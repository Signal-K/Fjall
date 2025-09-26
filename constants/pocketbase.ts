// constants/pocketbase.ts
// Use the public env var when provided (recommended). Fall back to localhost for
// typical local development (web). If you're running on mobile emulators or
// devices, you may need to set EXPO_PUBLIC_PB_URL to the host's LAN IP or use
// emulator-specific addresses (e.g. 10.0.2.2 for Android emulator).
export const PB_URL = process.env.EXPO_PUBLIC_PB_URL || 'http://localhost:8080';
