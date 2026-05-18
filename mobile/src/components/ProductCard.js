import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Card, Chip, Text } from "react-native-paper";
import { peso } from "../utils/format";
import { colors, spacing } from "../theme/theme";

export default function ProductCard({ product, onPress, onAdd }) {
  const disabled = Number(product.stock || 0) <= 0;
  return (
    <Card style={styles.card} mode="elevated" onPress={onPress}>
      {product.image ? <Image source={{ uri: product.image }} style={styles.image} /> : <View style={styles.placeholder}><Text>AC</Text></View>}
      <Card.Content style={styles.content}>
        <View style={styles.row}>
          <Chip compact>{product.category}</Chip>
          <Text style={disabled ? styles.out : styles.stock}>{product.stockLabel}</Text>
        </View>
        <Text variant="titleMedium" numberOfLines={2}>{product.name}</Text>
        <Text style={styles.muted}>{product.brand} • {product.specs || product.sku}</Text>
        <Text variant="titleLarge" style={styles.price}>{peso(product.price)}</Text>
        <Button mode="contained" disabled={disabled} onPress={onAdd} icon="cart-plus">
          Add
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 8,
    overflow: "hidden"
  },
  image: {
    height: 150,
    backgroundColor: "#e2e8f0"
  },
  placeholder: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d9f1ee"
  },
  content: {
    gap: spacing.sm,
    paddingTop: spacing.md
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  muted: {
    color: colors.muted
  },
  price: {
    color: colors.primaryDark,
    fontWeight: "700"
  },
  stock: {
    color: colors.success,
    fontSize: 12
  },
  out: {
    color: colors.danger,
    fontSize: 12
  }
});
