import { MD3LightTheme } from "react-native-paper";

export const colors = {
  primary: "#0f766e",
  primaryDark: "#115e59",
  accent: "#f59e0b",
  ink: "#102027",
  muted: "#64748b",
  line: "#d8e3e7",
  surface: "#ffffff",
  background: "#f4f8f8",
  danger: "#dc2626",
  success: "#15803d",
  warning: "#b45309"
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    error: colors.danger
  },
  roundness: 8
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};
