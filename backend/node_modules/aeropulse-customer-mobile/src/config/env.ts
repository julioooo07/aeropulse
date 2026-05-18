import { Platform } from "react-native";
import Constants from "expo-constants";

const manifestBaseUrl =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)
    ?.apiBaseUrl || "";

const runtimeBaseUrl =
  ((globalThis as { process?: { env?: { EXPO_PUBLIC_API_BASE_URL?: string } } }).process
    ?.env?.EXPO_PUBLIC_API_BASE_URL || "");

let resolvedBase = runtimeBaseUrl || manifestBaseUrl;

if (Platform.OS === "web") {
  // If a developer set EXPO_PUBLIC_API_BASE_URL to the Android emulator loopback
  // address (10.0.2.2), browsers can't reach that. Replace it with the
  // current page host so web builds point to the machine running the backend.
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  if (resolvedBase && resolvedBase.includes("10.0.2.2")) {
    resolvedBase = resolvedBase.replace(/10\.0\.2\.2/g, host);
  }
  // Default for web is localhost (same machine as backend)
  resolvedBase = resolvedBase || `http://${host}:5000/api`;
} else {
  // Native defaults: Android emulator uses 10.0.2.2 to reach host machine.
  resolvedBase = resolvedBase || `http://10.0.2.2:5000/api`;
}

export const API_BASE_URL = resolvedBase;
