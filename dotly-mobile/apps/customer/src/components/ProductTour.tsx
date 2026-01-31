import React, { useState, ReactNode, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../packages/@dotly/core/src/theme';

interface TourStep {
  id: string;
  targetRef?: React.RefObject<any>;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ProductTourProps {
  steps: TourStep[];
  isVisible: boolean;
  onComplete: () => void;
}

/**
 * Interactive Product Tour Component
 */
export function ProductTour({ steps, isVisible, onComplete }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { theme } = useTheme();
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <TourSpotlight step={step} />

        <View
          style={[
            styles.tooltip,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.lg,
            },
          ]}
        >
          <Text style={[styles.tooltipTitle, { color: theme.colors.text }]}>
            {step.title}
          </Text>
          <Text
            style={[
              styles.tooltipDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            {step.description}
          </Text>

          <View style={styles.tooltipActions}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[
                  styles.tooltipButton,
                  { borderColor: theme.colors.border, borderWidth: 1 },
                ]}
                onPress={handlePrev}
              >
                <Text style={[styles.tooltipButtonText, { color: theme.colors.primary }]}>
                  Back
                </Text>
              </TouchableOpacity>
            )}

            {step.action && (
              <TouchableOpacity
                style={[
                  styles.tooltipButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={step.action.onPress}
              >
                <Text style={[styles.tooltipButtonText, { color: 'white' }]}>
                  {step.action.label}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.tooltipButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleNext}
            >
              <Text style={[styles.tooltipButtonText, { color: 'white' }]}>
                {isLastStep ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Dots */}
          <View style={styles.dotsContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor:
                      index === currentStep
                        ? theme.colors.primary
                        : theme.colors.border,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Spotlight Effect Component
 */
function TourSpotlight({ step }: { step: TourStep }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step.id]);

  return (
    <Animated.View
      style={[
        styles.spotlight,
        {
          opacity: fadeAnim,
        },
      ]}
    />
  );
}

/**
 * Tour Provider Hook
 */
export function useTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);

  const startTour = (tourSteps: TourStep[]) => {
    setSteps(tourSteps);
    setIsVisible(true);
  };

  const endTour = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    steps,
    startTour,
    endTour,
  };
}

/**
 * Tour Context Provider
 */
interface TourContextType {
  startTour: (steps: TourStep[]) => void;
  endTour: () => void;
  isRunning: boolean;
}

const TourContext = React.createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const tour = useTour();

  return (
    <TourContext.Provider
      value={{
        startTour: tour.startTour,
        endTour: tour.endTour,
        isRunning: tour.isVisible,
      }}
    >
      {children}
      <ProductTour
        steps={tour.steps}
        isVisible={tour.isVisible}
        onComplete={tour.endTour}
      />
    </TourContext.Provider>
  );
}

export function useTourContext() {
  const context = React.useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within TourProvider');
  }
  return context;
}

/**
 * Highlight Component for Web
 */
export function Highlight({
  children,
  tourId,
  className = '',
}: {
  children: ReactNode;
  tourId?: string;
  className?: string;
}) {
  return (
    <div
      data-tour={tourId}
      className={`tour-highlight ${className}`}
      style={{
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlight: {
    ...StyleSheet.absoluteFillObject,
  },
  tooltip: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tooltipDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  tooltipActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tooltipButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  tooltipButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
