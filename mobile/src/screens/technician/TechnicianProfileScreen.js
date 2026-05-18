import React from "react";
import { Card, Text } from "react-native-paper";
import Screen from "../../components/Screen";
import { useAuth } from "../../state/AuthContext";

export default function TechnicianProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <Screen>
      <Text variant="headlineSmall">Technician Profile</Text>
      <Card>
        <Card.Content>
          <Text variant="titleMedium">{user?.name || `${user?.name_first || ""} ${user?.name_last || ""}`.trim()}</Text>
          <Text>{user?.email}</Text>
          <Text>{user?.phone}</Text>
          <Text>Branch: {user?.activeBranch || user?.assignedBranch || "Not assigned"}</Text>
        </Card.Content>
      </Card>
      <Text onPress={logout}>Sign out</Text>
    </Screen>
  );
}
