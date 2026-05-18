import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Divider, RadioButton, Text } from "react-native-paper";
import Screen from "../../components/Screen";
import { EmptyView, ErrorBanner, LoadingView } from "../../components/StateViews";
import { computePurchaseTotals, computeStockIssues, resolvePreferredBranch } from "../../domain/purchase";
import { OrdersApi, ProductsApi, UsersApi } from "../../services/api";
import { useCart } from "../../state/CartContext";
import { colors, spacing } from "../../theme/theme";
import { normalizeAddress, peso } from "../../utils/format";
import { validateAddressForm } from "../../utils/validators";

export default function CheckoutScreen({ navigation }) {
  const { cart, subtotal, clearCart, syncCartStock } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [stockIssues, setStockIssues] = useState([]);
  const [stockCheckedAt, setStockCheckedAt] = useState("");

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

  const verifyStock = useCallback(async () => {
    const latestProducts = await ProductsApi.public();
    const issues = computeStockIssues(cart, latestProducts.products || []);
    setStockIssues(issues);
    setStockCheckedAt(new Date().toISOString());
    return issues;
  }, [cart]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    verifyStock();
  }, [verifyStock]);

  const selectedAddress = addresses.find((item) => item.id === selectedId);
  const branch = selectedAddress ? resolvePreferredBranch(selectedAddress) : "";
  const totals = useMemo(
    () => computePurchaseTotals({ subtotal, serviceAreaId: branch.toLowerCase() }),
    [subtotal, branch],
  );

  const placeOrder = async () => {
    setBusy(true);
    setError("");

    try {
      const issues = await verifyStock();
      if (issues.length > 0) {
        setError("Some items are no longer available. Please update your cart and try again.");
        return;
      }

      if (!selectedAddress) {
        setError("Please select a delivery address.");
        return;
      }

      const addressValidation = validateAddressForm(selectedAddress);
      if (!addressValidation.valid) {
        setError(Object.values(addressValidation.errors)[0]);
        return;
      }

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
  if (cart.length === 0)
    return (
      <Screen>
        <EmptyView title="Cart is empty" actionLabel="Shop products" onAction={() => navigation.navigate("Shop")} />
      </Screen>
    );

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
          <Button mode="outlined" onPress={() => navigation.navigate("AddressForm", { onSaved: "Checkout" })}>
            Add address
          </Button>
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
      {stockIssues.length > 0 ? (
        <Card style={styles.stockCard}>
          <Card.Content style={styles.gap}>
            <Text variant="titleMedium">Stock issues detected</Text>
            {stockIssues.map((issue) => (
              <Text key={`${issue.id}-${issue.code}`}>
                {issue.name}: requested {issue.desired}, available {issue.available}
              </Text>
            ))}
            {stockCheckedAt ? <Text style={styles.stockTimestamp}>Last checked: {new Date(stockCheckedAt).toLocaleTimeString()}</Text> : null}
          </Card.Content>
        </Card>
      ) : null}
      <Card style={styles.card}>
        <Card.Content style={styles.gap}>
          <Text variant="titleMedium">Order summary</Text>
          {cart.map((item) => (
            <Text key={item.id}>
              {item.name} x{item.quantity} • {peso(item.price * item.quantity)}
            </Text>
          ))}
          <Divider />
          <Row label="Subtotal" value={peso(totals.subtotal)} />
          <Row label="VAT" value={peso(totals.vatAmount)} />
          <Row label="Delivery" value={peso(totals.deliveryFee)} />
          <Row label="Total" value={peso(totals.total)} strong />
        </Card.Content>
      </Card>
      <Button mode="contained" loading={busy} disabled={busy || !selectedAddress || stockIssues.length > 0} onPress={placeOrder}>
        Place order
      </Button>
    </Screen>
  );
}

function Row({ label, value, strong }) {
  return (
    <View style={styles.row}>
      <Text variant={strong ? "titleMedium" : "bodyMedium"}>{label}</Text>
      <Text variant={strong ? "titleMedium" : "bodyMedium"}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 8 },
  stockCard: { borderRadius: 8, borderWidth: 1, borderColor: colors.error, backgroundColor: "#fff4f4" },
  gap: { gap: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between" },
  branch: { color: colors.primaryDark, fontWeight: "700" },
  stockTimestamp: { color: colors.muted, fontSize: 12 }
});
