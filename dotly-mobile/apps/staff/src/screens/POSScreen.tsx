import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { apiClient, offlineQueue } from '@dotly/core';
import { useAuth } from '../contexts/AuthContext';

export function POSScreen() {
  const [scannedCustomer, setScannedCustomer] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { token } = useAuth();

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScannedCustomer(data);
    setShowCamera(false);
  };

  const requestCameraPermission = async () => {
    const { granted } = await requestPermission();
    if (granted) {
      setShowCamera(true);
    }
  };

  const handleProcessTransaction = async () => {
    if (!scannedCustomer || !amount) {
      Alert.alert('Error', 'Please scan customer QR and enter amount');
      return;
    }

    setLoading(true);
    try {
      // Try online first
      await apiClient.createVisit(scannedCustomer, parseFloat(amount));

      Alert.alert('Success', 'Transaction completed');
      setScannedCustomer(null);
      setAmount('');
    } catch (error: any) {
      // If offline, queue transaction
      if (!navigator.onLine) {
        await offlineQueue.addTransaction('visit', {
          phone: scannedCustomer,
          amount: parseFloat(amount),
        });
        Alert.alert('Offline', 'Transaction queued. Will sync when online.');
        setScannedCustomer(null);
        setAmount('');
      } else {
        Alert.alert('Error', apiClient.handleError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  if (showCamera && permission?.granted) {
    return (
      <SafeAreaView style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={handleBarcodeScanned}
        />
        <TouchableOpacity
          style={styles.closeCameraButton}
          onPress={() => setShowCamera(false)}
        >
          <Text style={styles.closeCameraButtonText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Process Purchase</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Customer QR Code</Text>
          {scannedCustomer ? (
            <View style={styles.customerBox}>
              <Text style={styles.customerText}>{scannedCustomer}</Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setScannedCustomer(null)}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.scanButton}
              onPress={requestCameraPermission}
            >
              <Text style={styles.scanButtonText}>📱 Scan QR Code</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Amount (Rs)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.processButton, loading && styles.buttonDisabled]}
          onPress={handleProcessTransaction}
          disabled={loading}
        >
          <Text style={styles.processButtonText}>
            {loading ? 'Processing...' : 'Process Transaction'}
          </Text>
        </TouchableOpacity>

        {offlineQueue.getQueueSize() > 0 && (
          <View style={styles.offlineWarning}>
            <Text style={styles.offlineText}>
              ⚠️ {offlineQueue.getQueueSize()} pending transaction(s) offline
            </Text>
          </View>
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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  closeCameraButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  closeCameraButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
  },
  scanButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  customerBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  customerText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 8,
  },
  changeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 4,
  },
  changeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  processButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  processButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  offlineWarning: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  offlineText: {
    color: '#856404',
    fontSize: 14,
  },
});
