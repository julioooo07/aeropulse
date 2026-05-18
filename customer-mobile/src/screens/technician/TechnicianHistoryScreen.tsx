import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Screen, SectionTitle } from "@/components/ui";
import { listMyServiceRequests } from "@/services/serviceRequestService";
import { colors } from "@/theme/tokens";

export default function TechnicianHistoryScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const reload = () => listMyServiceRequests().then((res) => setRequests(res.requests || [])).catch(() => setRequests([]));
  useEffect(() => { reload(); }, []);

  return (
    <Screen>
      <SectionTitle title="Service history" subtitle="Recent customer service requests assigned through the same backend." />
      {requests.length === 0 ? (
        <EmptyState title="No history yet" subtitle="Completed or submitted requests will appear here." />
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
      <Button title="Refresh" variant="secondary" onPress={reload} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 15, fontWeight: "800" },
  meta: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
});
