import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const TOKEN_KEY = "aeropulse.accessToken";
export const USER_KEY = "aeropulse.currentUser";
export const BRANCH_KEY = "aeropulse.activeBranch";
export const CART_KEY = "aeropulse.cart";

export async function saveToken(token) {
  if (!token) return SecureStore.deleteItemAsync(TOKEN_KEY);
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function setJson(key, value) {
  if (value === undefined || value === null) return AsyncStorage.removeItem(key);
  return AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getJson(key, fallback = null) {
  const value = await AsyncStorage.getItem(key);
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

export async function removeMany(keys) {
  await AsyncStorage.multiRemove(keys);
}
