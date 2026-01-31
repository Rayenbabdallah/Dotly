import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

interface ShiftReport {
  shiftStart: string;
  shiftEnd: string;
  transactionCount: number;
  totalAmount: number;
  dotsIssued: number;
  averageTransaction: number;
}

export function ShiftReportsScreen() {
  const [currentShift, setCurrentShift] = useState<ShiftReport | null>(null);
  const [previousShifts, setPreviousShifts] = useState<ShiftReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShiftData();
  }, []);

  const loadShiftData = async () => {
    try {
      // Mock data
      const mockCurrentShift: ShiftReport = {
        shiftStart: new Date(Date.now() - 8 * 3600000).toISOString(),
        shiftEnd: new Date().toISOString(),
        transactionCount: 45,
        totalAmount: 8750,
        dotsIssued: 875,
        averageTransaction: 194.44,
      };

      const mockPreviousShifts: ShiftReport[] = [
        {
          shiftStart: new Date(Date.now() - 24 * 3600000).toISOString(),
          shiftEnd: new Date(Date.now() - 16 * 3600000).toISOString(),
          transactionCount: 52,
          totalAmount: 9200,
          dotsIssued: 920,
          averageTransaction: 176.92,
        },
        {
          shiftStart: new Date(Date.now() - 48 * 3600000).toISOString(),
          shiftEnd: new Date(Date.now() - 40 * 3600000).toISOString(),
          transactionCount: 38,
          totalAmount: 6800,
          dotsIssued: 680,
          averageTransaction: 178.95,
        },
      ];

      setCurrentShift(mockCurrentShift);
      setPreviousShifts(mockPreviousShifts);
    } catch (error) {
      console.error('Failed to load shift data:', error);
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
        <Text style={styles.title}>Shift Reports</Text>

        {currentShift && (
          <>
            <Text style={styles.sectionTitle}>Current Shift</Text>
            <View style={[styles.shiftCard, styles.currentShiftCard]}>
              <View style={styles.shiftTimeContainer}>
                <Text style={styles.shiftTime}>
                  {new Date(currentShift.shiftStart).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' - '}
                  {new Date(currentShift.shiftEnd).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Transactions</Text>
                  <Text style={styles.metricValue}>{currentShift.transactionCount}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Total Amount</Text>
                  <Text style={styles.metricValue}>
                    Rs {currentShift.totalAmount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Dots Issued</Text>
                  <Text style={styles.metricValue}>{currentShift.dotsIssued}</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Average</Text>
                  <Text style={styles.metricValue}>
                    Rs {currentShift.averageTransaction.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Previous Shifts</Text>
        {previousShifts.map((shift, index) => (
          <View key={index} style={styles.shiftCard}>
            <View style={styles.shiftHeader}>
              <Text style={styles.shiftDate}>
                {new Date(shift.shiftStart).toLocaleDateString()}
              </Text>
              <Text style={styles.shiftTime}>
                {new Date(shift.shiftStart).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' - '}
                {new Date(shift.shiftEnd).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Transactions</Text>
                <Text style={styles.metricValue}>{shift.transactionCount}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Total Amount</Text>
                <Text style={styles.metricValue}>Rs {shift.totalAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Dots Issued</Text>
                <Text style={styles.metricValue}>{shift.dotsIssued}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Average</Text>
                <Text style={styles.metricValue}>
                  Rs {shift.averageTransaction.toFixed(2)}
                </Text>
              </View>
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
    marginBottom: 24,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  shiftCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  currentShiftCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  shiftTimeContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  shiftHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  shiftDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 13,
    color: '#666',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
