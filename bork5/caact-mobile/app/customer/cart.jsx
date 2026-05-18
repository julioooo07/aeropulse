import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Alert, Text, View } from "react-native";

import CustomerScreen from "../../components/customer/CustomerScreen";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { COLORS, FONT, SPACING } from "../../constants/theme";
import { useCart } from "../../context/CartContext";
import { useUserContext } from "../../context/UserContext";

export default function CustomerCartScreen() {
  const router = useRouter();
  const { token, current } = useUserContext();
  const { items, total, setQuantity, removeItem, clear } = useCart();

  const handleCheckout = () => {
    if (!current || !token) {
      Alert.alert("Login required", "Please sign in to checkout.");
      router.push("/sign-in");
      return;
    }

    router.push("/customer/checkout");
  };

  return (
    <CustomerScreen title="Cart" subtitle="Review items before checkout">
      {items.length === 0 ? (
        <Card>
          <EmptyState
            title="Your cart is empty"
            message="Browse the shop to add AC units to your cart."
            icon="cart-outline"
            iconColor={COLORS.primary}
            action={<Button title="Go to Shop" onPress={() => router.push("/customer/shop")} />}
          />
        </Card>
      ) : (
        <>
          {items.map((item) => (
            <Card key={item.id} style={{ marginBottom: SPACING.md }}>
              <Text style={{ fontWeight: FONT.bold, fontSize: FONT.base }}>
                {item.name}
              </Text>
              {item.specs ? (
                <Text style={{ color: COLORS.textSecondary, marginTop: 2 }}>{item.specs}</Text>
              ) : null}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: SPACING.sm,
                }}
              >
                <Text style={{ color: COLORS.primary, fontWeight: FONT.bold }}>
                  ₱{Number(item.price || 0).toLocaleString()}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Button
                    title="-"
                    compact
                    variant="secondary"
                    onPress={() => setQuantity(item.id, (Number(item.quantity) || 1) - 1)}
                  />
                  <Text style={{ minWidth: 18, textAlign: "center", fontWeight: FONT.bold }}>
                    {item.quantity}
                  </Text>
                  <Button
                    title="+"
                    compact
                    onPress={() => setQuantity(item.id, (Number(item.quantity) || 1) + 1)}
                  />
                </View>
              </View>

              <Button
                title="Remove"
                variant="danger"
                compact
                style={{ marginTop: SPACING.sm }}
                onPress={() => removeItem(item.id)}
                leftIcon={<Ionicons name="trash" size={16} color={COLORS.surface} />}
              />
            </Card>
          ))}

          <Card>
            <Text style={{ fontWeight: FONT.bold, fontSize: FONT.base }}>Summary</Text>
            <Text style={{ color: COLORS.textSecondary, marginTop: SPACING.xs }}>
              Total: ₱{Number(total || 0).toLocaleString()}
            </Text>

            <View style={{ flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md }}>
              <View style={{ flex: 1 }}>
                <Button title="Checkout" onPress={handleCheckout} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Clear" variant="secondary" onPress={clear} />
              </View>
            </View>
          </Card>
        </>
      )}
    </CustomerScreen>
  );
}
