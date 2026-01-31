import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTheme } from '@dotly/core';

interface Consent {
  type: string;
  label: string;
  description: string;
  value: boolean;
  required?: boolean;
}

/**
 * Mobile Privacy Settings Screen
 */
export function PrivacySettings() {
  const { theme } = useTheme();
  const [consents, setConsents] = useState<Consent[]>([
    {
      type: 'marketing',
      label: 'Marketing Communications',
      description: 'Receive promotional messages and offers',
      value: false,
    },
    {
      type: 'cookies',
      label: 'Analytics & Cookies',
      description: 'Help improve the app with usage data',
      value: false,
    },
    {
      type: 'privacy',
      label: 'Privacy Policy',
      description: 'I acknowledge the privacy policy',
      value: true,
      required: true,
    },
    {
      type: 'dataProcessing',
      label: 'Data Processing',
      description: 'I consent to data processing',
      value: true,
      required: true,
    },
    {
      type: 'profiling',
      label: 'Personalization',
      description: 'Personalize my experience',
      value: false,
    },
  ]);

  const handleConsentChange = (index: number) => {
    if (consents[index].required) return; // Can't disable required consents

    const updated = [...consents];
    updated[index].value = !updated[index].value;
    setConsents(updated);
    updateConsent(consents[index].type, updated[index].value);
  };

  const updateConsent = async (type: string, granted: boolean) => {
    try {
      // API call to update consent
      const userId = await getUserId();
      await fetch('/api/gdpr/consent/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          consentType: type.charAt(0).toUpperCase() + type.slice(1),
          isGranted: granted,
        }),
      });
    } catch (error) {
      console.error('Error updating consent:', error);
    }
  };

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
      }}
    >
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 16,
          }}
        >
          Privacy & Consent
        </Text>

        {consents.map((consent, index) => (
          <View
            key={consent.type}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
              borderColor: theme.colors.border,
              borderWidth: 1,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: theme.colors.text,
                    marginBottom: 4,
                  }}
                >
                  {consent.label}
                  {consent.required && <Text style={{ color: '#FF3B30' }}>*</Text>}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {consent.description}
                </Text>
              </View>
              <Switch
                value={consent.value}
                onValueChange={() => handleConsentChange(index)}
                disabled={consent.required}
                style={{ marginLeft: 16 }}
              />
            </View>
          </View>
        ))}

        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
            padding: 16,
            marginTop: 24,
            borderColor: theme.colors.border,
            borderWidth: 1,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.colors.text,
              marginBottom: 12,
            }}
          >
            Your Rights
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.textSecondary,
              lineHeight: 20,
            }}
          >
            • Right to access and export your data{'\n'}• Right to delete your account{'\n'}•
            Right to data portability{'\n'}• Right to opt-out of processing{'\n'}• Right to
            rectification
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Data Download Screen
 */
export function DataDownloadScreen() {
  const { theme } = useTheme();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const userId = await getUserId();
      const response = await fetch(`/api/gdpr/customer/export?customerId=${userId}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        // On mobile, trigger download via WebView or similar
        Alert.alert('Success', 'Your data export is ready. It will download shortly.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download your data');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
        padding: 16,
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          padding: 24,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 24,
            marginBottom: 16,
          }}
        >
          📥
        </Text>

        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 12,
          }}
        >
          Download Your Data
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          Get a copy of all your personal data in JSON format. This includes your profile,
          transaction history, and preferences.
        </Text>

        <TouchableOpacity
          onPress={handleDownload}
          disabled={downloading}
          style={{
            backgroundColor: '#007AFF',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {downloading ? 'Downloading...' : 'Export My Data'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Account Deletion Screen
 */
export function DeleteAccountScreen() {
  const { theme } = useTheme();
  const [step, setStep] = useState<'confirm' | 'reason' | 'completed'>('confirm');
  const [reason, setReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const userId = await getUserId();
      const response = await fetch('/api/gdpr/customer/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: userId,
          reason,
        }),
      });

      if (response.ok) {
        setStep('completed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ScrollView
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
      }}
    >
      <View style={{ padding: 16 }}>
        {step === 'confirm' && (
          <>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#FF3B30',
                marginBottom: 16,
              }}
            >
              Delete Account
            </Text>

            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  lineHeight: 20,
                  marginBottom: 16,
                }}
              >
                Deleting your account will permanently remove:
              </Text>

              <Text style={{ color: '#FF3B30', marginBottom: 8 }}>
                • Your profile and personal information
              </Text>
              <Text style={{ color: '#FF3B30', marginBottom: 8 }}>
                • Your reward points and balance
              </Text>
              <Text style={{ color: '#FF3B30', marginBottom: 8 }}>
                • Your transaction history (anonymized)
              </Text>
              <Text style={{ color: '#FF3B30' }}>
                • Any pending redemptions
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setStep('reason')}
              style={{
                backgroundColor: '#FF3B30',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                Continue with Deletion
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'reason' && (
          <>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#FF3B30',
                marginBottom: 16,
              }}
            >
              Why are you leaving?
            </Text>

            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.text,
                  marginBottom: 12,
                  fontWeight: '600',
                }}
              >
                Optional feedback (helps us improve)
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              style={{
                backgroundColor: '#FF3B30',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
                opacity: deleting ? 0.6 : 1,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                {deleting ? 'Processing...' : 'Confirm Deletion'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'completed' && (
          <View
            style={{
              backgroundColor: '#E8F5E9',
              borderRadius: 8,
              padding: 24,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 16 }}>✓</Text>

            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#2E7D32',
                marginBottom: 12,
              }}
            >
              Deletion Requested
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: '#2E7D32',
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              Your account will be permanently deleted in 30 days. You can cancel anytime by
              logging back in.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

async function getUserId(): Promise<number> {
  // Get from secure storage or context
  return 0;
}
