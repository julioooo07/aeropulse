import React, { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import Screen from "../../components/Screen";
import { DashboardApi, NotificationsApi, OrdersApi } from "../../services/api";
import { useAuth } from "../../state/AuthContext";
import { colors, spacing } from "../../theme/theme";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [orders, notes] = await Promise.all([
        OrdersApi.summary().catch(() => ({ summary: null })),
        NotificationsApi.mine().catch(() => ({ notifications: [] })),
        DashboardApi.me().catch(() => null)
      ]);
      setSummary(orders.summary);
      setNotifications(notes.notifications || []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const unread = notifications.filter((item) => item.unread !== false && item.status !== "read").length;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      <Text variant="headlineSmall">Hi, {user?.name_first || user?.name || "Customer"}</Text>
      <Text style={styles.muted}>Shop, track, and manage AC services from one mobile POS workspace.</Text>
      <View style={styles.grid}>
        <Card style={styles.tile} onPress={() => navigation.navigate("Shop")}>
          <Card.Content><Text variant="titleMedium">Shop AC Units</Text><Text style={styles.muted}>Browse live inventory</Text></Card.Content>
        </Card>
        <Card style={styles.tile} onPress={() => navigation.navigate("Orders")}>
          <Card.Content><Text variant="titleMedium">Orders</Text><Text style={styles.muted}>{summary?.toPay || 0} awaiting payment</Text></Card.Content>
        </Card>
        <Card style={styles.tile} onPress={() => navigation.navigate("Notifications")}>
          <Card.Content><Text variant="titleMedium">Notifications</Text><Text style={styles.muted}>{unread} unread</Text></Card.Content>
        </Card>
        <Card style={styles.tile} onPress={() => navigation.navigate("Profile")}>
          <Card.Content><Text variant="titleMedium">Profile</Text><Text style={styles.muted}>Addresses and account</Text></Card.Content>
        </Card>
      </View>
      <Button mode="contained" icon="cart" onPress={() => navigation.navigate("Shop")}>Start POS order</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted },
  grid: { gap: spacing.md },
  tile: { borderRadius: 8 }
});
