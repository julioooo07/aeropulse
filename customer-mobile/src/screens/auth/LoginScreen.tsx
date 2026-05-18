import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Input, Screen, SectionTitle } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { getRoleHomePath } from "@/navigation/roleRoutes";
import { colors } from "@/theme/tokens";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setError("");
      const role = await login(identifier.trim(), password);
      router.replace(getRoleHomePath(role));
    } catch (err: any) {
      const message = err?.message || "Unable to log in.";
      setError(message);
      Alert.alert("Login failed", message);
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <SectionTitle
        title="AeroPulse Mobile"
        subtitle="Customer POS and technician workflow in one mobile app."
      />

      <Card style={styles.card}>
        <Text style={styles.label}>Email, alias, or phone</Text>
        <Input value={identifier} onChangeText={setIdentifier} autoCapitalize="none" placeholder="you@example.com" />

        <Text style={styles.label}>Password</Text>
        <Input value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={{ gap: 10 }}>
          <Button title={loading ? "Signing in..." : "Sign in"} onPress={submit} />
          <Button title="Create account" variant="secondary" onPress={() => router.push("/(auth)/register")} />
          <Button title="Forgot password" variant="ghost" onPress={() => router.push("/(auth)/forgot-password")} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 56, paddingBottom: 32 },
  card: { gap: 12 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: "700", marginTop: 4 },
  error: { color: colors.danger, fontSize: 13, marginTop: 6 },
});
