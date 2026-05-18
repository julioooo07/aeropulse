import React, { useState } from "react";
import { Button, Switch, Text, TextInput } from "react-native-paper";
import Screen from "../../components/Screen";
import { ErrorBanner } from "../../components/StateViews";
import { UsersApi } from "../../services/api";

export default function AddressFormScreen({ navigation, route }) {
  const [form, setForm] = useState({
    label: "Home",
    type: "home",
    name: "",
    phone: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    postalCode: "",
    isDefault: false
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await UsersApi.addAddress(form);
      navigation.navigate(route.params?.onSaved || "Profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ErrorBanner message={error} />
      <TextInput label="Label" value={form.label} onChangeText={set("label")} mode="outlined" />
      <TextInput label="Recipient name" value={form.name} onChangeText={set("name")} mode="outlined" />
      <TextInput label="Phone" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" mode="outlined" />
      <TextInput label="Street" value={form.street} onChangeText={set("street")} mode="outlined" />
      <TextInput label="Barangay" value={form.barangay} onChangeText={set("barangay")} mode="outlined" />
      <TextInput label="City" value={form.city} onChangeText={set("city")} mode="outlined" />
      <TextInput label="Province" value={form.province} onChangeText={set("province")} mode="outlined" />
      <TextInput label="Region" value={form.region} onChangeText={set("region")} mode="outlined" />
      <TextInput label="Postal code" value={form.postalCode} onChangeText={set("postalCode")} keyboardType="number-pad" mode="outlined" />
      <Text>Default address</Text>
      <Switch value={form.isDefault} onValueChange={set("isDefault")} />
      <Button mode="contained" loading={busy} onPress={save}>Save address</Button>
    </Screen>
  );
}
