import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import { LoadingView } from "../components/StateViews";
import { useAuth } from "../state/AuthContext";
import { colors } from "../theme/theme";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import HomeScreen from "../screens/customer/HomeScreen";
import ShopScreen from "../screens/customer/ShopScreen";
import ProductDetailsScreen from "../screens/customer/ProductDetailsScreen";
import CartScreen from "../screens/customer/CartScreen";
import CheckoutScreen from "../screens/customer/CheckoutScreen";
import OrdersScreen from "../screens/customer/OrdersScreen";
import OrderReceiptScreen from "../screens/customer/OrderReceiptScreen";
import NotificationsScreen from "../screens/customer/NotificationsScreen";
import ProfileScreen from "../screens/customer/ProfileScreen";
import AddressFormScreen from "../screens/customer/AddressFormScreen";
import ServicesScreen from "../screens/customer/ServicesScreen";
import TechnicianDashboardScreen from "../screens/technician/TechnicianDashboardScreen";
import WorkOrdersScreen from "../screens/technician/WorkOrdersScreen";
import WorkOrderDetailsScreen from "../screens/technician/WorkOrderDetailsScreen";
import TechnicianProfileScreen from "../screens/technician/TechnicianProfileScreen";
import UnsupportedRoleScreen from "../screens/UnsupportedRoleScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const tabIcon = (name) => ({ color, size }) => <MaterialCommunityIcons name={name} color={color} size={size} />;

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: "Register" }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true, title: "Recover Password" }} />
    </Stack.Navigator>
  );
}

function CustomerPosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Shop" component={ShopScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: "Product" }} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderReceipt" component={OrderReceiptScreen} options={{ title: "Receipt" }} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen} options={{ title: "Address" }} />
    </Stack.Navigator>
  );
}

function CustomerTabs() {
  const { logout } = useAuth();
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.primary, headerRight: () => <Button onPress={logout}>Logout</Button> }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: tabIcon("home-outline") }} />
      <Tab.Screen name="POS" component={CustomerPosStack} options={{ headerShown: false, tabBarIcon: tabIcon("cart-outline") }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarIcon: tabIcon("clipboard-list-outline") }} />
      <Tab.Screen name="Services" component={ServicesScreen} options={{ tabBarIcon: tabIcon("tools") }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarIcon: tabIcon("bell-outline") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: tabIcon("account-outline") }} />
    </Tab.Navigator>
  );
}

function TechnicianWorkStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="WorkOrders" component={WorkOrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WorkOrderDetails" component={WorkOrderDetailsScreen} options={{ title: "Work Order" }} />
    </Stack.Navigator>
  );
}

function TechnicianTabs() {
  const { logout } = useAuth();
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.primary, headerRight: () => <Button onPress={logout}>Logout</Button> }}>
      <Tab.Screen name="TechHome" component={TechnicianDashboardScreen} options={{ title: "Home", tabBarIcon: tabIcon("view-dashboard-outline") }} />
      <Tab.Screen name="TechWork" component={TechnicianWorkStack} options={{ title: "Work Orders", headerShown: false, tabBarIcon: tabIcon("clipboard-check-outline") }} />
      <Tab.Screen name="TechnicianProfile" component={TechnicianProfileScreen} options={{ title: "Profile", tabBarIcon: tabIcon("account-hard-hat-outline") }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { loading, isAuthenticated, role } = useAuth();
  if (loading) return <LoadingView label="Starting AeroPulse..." />;
  if (!isAuthenticated) return <AuthStack />;
  if (role === "customer") return <CustomerTabs />;
  if (role === "technician") return <TechnicianTabs />;
  return <UnsupportedRoleScreen />;
}
