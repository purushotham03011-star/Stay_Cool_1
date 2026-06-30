import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.stayhub.app',
  appName: 'StayHub',
  webDir: 'dist',

  server: {
    // During development: allows API calls to localhost backend
    // For production: remove androidScheme or update to your domain
    androidScheme: 'https',
    // Allows mixed content (http API calls from https app) - needed for localhost dev
    allowNavigation: ['localhost', '*.stayhub.co'],
  },

  android: {
    // Allows cleartext traffic to localhost backend in debug builds
    allowMixedContent: true,
    // Set minimum SDK to 22 (Android 5.1) for broad compatibility
    minWebViewVersion: 60,
    // Back button behavior: hardware back dismisses modals
    captureInput: false,
  },

  ios: {
    // Allow scrolling inside WKWebView
    scrollEnabled: true,
    // Respect the safe area - do not go under notch
    contentInset: 'always',
    // Limiter on bounce scroll
    limitsNavigationsToAppBoundDomains: false,
  },

  plugins: {
    // Prevent keyboard from pushing up the app layout on Android
    Keyboard: {
      resize: 'ionic',
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#f8fafc',
      showSpinner: false,
    },
  },
};

export default config;

