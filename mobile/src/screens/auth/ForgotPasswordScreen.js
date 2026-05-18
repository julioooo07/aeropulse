import React, { useState } from "react";
import { Button, Text, TextInput } from "react-native-paper";
import Screen from "../../components/Screen";
import { ErrorBanner } from "../../components/StateViews";
import { AuthApi } from "../../services/api";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await AuthApi.forgotPassword(email);
      setMessage(result.message || "Please check your email for reset instructions.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ErrorBanner message={error} />
      {message ? <Text>{message}</Text> : null}
      <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" mode="outlined" />
      <Button mode="contained" loading={busy} onPress={submit}>Send reset link</Button>
    </Screen>
  );
}
