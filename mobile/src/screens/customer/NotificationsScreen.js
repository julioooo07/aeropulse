import React, { useCallback, useState } from "react";
import { RefreshControl } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import Screen from "../../components/Screen";
import { EmptyView, LoadingView } from "../../components/StateViews";
import { NotificationsApi } from "../../services/api";

export default function NotificationsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await NotificationsApi.mine();
      setItems(result.notifications || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);
  const markAll = async () => {
    await NotificationsApi.readAll();
    load();
  };
  if (loading) return <LoadingView label="Loading notifications..." />;
  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      <Button mode="contained-tonal" onPress={markAll}>Mark all read</Button>
      {items.length === 0 ? <EmptyView title="No notifications" /> : null}
      {items.map((item) => (
        <Card key={item.id} style={{ marginBottom: 12 }}>
          <Card.Content>
            <Text variant="titleMedium">{item.title}</Text>
            <Text>{item.message}</Text>
          </Card.Content>
        </Card>
      ))}
    </Screen>
  );
}
