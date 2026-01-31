# UI/UX Components - Quick Reference Guide

## 🎨 Dark Mode

### Web
```tsx
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Setup in App.tsx
<ThemeProvider>
  <YourApp />
</ThemeProvider>

// Use in components
const { isDark, mode, setMode, toggleTheme } = useTheme();

// Apply styles
<div style={{ color: isDark ? '#fff' : '#000' }}>
  {isDark ? '🌙' : '☀️'}
</div>
```

### Mobile
```tsx
import { ThemeProvider, useTheme } from '@dotly/core';

// Setup
<ThemeProvider>
  <App />
</ThemeProvider>

// Use
const { theme } = useTheme();
<View style={{ backgroundColor: theme.colors.background }} />
<Text style={{ color: theme.colors.text }}>Content</Text>
```

---

## ♿ Accessibility

### Web - Contrast Validation
```tsx
import { getContrastRatio, meetsWCAGAA, meetsWCAGAAA } from './lib/accessibility';

const ratio = getContrastRatio('#007AFF', '#FFFFFF');  // 10.7:1
const isValid = meetsWCAGAA('#007AFF', '#FFFFFF');     // true
```

### Web - Keyboard Navigation
```tsx
import { createArrowKeyNavigationHandler, createFocusTrap } from './lib/accessibility';

// List navigation
const handler = createArrowKeyNavigationHandler(items, (item, index) => {
  console.log('Selected:', index);
});
items.forEach(item => item.addEventListener('keydown', handler));

// Modal focus trap
const trap = createFocusTrap(modalElement);
modalElement.addEventListener('keydown', trap);
```

### Web - Screen Reader
```tsx
import { announceToScreenReader, ariaHelpers, a11yLabels } from './lib/accessibility';

// Announce
announceToScreenReader('Payment successful', 'assertive');

// ARIA helpers
ariaHelpers.setLabel(button, 'Close menu');
ariaHelpers.setExpanded(menu, isOpen);
ariaHelpers.setInvalid(input, hasError);

// Pre-defined labels
<span className="sr-only">{a11yLabels.loading}</span>
```

---

## 🎬 Animations

### Web - CSS Classes
```tsx
import './styles/animations.css';

// Add to elements
<div className="animate-fadeIn">Fade in</div>
<div className="animate-slideInUp">Slide from bottom</div>
<div className="animate-scaleIn">Scale in</div>
<div className="animate-bounce">Bounce</div>
<div className="animate-pulse">Pulse</div>
```

### Mobile - React Native
```tsx
import { FadeIn, SlideIn, ScaleIn, Pulse, Bounce } from './components/animations';

<FadeIn duration={300}>
  <Text>Fade in text</Text>
</FadeIn>

<SlideIn direction="up" duration={300}>
  <View>Slide from bottom</View>
</SlideIn>

<ScaleIn duration={300}>
  <Icon />
</ScaleIn>

<Pulse>
  <ActivityIndicator /> {/* Loading */}
</Pulse>
```

---

## ⚙️ Loading States

### Web
```tsx
import { LoadingSpinner } from './components/UIEnhancements';
import './styles/skeletons.css';

// Spinner
<LoadingSpinner />

// Skeleton placeholders
<div className="skeleton skeleton-title"></div>
<div className="skeleton-card">
  <div className="skeleton-text"></div>
  <div className="skeleton-text"></div>
</div>
```

### Mobile
```tsx
import { SkeletonLoader, SkeletonCard, SkeletonList, ShimmerLoader } from './components/animations';

<SkeletonLoader width="100%" height={16} />
<SkeletonCard />
<SkeletonList count={5} gap={8} />
<ShimmerLoader />
```

---

## 📋 Empty States

### Web & Mobile
```tsx
import { EmptyState, EmptyTransactionState, ErrorState } from './components/UIEnhancements';
// or Mobile:
import { EmptyState, EmptyTransactionState, ErrorState } from './components/EmptyState';

// Generic
<EmptyState 
  icon="📋" 
  title="No data" 
  description="Try again later"
  action={{ label: 'Refresh', onClick: () => {} }}
/>

// Specific
<EmptyTransactionState />
<EmptyRewardsState />
<EmptyDealsState />

// Error state
<ErrorState 
  title="Failed to load"
  description="Please check your connection"
  onRetry={refetch}
/>
```

---

## ⚠️ Error Handling

### Web & Mobile
```tsx
import { ErrorBoundary } from './components/ErrorBoundary';

<ErrorBoundary onError={(error, info) => {
  console.error(error);
  // Report to Sentry
}}>
  <MyComponent />
</ErrorBoundary>
```

---

## 🎓 Onboarding

### Web
```tsx
import { Onboarding, customerOnboardingSteps, staffOnboardingSteps } from './components/Onboarding';

function App() {
  const [completed, setCompleted] = useState(() => {
    return localStorage.getItem('onboarding-completed') === 'true';
  });

  if (!completed) {
    return (
      <Onboarding
        steps={customerOnboardingSteps}
        onComplete={() => {
          localStorage.setItem('onboarding-completed', 'true');
          setCompleted(true);
        }}
        onSkip={() => setCompleted(true)}
      />
    );
  }

  return <MainApp />;
}
```

