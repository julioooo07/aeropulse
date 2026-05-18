import React from "react";
import { Redirect } from "expo-router";

export default function CartRedirect() {
  return <Redirect href="/(customer)/(tabs)/cart" />;
}
