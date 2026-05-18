import React, { useCallback, useState } from "react";
import { RefreshControl } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import Screen from "../../components/Screen";
import { EmptyView } from "../../components/StateViews";
import { ServiceApi } from "../../services/api";

export default function ServicesScreen() {
  const [requests, setRequests] = useState([]);
  const [description, setDescription] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await ServiceApi.mine();
      setRequests(result.requests || []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);
  const create = async () => {
    if (!description.trim()) return;
    await ServiceApi.createMine({ issueType: "Mobile service request", description });
    setDescription("");
    load();
  };
  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      <Text variant="headlineSmall">Service Requests</Text>
      <TextInput label="Describe the issue" value={description} onChangeText={setDescription} mode="outlined" multiline />
      <Button mode="contained" onPress={create}>Submit request</Button>
      {requests.length === 0 ? <EmptyView title="No service requests" /> : null}
      {requests.map((item) => (
        <Card key={item.id} style={{ marginBottom: 12 }}>
          <Card.Content>
            <Text variant="titleMedium">{item.issueType || "Service Request"}</Text>
            <Text>{item.description}</Text>
            <Text>{item.status}</Text>
          </Card.Content>
        </Card>
      ))}
    </Screen>
  );
}
