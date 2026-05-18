import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CustomerTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#0f172a" }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="shop" options={{ title: "Shop", tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="grid" color={color} size={size} /> }} />
      <Tabs.Screen name="cart" options={{ title: "Cart", tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="cart" color={color} size={size} /> }} />
      <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="receipt" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
