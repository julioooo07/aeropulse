import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import CustomerScreen from "../../components/customer/CustomerScreen";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { COLORS, FONT, SPACING } from "../../constants/theme";
import { useCart } from "../../context/CartContext";
import { useUserContext } from "../../context/UserContext";
import * as api from "../../services/api";

function pickDefaultAddress(user) {
  const addresses = Array.isArray(user?.addresses) ? user.addresses : [];
  if (addresses.length === 0) return null;
  return addresses.find((a) => a?.isDefault) || addresses[0];
}

function formatSavedAddress(address) {
  const parts = [
    address?.street,
    address?.barangay,
    address?.city,
    address?.province,
    address?.region,
    address?.postalCode,
  ]
    .map((v) => String(v || "").trim())
    .filter(Boolean);

  return parts.join(", ");
}

export default function CustomerCheckoutScreen() {
  const router = useRouter();
  const { token, current } = useUserContext();
  const { items, total, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const selectedAddress = pickDefaultAddress(current);
  const selectedAddressText = selectedAddress
    ? formatSavedAddress(selectedAddress)
    : "";
  const missingAddress = !selectedAddress;

  const handlePlaceOrder = async () => {
    if (!current || !token) {
      Alert.alert("Login required", "Please sign in to place your order.");
      router.push("/sign-in");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Cart is empty", "Add items to your cart first.");
      router.replace("/customer/shop");
      return;
    }

    if (missingAddress) {
      Alert.alert(
        "Address required",
        "No saved delivery address found. Please add an address to your account before checking out.",
        [{ text: "Go to Settings", onPress: () => router.push("/customer/settings") }],
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: items.map((item) => ({
          id: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          specs: item.specs,
        })),
        addressId: String(selectedAddress?._id || selectedAddress?.id || ""),
        address: selectedAddress || {},
        paymentMethod: "cod",
        total,
      };

      const { ok, data } = await api.post("/orders", payload, token);

      if (ok && (data?.order || data?.success)) {
        clear();
        Alert.alert(
          "Order placed!",
          "Your order has been submitted and is pending approval.",
          [{ text: "View Orders", onPress: () => router.replace("/customer/orders") }],
        );
      } else {
        Alert.alert("Order failed", data?.message || data?.error || "Could not place order.");
      }
    } catch {
      Alert.alert("Order failed", "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerScreen title="Checkout" subtitle="Confirm delivery details">
      {items.length === 0 ? (
        <Card>
          <EmptyState
            title="No items to checkout"
            message="Your cart is empty."
            icon="cart-outline"
            iconColor={COLORS.primary}
            action={<Button title="Go to Shop" onPress={() => router.replace("/customer/shop")} />}
          />
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom: SPACING.md }}>
            <Text style={{ fontWeight: FONT.bold, fontSize: FONT.base }}>Delivery Address</Text>
            {missingAddress ? (
              <Text style={{ color: COLORS.danger, marginTop: SPACING.xs }}>
                Missing address — add a saved delivery address first.
              </Text>
            ) : (
              <Text style={{ color: COLORS.textSecondary, marginTop: SPACING.xs }}>
                {selectedAddressText || "Saved address on file"}
              </Text>
            )}
            <Button
              title="Edit in Settings"
              variant="secondary"
              compact
              style={{ marginTop: SPACING.sm }}
              onPress={() => router.push("/customer/settings")}
              leftIcon={<Ionicons name="create" size={16} color={COLORS.textPrimary} />}
            />
          </Card>

          <Card style={{ marginBottom: SPACING.md }}>
            <Text style={{ fontWeight: FONT.bold, fontSize: FONT.base, marginBottom: SPACING.sm }}>
              Items
            </Text>
            {items.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: SPACING.sm,
                }}
              >
                <Text style={{ flex: 1, paddingRight: SPACING.sm }}>
                  {item.name} x{item.quantity}
                </Text>
                <Text>
                  ₱{Number((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                </Text>
              </View>
            ))}
            <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm }} />
            <Text style={{ fontWeight: FONT.bold, fontSize: FONT.base }}>
              Total: ₱{Number(total || 0).toLocaleString()}
            </Text>
          </Card>

          <Button
            title={submitting ? "Placing Order..." : "Place Order"}
            disabled={submitting}
            onPress={handlePlaceOrder}
          />
        </>
      )}
    </CustomerScreen>
  );
}
