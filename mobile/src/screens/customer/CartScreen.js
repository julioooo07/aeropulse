import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Divider, IconButton, Text } from "react-native-paper";
import Screen from "../../components/Screen";
import { EmptyView } from "../../components/StateViews";
import { useCart } from "../../state/CartContext";
import { colors, spacing } from "../../theme/theme";
import { peso } from "../../utils/format";

export default function CartScreen({ navigation }) {
  const { cart, subtotal, updateQuantity, removeFromCart } = useCart();
  if (cart.length === 0) {
    return <Screen><EmptyView title="Your cart is empty" actionLabel="Shop products" onAction={() => navigation.navigate("Shop")} /></Screen>;
  }
  return (
    <Screen>
      <Text variant="headlineSmall">Cart</Text>
      {cart.map((item) => (
        <View key={item.id} style={styles.item}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium">{item.name}</Text>
            <Text style={styles.muted}>{item.specs || item.sku}</Text>
            <Text style={styles.price}>{peso(item.price)}</Text>
          </View>
          <View style={styles.qty}>
            <IconButton icon="minus" onPress={() => updateQuantity(item.id, item.quantity - 1)} />
            <Text>{item.quantity}</Text>
            <IconButton icon="plus" onPress={() => updateQuantity(item.id, item.quantity + 1)} />
            <IconButton icon="delete" onPress={() => removeFromCart(item.id)} />
          </View>
        </View>
      ))}
      <Divider />
      <View style={styles.total}><Text variant="titleMedium">Subtotal</Text><Text variant="titleLarge">{peso(subtotal)}</Text></View>
      <Button mode="contained" icon="credit-card-check" onPress={() => navigation.navigate("Checkout")}>Checkout</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, gap: spacing.sm },
  qty: { flexDirection: "row", alignItems: "center" },
  muted: { color: colors.muted },
  price: { color: colors.primaryDark, fontWeight: "700" },
  total: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }
});
