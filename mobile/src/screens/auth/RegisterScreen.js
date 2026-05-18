import React, { useState } from "react";
import { Button, TextInput } from "react-native-paper";
import Screen from "../../components/Screen";
import { ErrorBanner } from "../../components/StateViews";
import { useAuth } from "../../state/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name_first: "",
    name_last: "",
    email: "",
    phone: "",
    password: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    region: ""
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await register({
        name_first: form.name_first,
        name_last: form.name_last,
        name: `${form.name_first} ${form.name_last}`.trim(),
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: "customer",
        billingAddress: {
          street: form.street,
          barangay: form.barangay,
          city: form.city,
          province: form.province,
          region: form.region
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ErrorBanner message={error} />
      <TextInput label="First name" value={form.name_first} onChangeText={set("name_first")} mode="outlined" />
      <TextInput label="Last name" value={form.name_last} onChangeText={set("name_last")} mode="outlined" />
      <TextInput label="Email" value={form.email} onChangeText={set("email")} autoCapitalize="none" keyboardType="email-address" mode="outlined" />
      <TextInput label="Phone 09XXXXXXXXX" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" mode="outlined" />
      <TextInput label="Password" value={form.password} onChangeText={set("password")} secureTextEntry mode="outlined" />
      <TextInput label="Street" value={form.street} onChangeText={set("street")} mode="outlined" />
      <TextInput label="Barangay" value={form.barangay} onChangeText={set("barangay")} mode="outlined" />
      <TextInput label="City" value={form.city} onChangeText={set("city")} mode="outlined" />
      <TextInput label="Province" value={form.province} onChangeText={set("province")} mode="outlined" />
      <TextInput label="Region" value={form.region} onChangeText={set("region")} mode="outlined" />
      <Button mode="contained" loading={busy} disabled={busy} onPress={submit}>Create account</Button>
    </Screen>
  );
}
