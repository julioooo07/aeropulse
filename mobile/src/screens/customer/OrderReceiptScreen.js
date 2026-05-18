import React from "react";
import { Button, Card, Text } from "react-native-paper";
import Screen from "../../components/Screen";
import { peso } from "../../utils/format";

export default function OrderReceiptScreen({ route, navigation }) {
  const { order } = route.params;
  return (
    <Screen>
      <Text variant="headlineSmall">Order received</Text>
      <Card>
        <Card.Content>
          <Text variant="titleMedium">{order.orderCode}</Text>
          <Text>Receipt: {order.receipt?.receiptNumber || "Pending"}</Text>
          <Text>Tracking: {order.trackingNumber || "Pending"}</Text>
          <Text>Total: {peso(order.totalAmount)}</Text>
          <Text>Status: {order.workflowLabel || order.workflowStatus}</Text>
        </Card.Content>
      </Card>
      <Button mode="contained" onPress={() => navigation.navigate("Orders")}>Track order</Button>
      <Button onPress={() => navigation.navigate("Shop")}>Continue shopping</Button>
    </Screen>
  );
}
