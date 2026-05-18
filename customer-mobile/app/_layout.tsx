import React, { useMemo } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { getRoleHomePath } from "@/navigation/roleRoutes";

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <AutoGuestRedirect />
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }} />
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AutoGuestRedirect() {
  // placed here so it has access to the AuthProvider in this file
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const auth = useAuth();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();

  React.useEffect(() => {
    if (!auth) return;
    // When auth has hydrated and there's no token, ensure we route to guest dashboard
    if (auth.hydrated && !auth.token) {
      const target = getRoleHomePath(null);
      // Replace current entry so back doesn't go back to login
      router.replace(target);
    }
  }, [auth, router]);

  return null;
}
