import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Menu, Text, TextInput } from "react-native-paper";
import Screen from "../../components/Screen";
import { ErrorBanner } from "../../components/StateViews";
import { BRANCHES } from "../../config/env";
import { useAuth } from "../../state/AuthContext";
import { colors, spacing } from "../../theme/theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [showBranches, setShowBranches] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await login({ identifier, password, branch });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text variant="headlineMedium" style={styles.brand}>AeroPulse</Text>
        <Text style={styles.subtitle}>Customer POS and technician work orders</Text>
      </View>
      <ErrorBanner message={error} />
      <TextInput label="Email or alias" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" mode="outlined" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" />
      <Menu
        visible={showBranches}
        onDismiss={() => setShowBranches(false)}
        anchor={<Button mode="outlined" onPress={() => setShowBranches(true)}>{branch || "Select branch for technician login"}</Button>}
      >
        <Menu.Item title="No branch / customer" onPress={() => { setBranch(""); setShowBranches(false); }} />
        {BRANCHES.map((item) => (
          <Menu.Item key={item} title={item} onPress={() => { setBranch(item); setShowBranches(false); }} />
        ))}
      </Menu>
      <Button mode="contained" loading={busy} disabled={busy} onPress={submit} icon="login">
        Sign in
      </Button>
      <Button onPress={() => navigation.navigate("Register")}>Create customer account</Button>
      <Button onPress={() => navigation.navigate("ForgotPassword")}>Forgot password?</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingVertical: spacing.xl,
    gap: spacing.sm
  },
  brand: {
    color: colors.primaryDark,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.muted
  }
});
