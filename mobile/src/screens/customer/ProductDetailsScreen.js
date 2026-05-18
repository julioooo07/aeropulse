import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Chip, Text } from "react-native-paper";
import Screen from "../../components/Screen";
import { useCart } from "../../state/CartContext";
import { colors, spacing } from "../../theme/theme";
import { peso } from "../../utils/format";

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();
  const disabled = Number(product.stock || 0) <= 0;
  return (
    <Screen>
      {product.image ? <Image source={{ uri: product.image }} style={styles.image} /> : <View style={styles.placeholder}><Text>AC Unit</Text></View>}
      <View style={styles.row}>
        <Chip>{product.category}</Chip>
        <Text style={disabled ? styles.out : styles.stock}>{product.stockLabel}</Text>
      </View>
      <Text variant="headlineSmall">{product.name}</Text>
      <Text style={styles.muted}>{product.brand} • {product.specs || product.sku}</Text>
      <Text variant="headlineSmall" style={styles.price}>{peso(product.price)}</Text>
      <Text>{product.description || "Energy efficient AC unit ready for branch fulfillment and installation."}</Text>
      <Button mode="contained" disabled={disabled} icon="cart-plus" onPress={() => addToCart(product)}>Add to cart</Button>
      <Button mode="contained-tonal" disabled={disabled} onPress={() => { addToCart(product); navigation.navigate("Checkout"); }}>Buy now</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  image: { height: 230, borderRadius: 8, backgroundColor: "#e2e8f0" },
  placeholder: { height: 230, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#d9f1ee" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
  muted: { color: colors.muted },
  price: { color: colors.primaryDark, fontWeight: "800" },
  stock: { color: colors.success },
  out: { color: colors.danger }
});
