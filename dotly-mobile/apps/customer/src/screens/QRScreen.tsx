import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export function QRScreen() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const { token, logout } = useAuth();

  React.useEffect(() => {
    // In a real app, fetch the QR code from API
    // For now, using a placeholder
    setQrCode(`customer-${token?.userId}`);
  }, [token]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>My QR Code</Text>

        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            {/* In production, use react-native-qrcode-svg */}
            <Text style={styles.placeholderText}>📱 QR Code</Text>
            {qrCode && <Text style={styles.qrValue}>{qrCode}</Text>}
          </View>
          <Text style={styles.instruction}>
            Show this QR code to staff members to earn dots on your purchases
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Show your QR code at any Dotly shop</Text>
          </View>
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Staff member scans your QR code</Text>
          </View>
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Dots are automatically added to your wallet</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>🔄 Refresh QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  qrContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  qrBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    marginBottom: 16,
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: 16,
  },
  qrValue: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
  },
  refreshButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 14,
  },
  logoutButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
