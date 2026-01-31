import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { apiClient, Visit } from '@dotly/core';
import { useAuth } from '../contexts/AuthContext';

interface TransactionHistoryItem extends Visit {
  customerPhone?: string;
  branchName?: string;
}

export function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalToday, setTotalToday] = useState(0);
  const [totalWeek, setTotalWeek] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    loadTransactionHistory();
  }, []);

  const loadTransactionHistory = async () => {
    try {
      // In production, create specific endpoint for staff transaction history
      // For now, using visits endpoint
      const allVisits = await Promise.resolve([]);
      setTransactions(allVisits);

      // Calculate totals
      const now = new Date();
      const today = now.toDateString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const todayTransactions = allVisits.filter(
        (v) => new Date(v.createdAt).toDateString() === today
      );
      const weekTransactions = allVisits.filter((v) => new Date(v.createdAt) > weekAgo);

      setTotalToday(todayTransactions.reduce((sum, v) => sum + v.amount, 0));
      setTotalWeek(weekTransactions.reduce((sum, v) => sum + v.amount, 0));
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Transaction History</Text>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Today</Text>
            <Text style={styles.summaryAmount}>Rs {totalToday.toFixed(2)}</Text>
            <Text style={styles.summaryCount}>
              {transactions.filter((t) => new Date(t.createdAt).toDateString() === new Date().toDateString()).length} transactions
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>This Week</Text>
            <Text style={styles.summaryAmount}>Rs {totalWeek.toFixed(2)}</Text>
            <Text style={styles.summaryCount}>
              {transactions.filter((t) => new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} transactions
            </Text>
          </View>
        </View>

        {/* Transaction List */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionPhone}>
                  {transaction.customerPhone || 'Unknown'}
                </Text>
                <Text style={styles.transactionAmount}>Rs {transaction.amount.toFixed(2)}</Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDetail}>
                  Dots Earned: {transaction.dotsEarned}
                </Text>
                <Text style={styles.transactionDetail}>
                  {new Date(transaction.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
  transactionItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionPhone: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  transactionDetails: {
    gap: 4,
  },
  transactionDetail: {
    fontSize: 12,
    color: '#666',
  },
});
