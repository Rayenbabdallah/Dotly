import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

interface StaffMetric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
}

export function StaffAnalyticsScreen() {
  const [metrics, setMetrics] = useState<StaffMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      const mockMetrics: StaffMetric[] = [
        {
          label: 'Total Transactions',
          value: 47,
          trend: 'up',
          trendValue: '+12%',
        },
        {
          label: 'Total Revenue',
          value: 'Rs 8,750',
          trend: 'up',
          trendValue: '+8%',
        },
        {
          label: 'Dots Issued',
          value: 875,
          trend: 'flat',
        },
        {
          label: 'Avg Transaction',
          value: 'Rs 186.17',
          trend: 'down',
          trendValue: '-2%',
        },
        {
          label: 'Busiest Hour',
          value: '2:00 PM - 3:00 PM',
          trend: undefined,
        },
        {
          label: 'Customer Satisfaction',
          value: '4.8/5',
          trend: 'up',
          trendValue: '+0.2',
        },
      ];

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
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
        <Text style={styles.title}>Analytics</Text>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['today', 'week', 'month'] as const).map((p) => (
            <View
              key={p}
              style={[styles.periodButton, period === p && styles.periodButtonActive]}
              onTouchEnd={() => setPeriod(p)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  period === p && styles.periodButtonTextActive,
                ]}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        {/* Metrics Grid */}
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              {metric.trend && (
                <View
                  style={[
                    styles.trendBadge,
                    metric.trend === 'up' && styles.trendUp,
                    metric.trend === 'down' && styles.trendDown,
                  ]}
                >
                  <Text
                    style={[
                      styles.trendText,
                      metric.trend === 'up' && styles.trendTextUp,
                      metric.trend === 'down' && styles.trendTextDown,
                    ]}
                  >
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}{' '}
                    {metric.trendValue}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
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
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  periodButtonText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: '#999',
  },
  trendBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  trendUp: {
    backgroundColor: '#D4EDDA',
  },
  trendDown: {
    backgroundColor: '#F8D7DA',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  trendTextUp: {
    color: '#155724',
  },
  trendTextDown: {
    color: '#721C24',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});
