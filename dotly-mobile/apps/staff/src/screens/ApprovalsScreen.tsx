import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

interface Approval {
  id: string;
  customerId: string;
  customerPhone: string;
  amount: number;
  dotsRequested: number;
  reason: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function ApprovalsScreen() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      // In production, fetch from API
      const mockApprovals: Approval[] = [
        {
          id: '1',
          customerId: '123',
          customerPhone: '+1234567890',
          amount: 5000,
          dotsRequested: 500,
          reason: 'Large redemption request',
          timestamp: new Date().toISOString(),
          status: 'pending',
        },
        {
          id: '2',
          customerId: '456',
          customerPhone: '+9876543210',
          amount: 3000,
          dotsRequested: 300,
          reason: 'Special promotion',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'pending',
        },
      ];
      setApprovals(mockApprovals);
    } catch (error) {
      console.error('Failed to load approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    // In production, call API
    setApprovals((prev) =>
      prev.map((a) => (a.id === approvalId ? { ...a, status: 'approved' } : a))
    );
  };

  const handleReject = async (approvalId: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === approvalId ? { ...a, status: 'rejected' } : a))
    );
  };

  const filteredApprovals =
    filter === 'pending' ? approvals.filter((a) => a.status === 'pending') : approvals;

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
        <Text style={styles.title}>Approvals</Text>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterTabText, filter === 'pending' && styles.filterTabTextActive]}>
              Pending ({approvals.filter((a) => a.status === 'pending').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All ({approvals.length})
            </Text>
          </TouchableOpacity>
        </View>

        {filteredApprovals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {filter === 'pending' ? 'No pending approvals' : 'No approvals'}
            </Text>
          </View>
        ) : (
          filteredApprovals.map((approval) => (
            <View key={approval.id} style={styles.approvalCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.customerPhone}>{approval.customerPhone}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(approval.timestamp).toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, styles[`status_${approval.status}`]]}>
                  <Text style={styles.statusText}>{approval.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount:</Text>
                  <Text style={styles.detailValue}>Rs {approval.amount.toFixed(2)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dots Requested:</Text>
                  <Text style={styles.detailValue}>{approval.dotsRequested}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reason:</Text>
                  <Text style={styles.detailValue}>{approval.reason}</Text>
                </View>
              </View>

              {approval.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(approval.id)}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApprove(approval.id)}
                  >
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    marginBottom: 20,
    color: '#333',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  filterTabActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  filterTabTextActive: {
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
  approvalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerPhone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  status_pending: {
    backgroundColor: '#FFF3CD',
  },
  status_approved: {
    backgroundColor: '#D4EDDA',
  },
  status_rejected: {
    backgroundColor: '#F8D7DA',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  rejectButtonText: {
    color: '#FF3B30',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  approveButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: '#34C759',
  },
  approveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
});
