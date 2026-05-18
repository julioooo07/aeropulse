import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Input, Screen, SectionTitle } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { getRoleHomePath } from "@/navigation/roleRoutes";
import { colors } from "@/theme/tokens";

export default function RegisterScreen() {
  const router = useRouter();
  const { requestRegistrationStart, verifyRegistration, register, loading } = useAuth();
  const [step, setStep] = useState<"email" | "verify" | "profile">("email");
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [alias, setAlias] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const autoAlias = useMemo(() => email.trim().split("@")[0] || "customer", [email]);

  const requestCode = async () => {
    try {
      const result = await requestRegistrationStart(email.trim());
      setSecret(result.secret);
      setStep("verify");
      setError("");
    } catch (err: any) {
      const message = err?.message || "Unable to start registration.";
      setError(message);
      Alert.alert("Registration", message);
    }
  };

  const verifyCode = async () => {
    try {
      await verifyRegistration({ email: email.trim(), code: code.trim(), secret });
      setStep("profile");
      setError("");
    } catch (err: any) {
      const message = err?.message || "Invalid verification code.";
      setError(message);
      Alert.alert("Verification", message);
    }
  };

  const completeRegistration = async () => {
    try {
      const role = await register({
        name_first: firstName.trim(),
        name_last: lastName.trim(),
        alias: (alias.trim() || autoAlias).toLowerCase(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: "customer",
        locations: [],
      });
      router.replace(getRoleHomePath(role));
    } catch (err: any) {
      const message = err?.message || "Unable to create account.";
      setError(message);
      Alert.alert("Registration", message);
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <SectionTitle title="Create your account" subtitle="Email verification comes first, then profile details." />

      <Card style={styles.card}>
        {step === "email" && (
          <>
            <Text style={styles.label}>Email</Text>
            <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
            <Button title={loading ? "Sending code..." : "Send verification code"} onPress={requestCode} />
          </>
        )}

        {step === "verify" && (
          <>
            <Text style={styles.label}>Verification code</Text>
            <Input value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="6-digit code" />
            <Text style={styles.helper}>Use the TOTP code shown by the backend or authenticator flow.</Text>
            <Button title={loading ? "Verifying..." : "Verify code"} onPress={verifyCode} />
          </>
        )}

        {step === "profile" && (
          <>
            <Text style={styles.label}>First name</Text>
            <Input value={firstName} onChangeText={setFirstName} placeholder="Juan" />
            <Text style={styles.label}>Last name</Text>
            <Input value={lastName} onChangeText={setLastName} placeholder="Dela Cruz" />
            <Text style={styles.label}>Alias</Text>
            <Input value={alias} onChangeText={setAlias} placeholder={autoAlias} autoCapitalize="none" />
            <Text style={styles.label}>Phone</Text>
            <Input value={phone} onChangeText={setPhone} placeholder="09171234567" keyboardType="phone-pad" />
            <Text style={styles.label}>Password</Text>
            <Input value={password} onChangeText={setPassword} placeholder="Create a password" secureTextEntry />
            <Button title={loading ? "Creating account..." : "Create account"} onPress={completeRegistration} />
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Back to login" variant="ghost" onPress={() => router.back()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 56, paddingBottom: 32 },
  card: { gap: 12 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  helper: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  error: { color: colors.danger, fontSize: 13 },
});
