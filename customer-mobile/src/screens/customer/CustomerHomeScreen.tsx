import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, EmptyState, Screen, SectionTitle } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { listMyNotifications } from "@/services/notificationService";
import { getMyOrderSummary } from "@/services/orderService";
import { listPublicProducts } from "@/services/catalogService";
import type { NotificationItem, Product } from "@/types/domain";
import { colors } from "@/theme/tokens";

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { user, logout, token } = useAuth();
  const { addItem } = useCart();
  const [summary, setSummary] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    // Only call protected endpoints when a token is present. Public products are always loaded.
    const calls: Promise<any>[] = [];

    if (token) {
      calls.push(getMyOrderSummary());
      calls.push(listMyNotifications());
    }
    // Always request public products
    calls.push(listPublicProducts());

    Promise.allSettled(calls).then((results) => {
      // If token present, results[0]=orders, results[1]=notifications, results[2]=products
      // If no token, results[0]=products
      if (token) {
        const [orderRes, notifRes, productRes] = results;
        if (orderRes && orderRes.status === "fulfilled") setSummary(orderRes.value);
        if (notifRes && notifRes.status === "fulfilled") setNotifications(notifRes.value.notifications || []);
        if (productRes && productRes.status === "fulfilled") setFeatured((productRes.value.products || []).slice(0, 4));
      } else {
        const [productRes] = results;
        if (productRes && productRes.status === "fulfilled") setFeatured((productRes.value.products || []).slice(0, 4));
      }
    });
  }, [token]);

  return (
    <Screen>
      <SectionTitle
        title={`Welcome${user?.name ? `, ${user.name}` : ""}`}
        subtitle="Browse products, manage orders, and keep track of service updates."
      />

      <Card style={styles.statsCard}>
        <Text style={styles.statLabel}>Orders</Text>
        <Text style={styles.statValue}>{summary?.orders?.total || summary?.totalOrders || 0}</Text>
        <Text style={styles.statHelper}>Track active and completed transactions.</Text>
      </Card>

      <View style={styles.quickActions}>
        <Button title="Shop now" onPress={() => router.push("/customer/shop")} />
        <Button title="Orders" variant="secondary" onPress={() => router.push("/customer/orders")} />
        <Button title="Support" variant="secondary" onPress={() => router.push("/customer/support")} />
        <Button title="Notifications" variant="secondary" onPress={() => router.push("/customer/notifications")} />
      </View>

      <SectionTitle title="Featured products" subtitle="Pulled from the same public product API as the web shop." />
      {featured.length === 0 ? (
        <EmptyState title="No featured products loaded" subtitle="Pulls from /products/public once the app is connected." />
      ) : (
        <FlatList
          data={featured}
          scrollEnabled={false}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push("/customer/shop")}>
              <Card style={styles.productCard}>
                <View style={styles.productRow}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={styles.productTitle}>{item.name}</Text>
                    <Text style={styles.productMeta}>{item.brand} · {item.specs}</Text>
                    <Text style={styles.productPrice}>PHP {Number(item.price || 0).toLocaleString()}</Text>
                  </View>
                  {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.thumb} /> : null}
                </View>
                <Button title="Add to cart" onPress={() => addItem(item)} />
              </Card>
            </Pressable>
          )}
        />
      )}

      <SectionTitle title="Latest notifications" />
      {notifications.length === 0 ? (
        <EmptyState title="No notifications yet" subtitle="Updates from orders and account activity will appear here." />
      ) : (
        notifications.slice(0, 3).map((item) => (
          <Card key={String(item.id || item._id)} style={{ gap: 4 }}>
            <Text style={styles.productTitle}>{item.title}</Text>
            <Text style={styles.productMeta}>{item.message}</Text>
          </Card>
        ))
      )}

      <Button
        title="Log out"
        variant="ghost"
        onPress={async () => {
          await logout();
          router.replace("/(auth)/login");
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsCard: { gap: 6 },
  statLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  statValue: { color: colors.text, fontSize: 34, fontWeight: "900" },
  statHelper: { color: colors.textMuted, fontSize: 12 },
  quickActions: { gap: 10 },
  productCard: { gap: 14 },
  productRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  productTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  productMeta: { color: colors.textMuted, fontSize: 12 },
  productPrice: { color: colors.accent, fontSize: 15, fontWeight: "800" },
  thumb: { width: 72, height: 72, borderRadius: 16, backgroundColor: colors.surfaceMuted },
});
