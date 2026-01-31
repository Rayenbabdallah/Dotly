import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  latitude: number;
  longitude: number;
  distance: number;
  isOpen: boolean;
  rating: number;
  reviewCount: number;
}

export function ShopLocatorScreen() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation] = useState({ latitude: 24.8607, longitude: 67.0011 }); // Karachi

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const mockBranches: Branch[] = [
        {
          id: '1',
          name: 'Main Branch',
          address: '123 Main Street, Downtown',
          phone: '+92 21 1234 5678',
          email: 'main@dotly.pk',
          hours: '9:00 AM - 11:00 PM',
          latitude: 24.8607,
          longitude: 67.0011,
          distance: 0.5,
          isOpen: true,
          rating: 4.8,
          reviewCount: 342,
        },
        {
          id: '2',
          name: 'North Branch',
          address: '456 North Ave, Clifton',
          phone: '+92 21 8765 4321',
          email: 'north@dotly.pk',
          hours: '10:00 AM - 10:00 PM',
          latitude: 24.785,
          longitude: 67.024,
          distance: 2.3,
          isOpen: true,
          rating: 4.6,
          reviewCount: 218,
        },
        {
          id: '3',
          name: 'Airport Branch',
          address: '789 Airport Road',
          phone: '+92 21 5555 6666',
          email: 'airport@dotly.pk',
          hours: '24 Hours',
          latitude: 24.901,
          longitude: 67.16,
          distance: 12.1,
          isOpen: true,
          rating: 4.5,
          reviewCount: 156,
        },
        {
          id: '4',
          name: 'Tariq Road Branch',
          address: 'Tariq Road, Saddar',
          phone: '+92 21 3333 4444',
          email: 'tariqroad@dotly.pk',
          hours: '9:00 AM - 11:00 PM',
          latitude: 24.847,
          longitude: 67.008,
          distance: 5.2,
          isOpen: false,
          rating: 4.7,
          reviewCount: 289,
        },
      ];

      // Sort by distance
      const sorted = mockBranches.sort((a, b) => a.distance - b.distance);
      setBranches(sorted);
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleNavigate = (latitude: number, longitude: number) => {
    const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
    Linking.openURL(url);
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
        <Text style={styles.title}>Find Our Branches</Text>
        <Text style={styles.subtitle}>
          {branches.length} locations near you
        </Text>

        {branches.map((branch) => (
          <View key={branch.id} style={styles.branchCard}>
            <View style={styles.branchHeader}>
              <View style={styles.branchTitleSection}>
                <Text style={styles.branchName}>{branch.name}</Text>
                <View style={styles.statusBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: branch.isOpen ? '#34C759' : '#999' },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {branch.isOpen ? 'Open' : 'Closed'}
                  </Text>
                </View>
              </View>
              <View style={styles.distanceBadge}>
                <Text style={styles.distance}>{branch.distance} km</Text>
              </View>
            </View>

            {/* Rating */}
            <View style={styles.ratingSection}>
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Text key={i} style={styles.star}>
                    {i < Math.floor(branch.rating) ? '★' : '☆'}
                  </Text>
                ))}
              </View>
              <Text style={styles.ratingText}>
                {branch.rating} ({branch.reviewCount} reviews)
              </Text>
            </View>

            {/* Address */}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>📍 Address</Text>
              <Text style={styles.infoValue}>{branch.address}</Text>
            </View>

            {/* Hours */}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>⏰ Hours</Text>
              <Text style={styles.infoValue}>{branch.hours}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCall(branch.phone)}
              >
                <Text style={styles.actionButtonIcon}>📞</Text>
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEmail(branch.email)}
              >
                <Text style={styles.actionButtonIcon}>✉️</Text>
                <Text style={styles.actionButtonText}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => handleNavigate(branch.latitude, branch.longitude)}
              >
                <Text style={styles.actionButtonIcon}>🗺️</Text>
                <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                  Navigate
                </Text>
              </TouchableOpacity>
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
  branchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  branchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  branchTitleSection: {
    flex: 1,
  },
  branchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 'fit-content',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  distanceBadge: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  distance: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 14,
    color: '#FFD700',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  actionButtonPrimary: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  actionButtonIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  actionButtonTextPrimary: {
    color: 'white',
  },
});
