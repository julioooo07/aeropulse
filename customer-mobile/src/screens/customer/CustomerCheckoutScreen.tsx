import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, EmptyState, Screen, SectionTitle } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/services/orderService";
import { listAddresses } from "@/services/userService";
import { colors } from "@/theme/tokens";

export default function CustomerCheckoutScreen() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listAddresses().then((res: any) => {
      const data = res.addresses || res || [];
      setAddresses(data);
      const defaultAddress = data.find((item: any) => item.isDefault) || data[0];
      if (defaultAddress) setSelectedAddressId(String(defaultAddress._id || defaultAddress.id));
    }).catch(() => setAddresses([]));
  }, []);

  const selectedAddress = useMemo(
    () => addresses.find((item) => String(item._id || item.id) === selectedAddressId),
    [addresses, selectedAddressId],
  );

  const placeOrder = async () => {
    if (!items.length) return;
    if (!selectedAddress) {
      Alert.alert("Checkout", "Add a delivery address before placing an order.");
      return;
    }
    setLoading(true);
    try {
      const response: any = await createOrder({
        items,
        address: selectedAddress,
        addressId: selectedAddressId,
        paymentMethod: "cod",
        total: totalAmount,
        mockPaymentSuccess: false,
      });
      clearCart();
      router.replace({ pathname: "/(customer)/(tabs)/orders" });
      Alert.alert("Order placed", response.message || "Your order has been submitted.");
    } catch (err: any) {
      Alert.alert("Checkout failed", err?.message || "Unable to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <SectionTitle title="Checkout" subtitle="Uses the same order creation API as the web POS flow." />

      {items.length === 0 ? (
        <EmptyState title="No items to checkout" subtitle="Return to the shop and add products first." />
      ) : (
        <>
          <Card style={{ gap: 10 }}>
            <Text style={styles.subtitle}>Delivery address</Text>
            {addresses.length === 0 ? (
              <Text style={styles.helper}>No saved address found. Add one from your profile first.</Text>
            ) : (
              <FlatList
                data={addresses}
                scrollEnabled={false}
                keyExtractor={(item) => String(item._id || item.id)}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => {
                  const selected = String(item._id || item.id) === selectedAddressId;
                  return (
                    <Pressable onPress={() => setSelectedAddressId(String(item._id || item.id))}>
                      <Card style={[styles.addressCard, selected && styles.addressCardSelected]}>
                        <Text style={styles.addressTitle}>{item.label || item.name || "Address"}</Text>
                        <Text style={styles.helper}>{item.street}, {item.city}</Text>
                      </Card>
                    </Pressable>
                  );
                }}
              />
            )}
          </Card>

          <Card style={{ gap: 8 }}>
            <Text style={styles.subtitle}>Order total</Text>
            <Text style={styles.total}>PHP {totalAmount.toLocaleString()}</Text>
            <Text style={styles.helper}>Payment method: Cash on delivery</Text>
          </Card>

          <Button title={loading ? "Placing order..." : "Place order"} onPress={placeOrder} />
          <Button title="Add address" variant="secondary" onPress={() => router.push("/customer/profile")} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  helper: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  total: { color: colors.text, fontSize: 24, fontWeight: "900" },
  addressCard: { padding: 12 },
  addressCardSelected: { borderColor: colors.accent, borderWidth: 1.5 },
  addressTitle: { color: colors.text, fontWeight: "800", fontSize: 14 },
});
