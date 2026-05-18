import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Chip, Text } from "react-native-paper";
import { orderStatusLabel, peso, shortDate } from "../utils/format";
import { colors, spacing } from "../theme/theme";

export default function OrderCard({ order, showAction = false, onAction }) {
  const items = Array.isArray(order.items) ? order.items : [];
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content style={styles.content}>
        <View style={styles.row}>
          <Text variant="titleMedium">{order.orderCode || order.id}</Text>
          <Chip compact>{orderStatusLabel(order.workflowStatus)}</Chip>
        </View>
        <Text style={styles.muted}>{items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</Text>
        <Text style={styles.muted}>ETA {shortDate(order.estimatedArrival || order.estimatedDelivery)}</Text>
        <View style={styles.row}>
          <Text variant="titleMedium" style={styles.price}>{peso(order.totalAmount || order.total)}</Text>
          {showAction && order.workflowStatus !== "complete" && order.workflowStatus !== "cancelled" ? (
            <Button mode="contained-tonal" onPress={onAction}>Update</Button>
          ) : null}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 8
  },
  content: {
    gap: spacing.sm
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  muted: {
    color: colors.muted
  },
  price: {
    color: colors.primaryDark,
    fontWeight: "700"
  }
});
