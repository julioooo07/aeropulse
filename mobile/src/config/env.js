import Constants from "expo-constants";

const extraUrl = Constants.expoConfig?.extra?.apiBaseUrl;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  extraUrl ||
  "http://localhost:5000/api";

export const BRANCHES = [
  "Bulacan",
  "Cavite",
  "Laguna",
  "Bataan",
  "Pangasinan",
  "Ilocos"
];
