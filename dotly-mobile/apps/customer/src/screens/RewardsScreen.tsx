import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

interface Reward {
  id: string;
  name: string;
  description: string;
  dotsRequired: number;
  dotsEarned?: number;
  percentComplete?: number;
  image?: string;
  category: 'food' | 'drink' | 'merchandise' | 'experience';
  value: string;
  expiresAt?: string;
}

export function RewardsScreen() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDots, setCurrentDots] = useState(450);
  const [filter, setFilter] = useState<'available' | 'in-progress' | 'expired'>('available');

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      const mockRewards: Reward[] = [
        {
          id: '1',
          name: 'Free Coffee',
          description: 'Enjoy a complimentary coffee',
          dotsRequired: 100,
          dotsEarned: 50,
          percentComplete: 50,
          category: 'drink',
          value: 'Rs 150',
        },
        {
          id: '2',
          name: 'Burger Voucher',
          description: 'Free burger of your choice',
          dotsRequired: 200,
          dotsEarned: 0,
          percentComplete: 0,
          category: 'food',
          value: 'Rs 350',
        },
        {
          id: '3',
          name: 'Exclusive T-Shirt',
          description: 'Limited edition branded merchandise',
          dotsRequired: 500,
          dotsEarned: 450,
          percentComplete: 90,
          category: 'merchandise',
          value: 'Rs 800',
        },
        {
          id: '4',
          name: 'VIP Dinner',
          description: 'Special dining experience for 2',
          dotsRequired: 1000,
          dotsEarned: 0,
          percentComplete: 0,
          category: 'experience',
          value: 'Rs 3,000',
        },
      ];

      setRewards(mockRewards);
    } catch (error) {
      console.error('Failed to load rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = (reward: Reward) => {
    if (currentDots >= reward.dotsRequired) {
      // In production, call API to redeem
      setCurrentDots((prev) => prev - reward.dotsRequired);
      // Show success toast/modal
    }
  };

  const filteredRewards = rewards.filter((reward) => {
    if (filter === 'available') return reward.dotsEarned === 0;
    if (filter === 'in-progress') return reward.dotsEarned && reward.dotsEarned > 0;
    if (filter === 'expired') return reward.expiresAt && new Date(reward.expiresAt) < new Date();
    return true;
  });

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
        <Text style={styles.title}>Rewards</Text>

        {/* Current Dots */}
        <View style={styles.dotsCard}>
          <Text style={styles.dotsLabel}>Your Dots</Text>
          <Text style={styles.dotsValue}>{currentDots}</Text>
          <Text style={styles.dotsSubtext}>
            {Math.ceil((1000 - currentDots) / 2)} more transactions to reach 1000 dots
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(['available', 'in-progress', 'expired'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === f && styles.filterTabTextActive,
                ]}
              >
                {f === 'available'
                  ? 'Available'
                  : f === 'in-progress'
                    ? 'In Progress'
                    : 'Expired'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rewards Grid */}
        {filteredRewards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No rewards in this category</Text>
          </View>
        ) : (
          filteredRewards.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <View style={styles.rewardHeader}>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  <Text style={styles.rewardDescription}>{reward.description}</Text>
                </View>
                <View
                  style={[
                    styles.categoryBadge,
                    styles[`category_${reward.category}`],
                  ]}
                >
                  <Text style={styles.categoryText}>
                    {reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}
                  </Text>
                </View>
              </View>

              {reward.percentComplete > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${reward.percentComplete}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {reward.dotsEarned} / {reward.dotsRequired} dots
                  </Text>
                </View>
              )}

              <View style={styles.rewardFooter}>
                <Text style={styles.rewardValue}>{reward.value}</Text>
                <TouchableOpacity
                  style={[
                    styles.redeemButton,
                    currentDots < reward.dotsRequired && styles.redeemButtonDisabled,
                  ]}
                  disabled={currentDots < reward.dotsRequired}
                  onPress={() => handleRedeemReward(reward)}
                >
                  <Text
                    style={[
                      styles.redeemButtonText,
                      currentDots < reward.dotsRequired &&
                        styles.redeemButtonTextDisabled,
                    ]}
                  >
                    {currentDots >= reward.dotsRequired
                      ? `Redeem (${reward.dotsRequired})`
                      : `${reward.dotsRequired - currentDots} more needed`}
                  </Text>
                </TouchableOpacity>
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
    marginBottom: 20,
    color: '#333',
  },
  dotsCard: {
    backgroundColor: 'linear-gradient(135deg, #007AFF, #0051D5)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  dotsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  dotsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  dotsSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
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
  rewardCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    color: '#666',
  },
  categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  category_food: {
    backgroundColor: '#FFE5CC',
  },
  category_drink: {
    backgroundColor: '#CCE5FF',
  },
  category_merchandise: {
    backgroundColor: '#E5CCFF',
  },
  category_experience: {
    backgroundColor: '#CCFFE5',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
  },
  progressText: {
    fontSize: 11,
    color: '#666',
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  redeemButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  redeemButtonDisabled: {
    backgroundColor: '#ccc',
  },
  redeemButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  redeemButtonTextDisabled: {
    color: '#999',
  },
});
