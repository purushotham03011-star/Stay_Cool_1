/**
 * mobileOpen.ts
 * 
 * Mobile-safe URL opener for Capacitor WebView.
 * 
 * Strategy:
 * - On native Android/iOS: uses Capacitor's global `Plugins.App.openUrl`
 *   OR falls back to `window.open` which Capacitor intercepts natively.
 * - On web: uses window.open() normally.
 * 
 * This approach does NOT require @capacitor/browser to be installed.
 * 
 * Usage: mobileOpen('https://...')
 */

export function mobileOpen(url: string): void {
  try {
    // Check if running inside a Capacitor native app
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cap = (window as any).Capacitor;
    if (cap && cap.isNativePlatform && cap.isNativePlatform()) {
      // In native Capacitor: window.open is intercepted by the WebView bridge
      // and opens in the system browser (SFSafariViewController / Chrome Custom Tab)
      window.open(url, '_system');
      return;
    }
  } catch {
    // Not in a Capacitor context
  }

  // Web fallback: open in new tab safely
  window.open(url, '_blank', 'noopener,noreferrer');
}
