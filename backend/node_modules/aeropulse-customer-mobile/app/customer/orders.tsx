import React from "react";
import { Redirect } from "expo-router";

export default function OrdersRedirect() {
  return <Redirect href="/(customer)/(tabs)/orders" />;
}
