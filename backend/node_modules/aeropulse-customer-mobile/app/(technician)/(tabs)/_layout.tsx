import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TechnicianTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#0f172a" }}>
      <Tabs.Screen name="tasks" options={{ title: "Tasks", tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="construct" color={color} size={size} /> }} />
      <Tabs.Screen name="history" options={{ title: "History", tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="time" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
