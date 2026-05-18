import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, EmptyState, Input, Screen, SectionTitle } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { deleteAddress, listAddresses, updateProfile } from "@/services/userService";
import { colors } from "@/theme/tokens";

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const reload = () => listAddresses().then((res: any) => setAddresses(res.addresses || res || [])).catch(() => setAddresses([]));

  useEffect(() => { reload(); }, []);

  const saveProfile = async () => {
    try {
      await updateProfile({ name, phone });
      Alert.alert("Profile", "Profile updated.");
    } catch (err: any) {
      Alert.alert("Profile", err?.message || "Unable to update profile.");
    }
  };

  return (
    <Screen>
      <SectionTitle title="Profile" subtitle="Manage account details and saved addresses." />
      <Card style={{ gap: 12 }}>
        <Text style={styles.label}>Name</Text>
        <Input value={name} onChangeText={setName} placeholder="Your name" />
        <Text style={styles.label}>Phone</Text>
        <Input value={phone} onChangeText={setPhone} placeholder="09171234567" keyboardType="phone-pad" />
        <Button title="Save profile" onPress={saveProfile} />
      </Card>

      <Button title="Open settings" variant="secondary" onPress={() => router.push("/customer/support")} />

      <SectionTitle title="Saved addresses" />
      {addresses.length === 0 ? (
        <EmptyState title="No saved addresses" subtitle="Add one from the checkout flow or the web profile page." />
      ) : (
        <FlatList
          data={addresses}
          scrollEnabled={false}
          keyExtractor={(item) => String(item._id || item.id)}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <Card style={{ gap: 8 }}>
              <Text style={styles.addressTitle}>{item.label || item.name}</Text>
              <Text style={styles.meta}>{item.street}, {item.city}</Text>
              <Button title="Delete" variant="ghost" onPress={async () => { await deleteAddress(String(item._id || item.id)); await reload(); }} />
            </Card>
          )}
        />
      )}

      <Button title="Log out" variant="danger" onPress={async () => { await logout(); router.replace("/(auth)/login"); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  meta: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  addressTitle: { color: colors.text, fontWeight: "800", fontSize: 15 },
});
