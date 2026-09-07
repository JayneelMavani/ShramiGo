/**
 * Helper to detect if the app is launched / running in PWA standalone mode
 */
export function isPwaMode(): boolean {
  if (typeof window === "undefined") return false;

  // 1. Check if launched with ?source=pwa query parameter
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("source") === "pwa") {
    // Remember in session that this session is running as PWA
    try {
      sessionStorage.setItem("shramigo_pwa_mode", "true");
    } catch {
      // Ignore
    }
    return true;
  }

  // 2. Check if sessionStorage has remembered PWA mode
  try {
    if (sessionStorage.getItem("shramigo_pwa_mode") === "true") {
      return true;
    }
  } catch {
    // Ignore
  }

  // 3. Check standard standalone display-mode media query
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }

  // 4. Check iOS Safari standalone property
  if ((window.navigator as unknown as { standalone?: boolean }).standalone === true) {
    return true;
  }

  // 5. Check Android TWA referrer
  if (document.referrer.includes("android-app://")) {
    return true;
  }

  return false;
}
