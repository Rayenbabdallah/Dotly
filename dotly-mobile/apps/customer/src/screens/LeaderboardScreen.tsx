import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

interface LeaderboardEntry {
  rank: number;
  name: string;
  dots: number;
  isCurrentUser: boolean;
  joinedDate: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          rank: 1,
          name: 'Ali Khan',
          dots: 5250,
          isCurrentUser: false,
          joinedDate: '2024-06-15',
          tier: 'platinum',
        },
        {
          rank: 2,
          name: 'Fatima Ahmed',
          dots: 4890,
          isCurrentUser: false,
          joinedDate: '2024-07-20',
          tier: 'platinum',
        },
        {
          rank: 3,
          name: 'You',
          dots: 4650,
          isCurrentUser: true,
          joinedDate: '2024-08-10',
          tier: 'gold',
        },
        {
          rank: 4,
          name: 'Hassan Ali',
          dots: 4320,
          isCurrentUser: false,
          joinedDate: '2024-08-25',
          tier: 'gold',
        },
        {
          rank: 5,
          name: 'Zainab Malik',
          dots: 4100,
          isCurrentUser: false,
          joinedDate: '2024-09-05',
          tier: 'gold',
        },
        {
          rank: 6,
          name: 'Mohammad Hassan',
          dots: 3850,
          isCurrentUser: false,
          joinedDate: '2024-09-18',
          tier: 'silver',
        },
        {
          rank: 7,
          name: 'Aisha Noor',
          dots: 3600,
          isCurrentUser: false,
          joinedDate: '2024-10-02',
          tier: 'silver',
        },
        {
          rank: 8,
          name: 'Omar Khan',
          dots: 3250,
          isCurrentUser: false,
          joinedDate: '2024-10-15',
          tier: 'silver',
        },
      ];

      setLeaderboard(mockLeaderboard);
      setCurrentUserRank(3);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return '#E5E4E2';
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      case 'bronze':
        return '#CD7F32';
      default:
        return '#ddd';
    }
  };

  const getTierIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '•';
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
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top reward earners</Text>

        {currentUserRank && (
          <View style={styles.yourRankCard}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>#{currentUserRank}</Text>
            </View>
            <View style={styles.rankInfo}>
              <Text style={styles.rankLabel}>Your Rank</Text>
              <Text style={styles.rankPosition}>
                You're in the top {Math.round((currentUserRank / leaderboard.length) * 100)}% of
                users
              </Text>
            </View>
          </View>
        )}

        {/* Leaderboard List */}
        <Text style={styles.sectionTitle}>All Time Rankings</Text>
        {leaderboard.map((entry) => (
          <View
            key={entry.rank}
            style={[
              styles.leaderboardItem,
              entry.isCurrentUser && styles.leaderboardItemHighlight,
            ]}
          >
            <View style={styles.rankSection}>
              <Text style={styles.rankIcon}>{getTierIcon(entry.rank)}</Text>
              <Text style={styles.rank}>#{entry.rank}</Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{entry.name}</Text>
              <Text style={styles.joinedDate}>
                Joined {new Date(entry.joinedDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.dotsSection}>
              <View
                style={[styles.tierBadge, { backgroundColor: getTierColor(entry.tier) }]}
              >
                <Text style={styles.tierLabel}>{entry.tier.toUpperCase()}</Text>
              </View>
              <Text style={styles.dots}>{entry.dots}</Text>
            </View>
          </View>
        ))}

        {/* Tier Information */}
        <View style={styles.tierInfoContainer}>
          <Text style={styles.tierInfoTitle}>Tier Information</Text>

          <View style={styles.tierInfo}>
            <View style={styles.tierRow}>
              <View style={[styles.tierColor, { backgroundColor: '#CD7F32' }]} />
              <View style={styles.tierDetails}>
                <Text style={styles.tierName}>Bronze</Text>
                <Text style={styles.tierRange}>0 - 999 dots</Text>
              </View>
            </View>

            <View style={styles.tierRow}>
              <View style={[styles.tierColor, { backgroundColor: '#C0C0C0' }]} />
              <View style={styles.tierDetails}>
                <Text style={styles.tierName}>Silver</Text>
                <Text style={styles.tierRange}>1,000 - 2,999 dots</Text>
              </View>
            </View>

            <View style={styles.tierRow}>
              <View style={[styles.tierColor, { backgroundColor: '#FFD700' }]} />
              <View style={styles.tierDetails}>
                <Text style={styles.tierName}>Gold</Text>
                <Text style={styles.tierRange}>3,000 - 4,999 dots</Text>
              </View>
            </View>

            <View style={styles.tierRow}>
              <View style={[styles.tierColor, { backgroundColor: '#E5E4E2' }]} />
              <View style={styles.tierDetails}>
                <Text style={styles.tierName}>Platinum</Text>
                <Text style={styles.tierRange}>5,000+ dots</Text>
              </View>
            </View>
          </View>
        </View>
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
  yourRankCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  rankBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  rankInfo: {
    flex: 1,
  },
  rankLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  rankPosition: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  leaderboardItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderboardItemHighlight: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    backgroundColor: '#f9f9f9',
  },
  rankSection: {
    alignItems: 'center',
    minWidth: 50,
  },
  rankIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  rank: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  joinedDate: {
    fontSize: 11,
    color: '#999',
  },
  dotsSection: {
    alignItems: 'flex-end',
    gap: 6,
  },
  tierBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tierLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
  dots: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  tierInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 40,
  },
  tierInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  tierInfo: {
    gap: 12,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tierColor: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  tierDetails: {
    flex: 1,
  },
  tierName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  tierRange: {
    fontSize: 11,
    color: '#999',
  },
});
