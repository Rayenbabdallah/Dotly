import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { FadeIn, SlideIn } from './animations';
import { useTheme } from '../../packages/@dotly/core/src/theme';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
  content?: React.ReactNode;
}

interface OnboardingProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip?: () => void;
}

/**
 * Onboarding Component
 */
export function Onboarding({ steps, onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { theme } = useTheme();
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                backgroundColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {currentStep + 1} of {steps.length}
          </Text>
        </View>

        {/* Content */}
        <FadeIn>
          <View style={styles.content}>
            <Text style={[styles.icon]}>{step.icon}</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{step.title}</Text>
            <Text
              style={[styles.description, { color: theme.colors.textSecondary }]}
            >
              {step.description}
            </Text>
            {step.content && (
              <View style={styles.customContent}>{step.content}</View>
            )}
          </View>
        </FadeIn>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentStep
                      ? theme.colors.primary
                      : theme.colors.border,
                  width: index === currentStep ? 8 : 6,
                },
              ]}
            />
          ))}
        </View>
      </ScrollView>

      {/* Actions */}
      <View
        style={[
          styles.actionsContainer,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        {currentStep > 0 && (
          <TouchableOpacity
            style={[
              styles.button,
              {
                borderColor: theme.colors.border,
                borderWidth: 1,
              },
            ]}
            onPress={handlePrevious}
          >
            <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
        )}

        {onSkip && !isLastStep && (
          <TouchableOpacity
            style={[
              styles.button,
              {
                borderColor: theme.colors.border,
                borderWidth: 1,
              },
            ]}
            onPress={onSkip}
          >
            <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>
              Skip All
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            {
              backgroundColor: theme.colors.primary,
              flex: currentStep === 0 ? 1 : undefined,
            },
          ]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, { color: 'white', fontWeight: 'bold' }]}>
            {isLastStep ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/**
 * Pre-built onboarding steps for customer app
 */
export const customerOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: '👋',
    title: 'Welcome to Dotly',
    description:
      'Earn dots every time you visit and redeem them for exclusive rewards',
  },
  {
    id: 'qr-code',
    icon: '📱',
    title: 'Your QR Code',
    description:
      'Show your QR code to staff at checkout. No need to enter phone numbers anymore!',
  },
  {
    id: 'earn-dots',
    icon: '⭐',
    title: 'Earn Dots',
    description:
      'Every purchase earns you dots. The more you buy, the more you earn!',
  },
  {
    id: 'redeem-rewards',
    icon: '🎁',
    title: 'Redeem Rewards',
    description: 'Unlock exclusive rewards when you reach the dot threshold',
  },
  {
    id: 'deals',
    icon: '🏷️',
    title: 'Personalized Deals',
    description:
      'Get special deals tailored just for you. Check back often for new offers!',
  },
];

/**
 * Pre-built onboarding steps for staff app
 */
export const staffOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: '👋',
    title: 'Welcome to Dotly Staff',
    description: 'Manage customer rewards and process transactions efficiently',
  },
  {
    id: 'qr-scanner',
    icon: '📸',
    title: 'QR Scanner',
    description:
      'Scan customer QR codes to quickly identify customers and process transactions',
  },
  {
    id: 'pos',
    icon: '💳',
    title: 'Record Transactions',
    description:
      'Enter transaction amount and automatically award dots to customers',
  },
  {
    id: 'approvals',
    icon: '✅',
    title: 'Approval Workflow',
    description:
      'Review and approve large redemptions. Maintain fraud prevention standards.',
  },
  {
    id: 'analytics',
    icon: '📊',
    title: 'View Analytics',
    description:
      'Track your performance with transaction history, shift reports, and analytics',
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  content: {
    alignItems: 'center',
    marginVertical: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  customContent: {
    marginTop: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 40,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
