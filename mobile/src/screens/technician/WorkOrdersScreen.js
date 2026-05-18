import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { Button, Card, Chip, Text } from "react-native-paper";
import Screen from "../../components/Screen";
import { EmptyView, LoadingView } from "../../components/StateViews";
import { TasksApi } from "../../services/api";
import { colors, spacing } from "../../theme/theme";
import { shortDate } from "../../utils/format";

const filters = ["all", "pending", "in-progress", "completed"];

export default function WorkOrdersScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await TasksApi.all();
      setTasks(result.tasks || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => filter === "all" || task.status === filter),
    [tasks, filter]
  );

  const accept = async (task) => {
    await TasksApi.accept(task.id || task.taskCode);
    load();
  };

  const complete = async (task) => {
    await TasksApi.updateStatus(task.id || task.taskCode, "completed");
    load();
  };

  if (loading) return <LoadingView label="Loading work orders..." />;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      <Text variant="headlineSmall">My Work Orders</Text>
      <View style={styles.filters}>
        {filters.map((item) => (
          <Chip key={item} selected={filter === item} onPress={() => setFilter(item)}>
            {item === "all" ? "All" : item}
          </Chip>
        ))}
      </View>
      {visibleTasks.length === 0 ? <EmptyView title="No work orders" message="Assigned and nearby branch work appears here." /> : null}
      {visibleTasks.map((task) => (
        <Card key={task.id || task.taskCode} style={styles.card}>
          <Card.Content style={styles.content}>
            <View style={styles.row}>
              <Text variant="titleMedium" style={styles.title}>{task.title || task.issueType || "Work Order"}</Text>
              <Chip compact>{task.status}</Chip>
            </View>
            <Text style={styles.muted}>{task.customer || task.customerName || "Customer"}</Text>
            <Text style={styles.muted}>{task.address || "Address TBD"}</Text>
            <Text style={styles.muted}>Scheduled {shortDate(task.scheduledDate)} • {task.timeSlot || "TBD"}</Text>
            <Text style={styles.muted}>Branch: {task.branch || "Open branch"}</Text>
            <View style={styles.actions}>
              <Button mode="outlined" onPress={() => navigation.navigate("WorkOrderDetails", { task })}>Details</Button>
              {task.status === "pending" ? <Button mode="contained" onPress={() => accept(task)}>Accept</Button> : null}
              {task.status === "in-progress" ? <Button mode="contained" onPress={() => complete(task)}>Complete</Button> : null}
            </View>
          </Card.Content>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  card: { marginBottom: spacing.md, borderRadius: 8 },
  content: { gap: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  title: { flex: 1 },
  muted: { color: colors.muted },
  actions: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }
});
