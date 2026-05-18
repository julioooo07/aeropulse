import React, { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Button, Card, Input, Screen, SectionTitle } from "@/components/ui";
import { forgotPassword } from "@/services/authService";
import { colors } from "@/theme/tokens";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    try {
      const response = await forgotPassword(email.trim());
      setMessage(response.message || "Reset instructions sent.");
    } catch (err: any) {
      const text = err?.message || "Unable to send reset instructions.";
      setMessage(text);
      Alert.alert("Password reset", text);
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <SectionTitle title="Reset password" subtitle="Request the reset email from the mobile app." />
      <Card style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
        <Button title="Send reset email" onPress={submit} />
        {message ? <Text style={styles.helper}>{message}</Text> : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 56, paddingBottom: 32 },
  card: { gap: 12 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  helper: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
});
