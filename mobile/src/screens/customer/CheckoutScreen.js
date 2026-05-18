import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Divider, RadioButton, Text } from "react-native-paper";
import Screen from "../../components/Screen";
import { EmptyView, ErrorBanner, LoadingView } from "../../components/StateViews";
import { computePurchaseTotals, resolvePreferredBranch } from "../../domain/purchase";
import { OrdersApi, ProductsApi, UsersApi } from "../../services/api";
import { useCart } from "../../state/CartContext";
import { colors, spacing } from "../../theme/theme";
import { normalizeAddress, peso } from "../../utils/format";

export default function CheckoutScreen({ navigation }) {
  const { cart, subtotal, clearCart, syncCartStock } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await UsersApi.addresses();
      const mapped = (result.addresses || []).map(normalizeAddress);
      setAddresses(mapped);
      const selected = mapped.find((item) => item.isDefault) || mapped[0];
      setSelectedId((prev) => prev || selected?.id || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const selectedAddress = addresses.find((item) => item.id === selectedId);
  const branch = selectedAddress ? resolvePreferredBranch(selectedAddress) : "";
  const totals = useMemo(() => computePurchaseTotals({ subtotal, serviceAreaId: branch.toLowerCase() }), [subtotal, branch]);

  const placeOrder = async () => {
    setBusy(true);
    setError("");
    try {
      const latestProducts = await ProductsApi.public();
      const mappedProducts = (latestProducts.products || []).map((item) => ({ id: item.id, sku: item.sku, stock: Number(item.stock || 0) }));
      syncCartStock(mappedProducts);
      if (!selectedAddress) throw new Error("Please select a delivery address.");
      const result = await OrdersApi.create({
        items: cart,
        addressId: selectedAddress.id,
        address: selectedAddress,
        paymentMethod,
        total: totals.total
      });
      clearCart();
      navigation.replace("OrderReceipt", { order: result.order });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingView label="Preparing checkout..." />;
  if (cart.length === 0) return <Screen><EmptyView title="Cart is empty" actionLabel="Shop products" onAction={() => navigation.navigate("Shop")} /></Screen>;

  return (
    <Screen>
      <Text variant="headlineSmall">Checkout</Text>
      <ErrorBanner message={error} />
      <Card style={styles.card}>
        <Card.Content style={styles.gap}>
          <Text variant="titleMedium">Delivery address</Text>
          {addresses.map((item) => (
            <RadioButton.Item
              key={item.id}
              label={`${item.label || item.name} - ${item.street}, ${item.city}`}
              value={item.id}
              status={selectedId === item.id ? "checked" : "unchecked"}
              onPress={() => setSelectedId(item.id)}
            />
          ))}
          <Button mode="outlined" onPress={() => navigation.navigate("AddressForm", { onSaved: "Checkout" })}>Add address</Button>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Payment</Text>
          <RadioButton.Group value={paymentMethod} onValueChange={setPaymentMethod}>
            <RadioButton.Item label="Cash on Delivery" value="cod" />
            <RadioButton.Item label="GCash / gateway approval" value="gcash" />
            <RadioButton.Item label="Card / gateway approval" value="card" />
          </RadioButton.Group>
        </Card.Content>
      </Card>
      {branch ? <Text style={styles.branch}>Fulfillment branch: {branch}</Text> : null}
      <Card style={styles.card}>
        <Card.Content style={styles.gap}>
          <Text variant="titleMedium">Order summary</Text>
          {cart.map((item) => <Text key={item.id}>{item.name} x{item.quantity} • {peso(item.price * item.quantity)}</Text>)}
          <Divider />
          <Row label="Subtotal" value={peso(totals.subtotal)} />
          <Row label="VAT" value={peso(totals.vatAmount)} />
          <Row label="Delivery" value={peso(totals.deliveryFee)} />
          <Row label="Total" value={peso(totals.total)} strong />
        </Card.Content>
      </Card>
      <Button mode="contained" loading={busy} disabled={busy || !selectedAddress} onPress={placeOrder}>Place order</Button>
    </Screen>
  );
}

function Row({ label, value, strong }) {
  return <View style={styles.row}><Text variant={strong ? "titleMedium" : "bodyMedium"}>{label}</Text><Text variant={strong ? "titleMedium" : "bodyMedium"}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 8 },
  gap: { gap: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between" },
  branch: { color: colors.primaryDark, fontWeight: "700" }
});
