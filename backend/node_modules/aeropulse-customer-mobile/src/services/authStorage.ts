import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "aeropulse.mobile.token";
const CART_KEY = "aeropulse.mobile.cart";

export const authStorage = {
  async getToken() {
    // On web or when SecureStore native methods are unavailable, fall back to AsyncStorage
    if (Platform.OS === "web" || typeof (SecureStore as any).getItemAsync !== "function") {
      return AsyncStorage.getItem(TOKEN_KEY);
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async setToken(token: string | null) {
    if (!token) {
      if (Platform.OS === "web" || typeof (SecureStore as any).deleteItemAsync !== "function") {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
      return;
    }
    if (Platform.OS === "web" || typeof (SecureStore as any).setItemAsync !== "function") {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  },
  async saveCart(cart: unknown) {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  },
  async getCart<T>() {
    const raw = await AsyncStorage.getItem(CART_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async clearCart() {
    await AsyncStorage.removeItem(CART_KEY);
  },
};
