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

interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  originalPrice: number;
  finalPrice: number;
  category: string;
  validUntil: string;
  branches: string[];
  isPersonalized: boolean;
  applyCount: number;
}

export function DealsScreen() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedDeals, setAppliedDeals] = useState<string[]>([]);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      const mockDeals: Deal[] = [
        {
          id: '1',
          title: 'Buy One Get One',
          description: 'Get a free item with any purchase above Rs 500',
          discount: 50,
          originalPrice: 500,
          finalPrice: 500,
          category: 'food',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          branches: ['Main Branch', 'Downtown'],
          isPersonalized: true,
          applyCount: 234,
        },
        {
          id: '2',
          title: '30% Off Beverages',
          description: 'Enjoy 30% discount on all cold drinks',
          discount: 30,
          originalPrice: 200,
          finalPrice: 140,
          category: 'drink',
          validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          branches: ['All Branches'],
          isPersonalized: false,
          applyCount: 456,
        },
        {
          id: '3',
          title: 'Weekend Special',
          description: 'Double dots on all weekend purchases',
          discount: 100,
          originalPrice: 0,
          finalPrice: 0,
          category: 'special',
          validUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          branches: ['Main Branch'],
          isPersonalized: false,
          applyCount: 789,
        },
        {
          id: '4',
          title: 'Combo Offer',
          description: 'Buy 2 get 3rd item at 50% off',
          discount: 33,
          originalPrice: 600,
          finalPrice: 400,
          category: 'food',
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          branches: ['All Branches'],
          isPersonalized: true,
          applyCount: 567,
        },
      ];

      setDeals(mockDeals);
    } catch (error) {
      console.error('Failed to load deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDeal = (dealId: string) => {
    if (!appliedDeals.includes(dealId)) {
      setAppliedDeals([...appliedDeals, dealId]);
    } else {
      setAppliedDeals(appliedDeals.filter((id) => id !== dealId));
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
        <Text style={styles.title}>Available Deals</Text>
        <Text style={styles.subtitle}>Personalized just for you</Text>

        {/* Deals Grid */}
        {deals.map((deal) => (
          <View key={deal.id} style={styles.dealCard}>
            <View style={styles.dealBadges}>
              {deal.isPersonalized && (
                <View style={styles.personalizedBadge}>
                  <Text style={styles.personalizedText}>For You</Text>
                </View>
              )}
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{deal.discount}%</Text>
              </View>
            </View>

            <View style={styles.dealContent}>
              <View>
                <Text style={styles.dealTitle}>{deal.title}</Text>
                <Text style={styles.dealDescription}>{deal.description}</Text>
              </View>
            </View>

            <View style={styles.dealPricing}>
              {deal.originalPrice > 0 && (
                <>
                  <Text style={styles.originalPrice}>Rs {deal.originalPrice}</Text>
                  <Text style={styles.finalPrice}>Rs {deal.finalPrice}</Text>
                </>
              )}
              {deal.originalPrice === 0 && (
                <Text style={styles.specialDealText}>Limited Time Offer</Text>
              )}
            </View>

            <View style={styles.dealFooter}>
              <View style={styles.dealInfo}>
                <Text style={styles.dealBranches}>{deal.branches.join(', ')}</Text>
                <Text style={styles.dealValidity}>
                  Valid until {new Date(deal.validUntil).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  appliedDeals.includes(deal.id) && styles.applyButtonActive,
                ]}
                onPress={() => handleApplyDeal(deal.id)}
              >
                <Text
                  style={[
                    styles.applyButtonText,
                    appliedDeals.includes(deal.id) && styles.applyButtonTextActive,
                  ]}
                >
                  {appliedDeals.includes(deal.id) ? '✓ Applied' : 'Apply Now'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dealPopularity}>
              <Text style={styles.popularityText}>
                {deal.applyCount} customers using this
              </Text>
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
    marginBottom: 4,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  dealCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  dealBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  personalizedBadge: {
    backgroundColor: '#FFE5CC',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  personalizedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B35',
  },
  discountBadge: {
    backgroundColor: '#34C759',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  dealContent: {
    marginBottom: 12,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dealDescription: {
    fontSize: 12,
    color: '#666',
  },
  dealPricing: {
    marginBottom: 12,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  finalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  specialDealText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  dealInfo: {
    flex: 1,
  },
  dealBranches: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  dealValidity: {
    fontSize: 11,
    color: '#999',
  },
  applyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  applyButtonActive: {
    backgroundColor: '#007AFF',
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  applyButtonTextActive: {
    color: 'white',
  },
  dealPopularity: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  popularityText: {
    fontSize: 11,
    color: '#999',
  },
});
