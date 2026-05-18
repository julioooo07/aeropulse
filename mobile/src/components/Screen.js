import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme/theme";

export default function Screen({ children, scroll = true, padded = true, style, refreshControl }) {
  const content = (
    <View style={[padded && styles.padded, style]}>
      {children}
    </View>
  );
  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" refreshControl={refreshControl}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  padded: {
    padding: spacing.lg,
    gap: spacing.md
  }
});
