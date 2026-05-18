import React, { useState } from "react";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";
import Screen from "../../components/Screen";
import { ErrorBanner } from "../../components/StateViews";
import { useAuth } from "../../state/AuthContext";
import { validateRegistrationForm } from "../../utils/validators";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    alias: "",
    name_first: "",
    name_last: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    agreeTermsWarranty: false,
    agreeTermsService: false,
    agreeTermsApp: false,
    agreePrivacyRa10173: false
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleCheckbox = (key) => () => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    setErrors({});

    const validation = validateRegistrationForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      setError(Object.values(validation.errors)[0]);
      setBusy(false);
      return;
    }

    try {
      await register({
        alias: form.alias.trim(),
        name_first: form.name_first.trim(),
        name_last: form.name_last.trim(),
        name: `${form.name_first.trim()} ${form.name_last.trim()}`.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: "customer",
        billingAddress: {
          street: form.street.trim(),
          barangay: form.barangay.trim(),
          city: form.city.trim(),
          province: form.province.trim(),
          region: form.region.trim()
        }
      });
      navigation.replace("Home");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ErrorBanner message={error} />
      <TextInput label="Alias (optional)" value={form.alias} onChangeText={set("alias")} mode="outlined" autoCapitalize="none" />
      <TextInput label="First name" value={form.name_first} onChangeText={set("name_first")} mode="outlined" error={Boolean(errors.name_first)} />
      <TextInput label="Last name" value={form.name_last} onChangeText={set("name_last")} mode="outlined" error={Boolean(errors.name_last)} />
      <TextInput label="Email" value={form.email} onChangeText={set("email")} autoCapitalize="none" keyboardType="email-address" mode="outlined" error={Boolean(errors.email)} />
      <TextInput label="Phone 09XXXXXXXXX" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" mode="outlined" error={Boolean(errors.phone)} />
      <TextInput label="Password" value={form.password} onChangeText={set("password")} secureTextEntry mode="outlined" error={Boolean(errors.password)} />
      <TextInput label="Confirm password" value={form.confirmPassword} onChangeText={set("confirmPassword")} secureTextEntry mode="outlined" error={Boolean(errors.confirmPassword)} />
      <Text variant="titleMedium">Billing address</Text>
      <TextInput label="Street" value={form.street} onChangeText={set("street")} mode="outlined" error={Boolean(errors.street)} />
      <TextInput label="Barangay" value={form.barangay} onChangeText={set("barangay")} mode="outlined" error={Boolean(errors.barangay)} />
      <TextInput label="City" value={form.city} onChangeText={set("city")} mode="outlined" error={Boolean(errors.city)} />
      <TextInput label="Province" value={form.province} onChangeText={set("province")} mode="outlined" error={Boolean(errors.province)} />
      <TextInput label="Region" value={form.region} onChangeText={set("region")} mode="outlined" error={Boolean(errors.region)} />
      <Text variant="titleMedium">Required acknowledgements</Text>
      <Checkbox.Item
        label="I accept warranty terms"
        status={form.agreeTermsWarranty ? "checked" : "unchecked"}
        onPress={toggleCheckbox("agreeTermsWarranty")}
      />
      <Checkbox.Item
        label="I accept service terms"
        status={form.agreeTermsService ? "checked" : "unchecked"}
        onPress={toggleCheckbox("agreeTermsService")}
      />
      <Checkbox.Item
        label="I accept app terms"
        status={form.agreeTermsApp ? "checked" : "unchecked"}
        onPress={toggleCheckbox("agreeTermsApp")}
      />
      <Checkbox.Item
        label="I acknowledge the Data Privacy Act (RA 10173) disclosure"
        status={form.agreePrivacyRa10173 ? "checked" : "unchecked"}
        onPress={toggleCheckbox("agreePrivacyRa10173")}
      />
      <Button mode="contained" loading={busy} disabled={busy} onPress={submit}>
        Create account
      </Button>
    </Screen>
  );
}
