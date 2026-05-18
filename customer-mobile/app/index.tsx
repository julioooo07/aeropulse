import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { getRoleHomePath } from "@/navigation/roleRoutes";
import CustomerHomeScreen from "@/screens/customer/CustomerHomeScreen";

export default function Index() {
  const { hydrated, token, role } = useAuth();

  if (!hydrated) return null;
  // If there's no token, render the customer home screen directly so guests can explore.
  if (!token) return <CustomerHomeScreen />;
  return <Redirect href={getRoleHomePath(role)} />;
}
