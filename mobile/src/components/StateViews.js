import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { colors, spacing } from "../theme/theme";

export function LoadingView({ label = "Loading..." }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function EmptyView({ title, message, actionLabel, onAction }) {
  return (
    <View style={styles.empty}>
      <Text variant="titleMedium">{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel ? <Button mode="contained" onPress={onAction}>{actionLabel}</Button> : null}
    </View>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <View style={styles.error}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl
  },
  label: {
    color: colors.muted
  },
  empty: {
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md
  },
  message: {
    color: colors.muted,
    textAlign: "center"
  },
  error: {
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: "#fee2e2"
  },
  errorText: {
    color: colors.danger
  }
});
