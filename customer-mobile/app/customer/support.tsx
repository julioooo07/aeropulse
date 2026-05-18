import React from "react";
import { Redirect } from "expo-router";

export default function SupportRedirect() {
  return <Redirect href="/(customer)/support" />;
}
