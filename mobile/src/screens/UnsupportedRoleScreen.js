import React from "react";
import { Button, Text } from "react-native-paper";
import Screen from "../components/Screen";
import { useAuth } from "../state/AuthContext";

export default function UnsupportedRoleScreen() {
  const { role, logout } = useAuth();
  return (
    <Screen>
      <Text variant="headlineSmall">Mobile access is for customers and technicians</Text>
      <Text>
        This app includes customer POS and technician work orders only. Please use the web system for the {role || "current"} account.
      </Text>
      <Button mode="contained" onPress={logout}>Sign out</Button>
    </Screen>
  );
}
