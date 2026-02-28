/**
 * Utility to help apply theme colors to screens
 * This provides common style patterns that match the web version
 */

import { theme } from '../config/theme';

export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    ...theme.shadows.md,
  },
  text: {
    primary: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.base,
    },
    secondary: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
    },
    muted: {
      color: theme.colors.text.muted,
      fontSize: theme.typography.fontSize.sm,
    },
    title: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
    },
  },
  button: {
    primary: {
      backgroundColor: theme.colors.primary.main,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    secondary: {
      backgroundColor: theme.colors.secondary.main,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
  },
  input: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
  },
};

export default commonStyles;




