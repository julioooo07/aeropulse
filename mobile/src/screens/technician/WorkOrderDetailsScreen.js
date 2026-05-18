import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Divider, Text, TextInput } from "react-native-paper";
import Screen from "../../components/Screen";
import { ErrorBanner } from "../../components/StateViews";
import { TasksApi } from "../../services/api";
import { colors, spacing } from "../../theme/theme";
import { shortDate } from "../../utils/format";

export default function WorkOrderDetailsScreen({ route, navigation }) {
  const [task, setTask] = useState(route.params.task);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const updateStatus = async (status) => {
    setBusy(true);
    setError("");
    try {
      const result = status === "in-progress"
        ? await TasksApi.accept(task.id || task.taskCode)
        : await TasksApi.updateStatus(task.id || task.taskCode, status);
      setTask(result.task);
      if (status === "completed") navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text variant="headlineSmall">{task.title || "Work Order"}</Text>
      <ErrorBanner message={error} />
      <Card style={styles.card}>
        <Card.Content style={styles.gap}>
          <Text variant="titleMedium">Customer</Text>
          <Text>{task.customer || task.customerName || "Customer"}</Text>
          <Text style={styles.muted}>{task.customerPhone || ""}</Text>
          <Text style={styles.muted}>{task.address || "Address TBD"}</Text>
          <Divider />
          <Text variant="titleMedium">Schedule</Text>
          <Text>{shortDate(task.scheduledDate)} • {task.timeSlot || "TBD"}</Text>
          <Text>Status: {task.status}</Text>
          <Text>Priority: {task.priority || "medium"}</Text>
          <Divider />
          <Text variant="titleMedium">Service Details</Text>
          <Text>{task.description || task.issueType || "No description provided."}</Text>
          {task.payload?.orderCode ? <Text>Order: {task.payload.orderCode}</Text> : null}
        </Card.Content>
      </Card>
      <TextInput label="Service notes" value={notes} onChangeText={setNotes} multiline mode="outlined" />
      <View style={styles.actions}>
        {task.status === "pending" ? <Button mode="contained" loading={busy} onPress={() => updateStatus("in-progress")}>Accept and start</Button> : null}
        {task.status === "in-progress" ? <Button mode="contained" loading={busy} onPress={() => updateStatus("completed")}>Complete work order</Button> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 8 },
  gap: { gap: spacing.sm },
  muted: { color: colors.muted },
  actions: { gap: spacing.sm }
});