### Mobile
```tsx
import { Onboarding, customerOnboardingSteps } from './components/Onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkCompleted = async () => {
  const completed = await AsyncStorage.getItem('onboarding-completed');
  return completed === 'true';
};

const handleComplete = async () => {
  await AsyncStorage.setItem('onboarding-completed', 'true');
};
```

---

## 🎯 Product Tour

### Mobile Only
```tsx
import { useTourContext, TourProvider } from './components/ProductTour';

<TourProvider>
  <App />
</TourProvider>

// In component
function MyScreen() {
  const { startTour } = useTourContext();

  const handleStartTour = () => {
    startTour([
      {
        id: 'wallet',
        title: 'Your Wallet',
        description: 'See your balance here',
      },
      {
        id: 'rewards',
        title: 'Unlock Rewards',
        description: 'Redeem when ready',
        action: {
          label: 'Go to Rewards',
          onPress: () => navigate('/rewards')
        }
      },
    ]);
  };

  return <Button onPress={handleStartTour}>Start Tour</Button>;
}
```

---

## 📝 Common Patterns

### Loading + Error + Empty Flow
```tsx
import { LoadingSpinner, EmptyState, ErrorState } from './components/UIEnhancements';

function DataDisplay() {
  const { data, loading, error } = useData('/api/items');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState title="Error" onRetry={refetch} />;
  if (!data?.length) return <EmptyState icon="📋" title="No items" />;

  return <ItemList items={data} />;
}
```

### Theme-aware Styles
```tsx
import { useTheme } from './context/ThemeContext';

function Component() {
  const { isDark } = useTheme();
  
  return (
    <div style={{
      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
      color: isDark ? '#ffffff' : '#000000',
    }}>
      Content
    </div>
  );
}
```

### Accessibility Wrapper
```tsx
import { a11yLabels, ariaHelpers } from './lib/accessibility';

function AccessibleButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={false}
    >
      {label}
    </button>
  );
}
```

---

## 🧪 Testing

### Accessibility
```tsx
test('colors meet WCAG AA', () => {
  const { meetsWCAGAA } = require('./lib/accessibility');
  expect(meetsWCAGAA('#007AFF', '#FFFFFF')).toBe(true);
});

test('keyboard navigation works', async () => {
  render(<ListComponent items={items} />);
  const firstItem = screen.getAllByRole('option')[0];
  
  firstItem.focus();
  fireEvent.keyDown(firstItem, { key: 'ArrowDown' });
  
  expect(screen.getAllByRole('option')[1]).toHaveFocus();
});
```

### Dark Mode
```tsx
test('theme persists', () => {
  const { rerender } = render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );

  screen.getByRole('button', { name: /toggle/i }).click();
  expect(localStorage.getItem('theme-mode')).toBe('dark');
  
  rerender(/* ... */);
  expect(screen.getByTestId('theme')).toHaveAttribute('data-theme', 'dark');
});
```

---

## 📚 CSS Custom Properties

```css
/* Colors */
--color-background
--color-surface
--color-text
--color-text-secondary
--color-border
--color-primary
--color-success
--color-warning
--color-danger

/* Typography */
--font-size-xs (10px)
--font-size-sm (12px)
--font-size-md (14px)
--font-size-lg (16px)
--font-size-xl (18px)
--font-size-2xl (24px)

/* Spacing */
--space-xs (4px)
--space-sm (8px)
--space-md (16px)
--space-lg (24px)
--space-xl (32px)
--space-2xl (48px)

/* Border Radius */
--radius-sm (4px)
--radius-md (8px)
--radius-lg (12px)
--radius-full (9999px)

/* Shadows */
--shadow-sm
--shadow-md
--shadow-lg
```

---

## 🚀 Performance Tips

1. **Use CSS animations** instead of JS for better performance
2. **Enable GPU acceleration** with `transform` and `opacity`
3. **Avoid layout thrashing** by batching DOM updates
4. **Lazy load animations** using Intersection Observer
5. **Test on real devices** for animation smoothness
6. **Profile with DevTools** to catch jank
7. **Respect `prefers-reduced-motion`** for accessibility
8. **Memoize components** that render during animations

---

## 🐛 Debugging

### Dark Mode Issues
```tsx
// Check current theme
const { isDark, mode } = useTheme();
console.log('Dark mode:', isDark, 'Mode:', mode);

// Check CSS variable
console.log(getComputedStyle(document.documentElement).getPropertyValue('--color-primary'));
```

### Accessibility Issues
```tsx
// Run axe-core tests
import { axe } from 'jest-axe';

test('no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Animation Performance
```tsx
// Enable FPS counter
chrome DevTools → More tools → Rendering → Paint flashing
// Or use:
performance.mark('animation-start');
// ... animation code ...
performance.mark('animation-end');
performance.measure('animation', 'animation-start', 'animation-end');
```

---

## 📖 Full Documentation

- **Implementation Guide**: `UI_UX_IMPLEMENTATION.md`
- **Integration Examples**: `UI_UX_INTEGRATION_EXAMPLES.tsx`
- **Completion Summary**: `UI_UX_COMPLETION_SUMMARY.md`
- **This Quick Reference**: Current file

---

## 🔗 External Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Dark Mode Best Practices](https://web.dev/prefers-color-scheme/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)

---

**Last Updated**: [Current Date]  
**Version**: 1.0  
**Status**: Production Ready ✅
