import React, { ReactNode } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from './theme';

/**
 * Fade In Animation Component
 */
export function FadeIn({ children, duration = 300, delay = 0 }: { children: ReactNode; duration?: number; delay?: number }) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: animatedValue }}>
      {children}
    </Animated.View>
  );
}

/**
 * Slide In Animation Component
 */
export function SlideIn({
  children,
  direction = 'left',
  duration = 300,
  delay = 0,
}: {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
}) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const getTranslation = () => {
    switch (direction) {
      case 'left':
        return { transform: [{ translateX: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] };
      case 'right':
        return { transform: [{ translateX: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] };
      case 'up':
        return { transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] };
      case 'down':
        return { transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] };
    }
  };

  return (
    <Animated.View style={getTranslation()}>
      {children}
    </Animated.View>
  );
}

/**
 * Scale Animation Component
 */
export function ScaleIn({
  children,
  duration = 300,
  delay = 0,
}: {
  children: ReactNode;
  duration?: number;
  delay?: number;
}) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ scale: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Pulse Animation Component - for loading states
 */
export function Pulse({ children }: { children: ReactNode }) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }}>
      {children}
    </Animated.View>
  );
}

/**
 * Bounce Animation Component - for attention
 */
export function Bounce({ children }: { children: ReactNode }) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: -10,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY: animatedValue }] }}>
      {children}
    </Animated.View>
  );
}

/**
 * Skeleton Loader Component
 */
export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 4, style = {} }: {
  width?: string | number;
  height?: number;
  borderRadius?: number;
  style?: object;
}) {
  const { theme } = useTheme();

  return (
    <Pulse>
      <View
        style={{
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.skeleton,
          ...style,
        }}
      />
    </Pulse>
  );
}

/**
 * Skeleton Card Component - mimics card layout
 */
export function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <SkeletonLoader width="40%" height={20} style={{ marginBottom: 12 }} />
      <SkeletonLoader width="100%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="85%" height={16} />
    </View>
  );
}

/**
 * Skeleton List Component - shows multiple skeleton cards
 */
export function SkeletonList({ count = 5, gap = 12 }: { count?: number; gap?: number }) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

/**
 * Shimmer Effect (like loading shimmer)
 */
export function ShimmerLoader({ width = '100%', height = 20 }: { width?: string | number; height?: number }) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-width, width],
              }),
            },
          ],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
});
