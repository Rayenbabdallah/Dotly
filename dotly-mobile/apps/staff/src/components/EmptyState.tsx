import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../packages/@dotly/core/src/theme';

/**
 * Empty State Component
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {icon && <Text style={[styles.icon, { color: theme.colors.textSecondary }]}>{icon}</Text>}
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      )}
      {action && (
        <View
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.colors.primary,
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.lg,
              borderRadius: theme.radius.md,
              marginTop: theme.spacing.lg,
            },
          ]}
          onTouchEnd={action.onPress}
        >
          <Text style={styles.actionButtonText}>{action.label}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * Empty State Variants
 */
export function EmptyTransactionState() {
  return (
    <EmptyState
      icon="📋"
      title="No Transactions Yet"
      description="Your transactions will appear here"
    />
  );
}

export function EmptyRewardsState() {
  return (
    <EmptyState
      icon="🎁"
      title="No Rewards Available"
      description="Check back later for new rewards"
    />
  );
}

export function EmptyDealsState() {
  return (
    <EmptyState
      icon="🏷️"
      title="No Deals Available"
      description="No personalized deals for you right now"
    />
  );
}

export function EmptyApprovalsState() {
  return (
    <EmptyState
      icon="✓"
      title="No Pending Approvals"
      description="All requests have been processed"
    />
  );
}

export function EmptySearchState({ query }: { query: string }) {
  return (
    <EmptyState
      icon="🔍"
      title={`No Results for "${query}"`}
      description="Try a different search term"
    />
  );
}

/**
 * Error State Component
 */
export function ErrorState({
  title,
  description,
  actionLabel = 'Retry',
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { theme } = useTheme();

  return (
    <EmptyState
      icon="⚠️"
      title={title}
      description={description}
      action={
        onAction
          ? {
              label: actionLabel,
              onPress: onAction,
            }
          : undefined
      }
    />
  );
}

/**
 * Loading Empty State
 */
export function LoadingEmptyState() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.spinner, { borderColor: theme.colors.border }]} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
        Loading...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: '80%',
  },
  actionButton: {
    marginTop: 16,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderTopColor: '#007AFF',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
