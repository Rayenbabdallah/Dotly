import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

interface Transaction {
  id: string;
  type: 'purchase' | 'redemption' | 'bonus';
  title: string;
  amount: number;
  dotsEarned: number;
  dotsSpent: number;
  branch: string;
  timestamp: string;
}

export function CustomerTransactionHistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'purchase',
          title: 'Burger & Fries',
          amount: 450,
          dotsEarned: 45,
          dotsSpent: 0,
          branch: 'Main Branch',
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
        {
          id: '2',
          type: 'redemption',
          title: 'Free Coffee',
          amount: 0,
          dotsEarned: 0,
          dotsSpent: 100,
          branch: 'Downtown',
          timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'purchase',
          title: 'Pizza Combo',
          amount: 850,
          dotsEarned: 85,
          dotsSpent: 0,
          branch: 'Main Branch',
          timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
        },
        {
          id: '4',
          type: 'bonus',
          title: 'Birthday Bonus',
          amount: 0,
          dotsEarned: 200,
          dotsSpent: 0,
          branch: 'Online',
          timestamp: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
        },
        {
          id: '5',
          type: 'purchase',
          title: 'Sandwich',
          amount: 250,
          dotsEarned: 25,
          dotsSpent: 0,
          branch: 'Downtown',
          timestamp: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
        },
      ];

      const earned = mockTransactions.reduce((sum, t) => sum + t.dotsEarned, 0);
      const spent = mockTransactions.reduce((sum, t) => sum + t.dotsSpent, 0);

      setTransactions(mockTransactions);
      setTotalEarned(earned);
      setTotalSpent(spent);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'purchase':
        return '🛒';
      case 'redemption':
        return '🎁';
      case 'bonus':
        return '🎉';
      default:
        return '•';
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
            <Text style={styles.summaryLabel}>Total Earned</Text>
            <Text style={styles.summaryValue}>{totalEarned}</Text>
            <Text style={styles.summaryUnit}>dots</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Redeemed</Text>
            <Text style={styles.summaryValue}>{totalSpent}</Text>
            <Text style={styles.summaryUnit}>dots</Text>
          </View>
        </View>

        {/* Timeline */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.timelineMarker}>
              <Text style={styles.timelineIcon}>{getTransactionIcon(transaction.type)}</Text>
            </View>

            <View style={styles.transactionContent}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <View style={styles.dotsContainer}>
                  {transaction.dotsEarned > 0 && (
                    <Text style={styles.dotsEarned}>+{transaction.dotsEarned}</Text>
                  )}
                  {transaction.dotsSpent > 0 && (
                    <Text style={styles.dotsSpent}>-{transaction.dotsSpent}</Text>
                  )}
                </View>
              </View>

              <View style={styles.transactionDetails}>
                <Text style={styles.branch}>{transaction.branch}</Text>
                <Text style={styles.timestamp}>
                  {new Date(transaction.timestamp).toLocaleString()}
                </Text>
              </View>

              {transaction.amount > 0 && (
                <Text style={styles.amount}>Rs {transaction.amount.toFixed(2)}</Text>
              )}
            </View>
          </View>
        ))}
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
    marginBottom: 20,
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
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryUnit: {
    fontSize: 11,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  transactionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  timelineMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIcon: {
    fontSize: 18,
  },
  transactionContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dotsEarned: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
  dotsSpent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
  },
  transactionDetails: {
    gap: 2,
    marginBottom: 8,
  },
  branch: {
    fontSize: 11,
    color: '#666',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
});
