import React from "react";
import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Screen, SectionTitle } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme/tokens";

export default function TechnicianProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <Screen>
      <SectionTitle title="Technician profile" subtitle="Basic account, settings, and logout access." />
      <Card style={{ gap: 6 }}>
        <Text style={styles.title}>{user?.name || "Technician"}</Text>
        <Text style={styles.meta}>{user?.email}</Text>
        <Text style={styles.meta}>{user?.assignedBranch || user?.activeBranch || "Branch not set"}</Text>
      </Card>
      <Button title="Log out" variant="danger" onPress={async () => { await logout(); router.replace("/(auth)/login"); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 16, fontWeight: "800" },
  meta: { color: colors.textMuted, fontSize: 12 },
});
