import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import Screen from "../../components/Screen";
import { TasksApi } from "../../services/api";
import { useAuth } from "../../state/AuthContext";
import { colors, spacing } from "../../theme/theme";

export default function TechnicianDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await TasksApi.all();
      setTasks(result.tasks || []);
    } finally {
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({
    pending: tasks.filter((task) => task.status === "pending").length,
    active: tasks.filter((task) => task.status === "in-progress").length,
    completed: tasks.filter((task) => task.status === "completed").length
  }), [tasks]);

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      <Text variant="headlineSmall">Technician Home</Text>
      <Text style={styles.muted}>{user?.activeBranch || user?.assignedBranch || "Branch not set"}</Text>
      <View style={styles.grid}>
        <Metric title="Pending" value={stats.pending} />
        <Metric title="In Progress" value={stats.active} />
        <Metric title="Completed" value={stats.completed} />
      </View>
      <Button mode="contained" icon="clipboard-list" onPress={() => navigation.navigate("TechWork")}>
        Open work orders
      </Button>
      <Button mode="contained-tonal" icon="account-hard-hat" onPress={() => navigation.navigate("TechnicianProfile")}>
        Technician profile
      </Button>
    </Screen>
  );
}

function Metric({ title, value }) {
  return (
    <Card style={styles.metric}>
      <Card.Content>
        <Text variant="headlineMedium">{value}</Text>
        <Text>{title}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted },
  grid: { gap: spacing.md },
  metric: { borderRadius: 8 }
});
