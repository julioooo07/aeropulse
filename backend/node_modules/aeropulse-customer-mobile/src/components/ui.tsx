import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ScrollViewProps,
} from "react-native";
import { colors, radius, spacing } from "@/theme/tokens";

export function Screen({ children, contentContainerStyle, ...props }: ScrollViewProps) {
  return (
    <ScrollView
      {...props}
      contentContainerStyle={[styles.screen, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style, ...props }: React.ComponentProps<typeof View>) {
  return <View {...props} style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  variant = "primary",
}: {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const buttonStyle =
    variant === "primary"
      ? styles.button_primary
      : variant === "secondary"
        ? styles.button_secondary
        : variant === "danger"
          ? styles.button_danger
          : styles.button_ghost;
  const textStyle =
    variant === "primary"
      ? styles.buttonText_primary
      : variant === "secondary"
        ? styles.buttonText_secondary
        : variant === "danger"
          ? styles.buttonText_danger
          : styles.buttonText_ghost;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        buttonStyle,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput {...props} placeholderTextColor={colors.textMuted} style={[styles.input, props.style]} />;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Card style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background,
    minHeight: "100%",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  button_primary: { backgroundColor: colors.primary },
  button_secondary: { backgroundColor: colors.surfaceMuted },
  button_ghost: { backgroundColor: "transparent" },
  button_danger: { backgroundColor: colors.danger },
  buttonText: { fontSize: 14, fontWeight: "700" },
  buttonText_primary: { color: "#fff" },
  buttonText_secondary: { color: colors.text },
  buttonText_ghost: { color: colors.text },
  buttonText_danger: { color: "#fff" },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: { color: colors.text, fontWeight: "800", fontSize: 16 },
  emptySubtitle: { color: colors.textMuted, textAlign: "center" },
});
