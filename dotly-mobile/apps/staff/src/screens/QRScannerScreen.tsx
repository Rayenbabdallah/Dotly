import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as BarcodeScanner from 'expo-barcode-scanner';

interface ScannedData {
  type: 'customer' | 'barcode';
  customerId?: string;
  value?: string;
  timestamp: string;
}

export function QRScannerScreen({ onScan }: { onScan?: (data: ScannedData) => void }) {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedHistory, setScannedHistory] = useState<ScannedData[]>([]);

  useEffect(() => {
    (async () => {
      if (!hasPermission?.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          Alert.alert('Permission Required', 'Camera permission is required to scan QR codes');
        }
      }
    })();
  }, []);

  const handleBarCodeScanned = async (result: {
    type: string;
    data: string;
  }) => {
    if (scanned || isProcessing) return;

    setIsProcessing(true);

    try {
      // Attempt to parse as customer QR
      let scannedData: ScannedData;

      try {
        const parsed = JSON.parse(result.data);
        if (parsed.type === 'customer' && parsed.customerId) {
          scannedData = {
            type: 'customer',
            customerId: parsed.customerId,
            timestamp: new Date().toISOString(),
          };
        } else {
          throw new Error('Invalid QR format');
        }
      } catch {
        // If JSON parsing fails, treat as barcode
        scannedData = {
          type: 'barcode',
          value: result.data,
          timestamp: new Date().toISOString(),
        };
      }

      // Add to history
      setScannedHistory((prev) => [scannedData, ...prev.slice(0, 9)]);

      // Call callback if provided
      if (onScan) {
        onScan(scannedData);
      }

      // Show success feedback
      Alert.alert(
        'Success',
        scannedData.type === 'customer'
          ? `Customer ${scannedData.customerId} scanned`
          : `Barcode scanned: ${scannedData.value}`
      );

      setScanned(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to process scanned code');
      console.error('Barcode scanning error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission is required</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasPermission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera access denied</Text>
          <Text style={styles.permissionSubtext}>
            Please enable camera permissions in settings
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            BarcodeScanner.BarcodeType.qr,
            BarcodeScanner.BarcodeType.ean13,
            BarcodeScanner.BarcodeType.code128,
          ],
        }}
      >
        {/* Camera Overlay */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlayLeft} />
            <View style={styles.scanFrame}>
              <View style={styles.corner} />
              <View style={styles.corner} />
              <View style={styles.corner} />
              <View style={styles.corner} />
            </View>
            <View style={styles.overlayRight} />
          </View>
          <View style={styles.overlayBottom}>
            <Text style={styles.overlayText}>
              Position QR code within frame
            </Text>
          </View>
        </View>

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </CameraView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setScanned(false)}
          disabled={!scanned}
        >
          <Text style={styles.buttonText}>
            {scanned ? 'Scan Again' : 'Ready to Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Scans */}
      {scannedHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Scans</Text>
          <View style={styles.historyList}>
            {scannedHistory.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyItemText}>
                  {item.type === 'customer'
                    ? `Customer: ${item.customerId}`
                    : `Barcode: ${item.value?.substring(0, 20)}...`}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTop: {
    flex: 1,
  },
  overlayMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  overlayLeft: {
    flex: 1,
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#00FF00',
    borderWidth: 3,
  },
  overlayRight: {
    flex: 1,
  },
  overlayBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  processingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    marginTop: 12,
    fontSize: 14,
  },
  controls: {
    backgroundColor: '#1f1f1f',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  historyContainer: {
    backgroundColor: '#1f1f1f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  historyTitle: {
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 12,
  },
  historyList: {
    gap: 6,
  },
  historyItem: {
    backgroundColor: '#2a2a2a',
    padding: 8,
    borderRadius: 6,
  },
  historyItemText: {
    color: '#999',
    fontSize: 11,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
