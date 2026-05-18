import React, { useCallback, useState } from "react";
import { RefreshControl } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import Screen from "../../components/Screen";
import { EmptyView, LoadingView } from "../../components/StateViews";
import { UsersApi } from "../../services/api";
import { useAuth } from "../../state/AuthContext";
import { normalizeAddress } from "../../utils/format";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await UsersApi.addresses();
      setAddresses((result.addresses || []).map(normalizeAddress));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);
  if (loading) return <LoadingView />;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      <Text variant="headlineSmall">{user?.name}</Text>
      <Text>{user?.email}</Text>
      <Text>{user?.phone}</Text>
      <Button mode="outlined" onPress={() => navigation.navigate("AddressForm")}>Add address</Button>
      {addresses.length === 0 ? <EmptyView title="No saved addresses" /> : null}
      {addresses.map((address) => (
        <Card key={address.id} style={{ marginBottom: 12 }}>
          <Card.Content>
            <Text variant="titleMedium">{address.label || address.name}{address.isDefault ? " • Default" : ""}</Text>
            <Text>{address.street}, {address.barangay}, {address.city}</Text>
            <Text>{address.phone}</Text>
          </Card.Content>
        </Card>
      ))}
      <Button mode="contained-tonal" onPress={logout}>Sign out</Button>
    </Screen>
  );
}
