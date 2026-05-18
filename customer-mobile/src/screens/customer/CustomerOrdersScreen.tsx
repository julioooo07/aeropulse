import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Screen, SectionTitle } from "@/components/ui";
import { getMyOrderSummary, listMyOrders } from "@/services/orderService";
import { colors } from "@/theme/tokens";

export default function CustomerOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    Promise.allSettled([listMyOrders(), getMyOrderSummary()]).then(([ordersRes, summaryRes]) => {
      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value.orders || []);
      if (summaryRes.status === "fulfilled") setSummary(summaryRes.value);
    });
  }, []);

  return (
    <Screen>
      <SectionTitle title="Orders" subtitle="Track customer order states from the same backend flow as the web app." />
      <Card>
        <Text style={styles.summaryLabel}>Total orders</Text>
        <Text style={styles.summaryValue}>{summary?.orders?.total || orders.length}</Text>
      </Card>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" subtitle="Your placed orders will appear here." />
      ) : (
        <FlatList
          data={orders}
          scrollEnabled={false}
          keyExtractor={(item) => String(item.id || item._id || item.orderCode)}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <Card style={{ gap: 8 }}>
              <Text style={styles.orderTitle}>{item.orderCode || item.id}</Text>
              <Text style={styles.meta}>Status: {item.workflowStatus || item.status}</Text>
              <Text style={styles.meta}>Total: PHP {Number(item.totalAmount || 0).toLocaleString()}</Text>
              <Text style={styles.meta}>Tracking: {item.trackingNumber || "Pending"}</Text>
            </Card>
          )}
        />
      )}
      <Button title="Refresh" variant="secondary" onPress={() => Promise.allSettled([listMyOrders(), getMyOrderSummary()]).then(([ordersRes, summaryRes]) => {
        if (ordersRes.status === "fulfilled") setOrders(ordersRes.value.orders || []);
        if (summaryRes.status === "fulfilled") setSummary(summaryRes.value);
      })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  summaryValue: { color: colors.text, fontSize: 32, fontWeight: "900" },
  orderTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  meta: { color: colors.textMuted, fontSize: 12 },
});
