import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Input, Screen, SectionTitle } from "@/components/ui";
import { createMyServiceRequest, listMyServiceRequests } from "@/services/serviceRequestService";
import { colors } from "@/theme/tokens";

export default function CustomerSupportScreen() {
  const [address, setAddress] = useState("");
  const [issue, setIssue] = useState("");
  const [requests, setRequests] = useState<any[]>([]);

  const reload = () => listMyServiceRequests().then((res) => setRequests(res.requests || [])).catch(() => setRequests([]));
  useEffect(() => { reload(); }, []);

  const submit = async () => {
    try {
      await createMyServiceRequest({ address, issueDescription: issue });
      setAddress("");
      setIssue("");
      await reload();
      Alert.alert("Support", "Service request submitted.");
    } catch (err: any) {
      Alert.alert("Support", err?.message || "Unable to submit request.");
    }
  };

  return (
    <Screen>
      <SectionTitle title="Support" subtitle="Create a service request and track the request history." />
      <Card style={{ gap: 12 }}>
        <Input value={address} onChangeText={setAddress} placeholder="Service address" />
        <Input value={issue} onChangeText={setIssue} placeholder="Describe the issue" multiline style={{ minHeight: 90, textAlignVertical: "top" }} />
        <Button title="Submit service request" onPress={submit} />
      </Card>

      <SectionTitle title="Your requests" />
      {requests.length === 0 ? (
        <EmptyState title="No requests yet" subtitle="Submitted tickets will appear here." />
      ) : (
        <FlatList
          data={requests}
          scrollEnabled={false}
          keyExtractor={(item) => String(item.id || item._id)}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <Card style={{ gap: 6 }}>
              <Text style={styles.title}>{item.issue || item.issueDescription || "Service request"}</Text>
              <Text style={styles.meta}>{item.status}</Text>
              <Text style={styles.meta}>{item.address}</Text>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 15, fontWeight: "800" },
  meta: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
});
