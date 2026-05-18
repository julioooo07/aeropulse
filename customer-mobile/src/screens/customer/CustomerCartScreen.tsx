import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, EmptyState, Screen, SectionTitle } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { colors } from "@/theme/tokens";

export default function CustomerCartScreen() {
  const router = useRouter();
  const { items, totalAmount, totalItems, updateQuantity, removeItem } = useCart();

  return (
    <Screen>
      <SectionTitle title="Cart" subtitle="Review your items before checkout." />
      {items.length === 0 ? (
        <EmptyState title="Your cart is empty" subtitle="Add something from the shop first." />
      ) : (
        <FlatList
          data={items}
          scrollEnabled={false}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <Card style={{ gap: 10 }}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.meta}>{item.brand} · {item.specs}</Text>
              <Text style={styles.price}>PHP {Number(item.price || 0).toLocaleString()}</Text>
              <View style={styles.qtyRow}>
                <Button title="-" variant="secondary" onPress={() => updateQuantity(item.id, item.quantity - 1)} />
                <Text style={styles.qty}>{item.quantity}</Text>
                <Button title="+" variant="secondary" onPress={() => updateQuantity(item.id, item.quantity + 1)} />
                <Button title="Remove" variant="ghost" onPress={() => removeItem(item.id)} />
              </View>
            </Card>
          )}
        />
      )}

      <Card style={{ gap: 8 }}>
        <Text style={styles.meta}>Items: {totalItems}</Text>
        <Text style={styles.total}>Total: PHP {totalAmount.toLocaleString()}</Text>
      </Card>

      <Button title="Proceed to checkout" onPress={() => router.push("/customer/checkout")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 16, fontWeight: "800" },
  meta: { color: colors.textMuted, fontSize: 12 },
  price: { color: colors.accent, fontWeight: "800" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  qty: { color: colors.text, fontSize: 16, fontWeight: "800", minWidth: 24, textAlign: "center" },
  total: { color: colors.text, fontSize: 18, fontWeight: "900" },
});
