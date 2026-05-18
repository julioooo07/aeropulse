import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Screen, SectionTitle } from "@/components/ui";
import { acceptTask, listTasks, updateTaskStatus } from "@/services/taskService";
import { colors } from "@/theme/tokens";

export default function TechnicianTasksScreen() {
  const [tasks, setTasks] = useState<any[]>([]);

  const reload = () => listTasks().then((res) => setTasks(res.tasks || [])).catch(() => setTasks([]));
  useEffect(() => { reload(); }, []);

  return (
    <Screen>
      <SectionTitle title="Assigned tasks" subtitle="Technician-only workflow for service and order fulfillment." />
      {tasks.length === 0 ? (
        <EmptyState title="No assigned tasks" subtitle="Tasks from the backend will appear here." />
      ) : (
        <FlatList
          data={tasks}
          scrollEnabled={false}
          keyExtractor={(item) => String(item.id || item._id || item.taskCode)}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <Card style={{ gap: 8 }}>
              <Text style={styles.title}>{item.taskCode || item.title}</Text>
              <Text style={styles.meta}>{item.customer}</Text>
              <Text style={styles.meta}>{item.address}</Text>
              <Text style={styles.meta}>Status: {item.status}</Text>
              <View style={{ gap: 8 }}>
                <Button title="Accept task" onPress={async () => { try { await acceptTask(String(item.id || item._id || item.taskCode)); await reload(); } catch (err: any) { Alert.alert("Task", err?.message || "Unable to accept task."); } }} />
                <Button title="Mark in progress" variant="secondary" onPress={async () => { await updateTaskStatus(String(item.id || item._id || item.taskCode), "in-progress"); await reload(); }} />
                <Button title="Mark complete" variant="secondary" onPress={async () => { await updateTaskStatus(String(item.id || item._id || item.taskCode), "completed"); await reload(); }} />
              </View>
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
