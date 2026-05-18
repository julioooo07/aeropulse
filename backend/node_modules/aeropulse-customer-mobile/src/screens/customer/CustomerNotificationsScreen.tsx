import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Screen, SectionTitle } from "@/components/ui";
import { listMyNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/notificationService";
import { colors } from "@/theme/tokens";

export default function CustomerNotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const reload = () => listMyNotifications().then((res) => setNotifications(res.notifications || [])).catch(() => setNotifications([]));

  useEffect(() => { reload(); }, []);

  return (
    <Screen>
      <SectionTitle title="Notifications" subtitle="In-app updates from the same backend notification feed." />
      <Button title="Mark all as read" variant="secondary" onPress={async () => { await markAllNotificationsRead(); await reload(); }} />
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" subtitle="New order and account alerts will appear here." />
      ) : (
        <FlatList
          data={notifications}
          scrollEnabled={false}
          keyExtractor={(item) => String(item.id || item._id)}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <Card style={{ gap: 8 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.message}</Text>
              <Button
                title={item.unread ? "Mark read" : "Read"}
                variant={item.unread ? "secondary" : "ghost"}
                onPress={async () => { if (item.unread) await markNotificationRead(String(item.id || item._id)); await reload(); }}
              />
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 16, fontWeight: "800" },
  meta: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
});
