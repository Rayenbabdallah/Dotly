/**
 * Integration Examples for UI/UX Components
 * Apply these patterns to existing screens
 */

// ============================================
// WEB PLATFORM EXAMPLES
// ============================================

/**
 * Example 1: Page with Dark Mode + Accessibility
 */
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { EmptyState, ErrorState, LoadingSpinner } from '../components/UIEnhancements';
import { getContrastRatio, meetsWCAGAA } from '../lib/accessibility';

function MyPage() {
  const { isDark } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-fadeIn"><LoadingSpinner /></div>;
  if (error) return <ErrorState title="Failed to load" description={error} onRetry={fetchData} />;
  if (!data.length) return <EmptyState icon="📋" title="No data" />;

  return (
    <div className="animate-slideInUp">
      <h1 style={{
        color: isDark ? '#ffffff' : '#1a1a1a',
      }}>
        My Page
      </h1>
      {/* Content */}
    </div>
  );
}

export default () => (
  <ThemeProvider>
    <MyPage />
  </ThemeProvider>
);

/**
 * Example 2: Form with Accessibility & Validation
 */
import { a11yLabels, ariaHelpers, announceToScreenReader } from '../lib/accessibility';
import { ErrorBoundary } from '../components/ErrorBoundary';

function MyForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setEmailError(isValid ? '' : 'Invalid email format');

    if (!isValid) {
      announceToScreenReader('Invalid email format', 'assertive');
    }
  };

  return (
    <ErrorBoundary>
      <form aria-label="Contact form">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'email-error' : undefined}
        />
        {emailError && (
          <span id="email-error" role="alert" className="sr-only">
            {emailError}
          </span>
        )}
      </form>
    </ErrorBoundary>
  );
}

/**
 * Example 3: Onboarding on App Mount
 */
import { Onboarding, customerOnboardingSteps } from '../components/Onboarding';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check if user has completed onboarding
    return localStorage.getItem('onboarding-complete') !== 'true';
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding-complete', 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <Onboarding
        steps={customerOnboardingSteps}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingComplete}
      />
    );
  }

  return <MainApp />;
}

/**
 * Example 4: List with Keyboard Navigation
 */
import { createArrowKeyNavigationHandler } from '../lib/accessibility';

function ListComponent({ items }: { items: string[] }) {
  const listRef = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    const handler = createArrowKeyNavigationHandler(listRef.current);
    listRef.current.forEach(item => {
      item?.addEventListener('keydown', handler);
    });

    return () => {
      listRef.current.forEach(item => {
        item?.removeEventListener('keydown', handler);
      });
    };
  }, []);

  return (
    <div role="listbox">
      {items.map((item, index) => (
        <button
          key={index}
          ref={el => {
            if (el) listRef.current[index] = el;
          }}
          role="option"
          tabIndex={index === 0 ? 0 : -1}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

/**
 * Example 5: Contrast Validation
 */
function ColorValidator() {
  const [color1, setColor1] = useState('#000000');
  const [color2, setColor2] = useState('#FFFFFF');

  const ratio = getContrastRatio(color1, color2);
  const meetsAA = meetsWCAGAA(color1, color2);
  const meetsAAA = meetsWCAGAAA(color1, color2);

  return (
    <div>
      <p>Contrast Ratio: {ratio.toFixed(2)}:1</p>
      <p>WCAG AA: {meetsAA ? '✓ Pass' : '✗ Fail'}</p>
      <p>WCAG AAA: {meetsAAA ? '✓ Pass' : '✗ Fail'}</p>
    </div>
  );
}

// ============================================
// MOBILE PLATFORM EXAMPLES (React Native)
// ============================================

/**
 * Example 6: Screen with Theme + Animations
 */
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../../packages/@dotly/core/src/theme';
import { FadeIn, SlideIn, SkeletonList } from './components/animations';
import { EmptyTransactionState } from './components/EmptyState';

function TransactionScreen() {
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <FadeIn duration={300}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {loading ? (
          <SkeletonList count={5} gap={8} />
        ) : data.length === 0 ? (
          <EmptyTransactionState />
        ) : (
          <SlideIn direction="up">
            <ScrollView>
              {data.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.item,
                    {
                      backgroundColor: theme.colors.surface,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: theme.colors.text }}>
                    {item.description}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </SlideIn>
        )}
      </View>
    </FadeIn>
  );
}

/**
 * Example 7: Onboarding on App Launch
 */
import { Onboarding, customerOnboardingSteps } from './components/Onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AppRoot() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const completed = await AsyncStorage.getItem('onboarding-completed');
    setShowOnboarding(completed !== 'true');
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem('onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <Onboarding
        steps={customerOnboardingSteps}
        onComplete={handleComplete}
        onSkip={handleComplete}
      />
    );
  }

  return <MainApp />;
}

/**
 * Example 8: Product Tour
 */
import { useTourContext, ProductTour } from './components/ProductTour';

function FeatureShowcase() {
  const { startTour } = useTourContext();

  const handleStartTour = () => {
    startTour([
      {
        id: 'wallet',
        title: 'Your Wallet',
        description: 'See your dots balance here',
      },
      {
        id: 'qr',
        title: 'Show Your QR Code',
        description: 'Display this at checkout',
      },
      {
        id: 'rewards',
        title: 'Unlock Rewards',
        description: 'Redeem when you have enough dots',
      },
    ]);
  };

  return (
    <View>
      <TouchableOpacity onPress={handleStartTour}>
        <Text>Start Tour</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Example 9: Error Boundary Usage
 */
import { ErrorBoundary } from './components/ErrorBoundary';

function AppWrapper() {
  return (
    <ErrorBoundary
      onError={(error, info) => {
        // Log to Sentry or error tracking service
        console.error('App Error:', error);
        console.error('Error Info:', info);
      }}
    >
      <App />
    </ErrorBoundary>
  );
}

/**
 * Example 10: Accessibility in Mobile
 */
import {
  getContrastRatio,
  meetsWCAGAA,
  createArrowKeyNavigationHandler,
} from '../../packages/@dotly/core/src/accessibility';

function AccessibleButton() {
  const { theme } = useTheme();

  // Validate colors meet WCAG AA
  const ratio = getContrastRatio(theme.colors.primary, theme.colors.background);
  const isAccessible = meetsWCAGAA(theme.colors.primary, theme.colors.background);

  return (
    <View
      accessible={true}
      accessibilityLabel="Submit form"
      accessibilityHint="Double-tap to submit"
      accessibilityRole="button"
      style={{
        backgroundColor: theme.colors.primary,
        opacity: isAccessible ? 1 : 0.7, // Visual warning if not accessible
      }}
    >
      <Text style={{ color: theme.colors.background }}>
        Submit ({ratio.toFixed(2)}:1)
      </Text>
    </View>
  );
}

// ============================================
// COMMON PATTERNS
// ============================================

/**
 * Pattern 1: Data Loading State Management
 */
interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useData<T>(url: string): DataState<T> {
  const [state, setState] = useState<DataState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ data: null, loading: false, error: error.message }));
  }, [url]);

  return state;
}

/**
 * Pattern 2: Theme-aware Styles
 */
function useThemedStyle(lightStyle: any, darkStyle: any) {
  const { isDark } = useTheme();
  return isDark ? darkStyle : lightStyle;
}

/**
 * Pattern 3: Accessibility Wrapper
 */
function AccessibleText({ children, label }: any) {
  return (
    <Text
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole="text"
    >
      {children}
    </Text>
  );
}

/**
 * Pattern 4: Error Handling with Recovery
 */
function useAsyncOperation<T>(fn: () => Promise<T>) {
  const [state, setState] = useState<DataState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await fn();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: (error as Error).message,
      });
    }
  }, [fn]);

  return { ...state, retry: execute };
}

/**
 * Pattern 5: Dark Mode Toggle
 */
function ThemeToggle() {
  const { isDark, toggleTheme, mode } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? '☀️' : '🌙'} ({mode})
    </button>
  );
}

// ============================================
// TESTING EXAMPLES
// ============================================

/**
 * Test: Contrast Ratio Validation
 */
describe('Accessibility', () => {
  test('colors meet WCAG AA', () => {
    const ratio = getContrastRatio('#007AFF', '#FFFFFF');
    expect(meetsWCAGAA('#007AFF', '#FFFFFF')).toBe(true);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('dark theme colors are accessible', () => {
    const darkTheme = {
      bg: '#1a1a1a',
      text: '#ffffff',
    };
    expect(meetsWCAGAA(darkTheme.bg, darkTheme.text)).toBe(true);
  });
});

/**
 * Test: Theme Provider
 */
describe('ThemeProvider', () => {
  test('provides theme context', () => {
    render(
      <ThemeProvider>
        <div></div>
      </ThemeProvider>
    );
    // Should not throw
  });

  test('persists theme to localStorage', () => {
    const { rerender } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    screen.getByRole('button', { name: /toggle/i }).click();
    expect(localStorage.getItem('theme-mode')).toBe('dark');
  });
});

/**
 * Test: Onboarding Flow
 */
describe('Onboarding', () => {
  test('renders all steps', () => {
    const steps = [
      { id: '1', title: 'Step 1', description: 'Desc 1', icon: '👋' },
      { id: '2', title: 'Step 2', description: 'Desc 2', icon: '🎁' },
    ];

    render(
      <Onboarding
        steps={steps}
        onComplete={jest.fn()}
      />
    );

    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });

  test('calls onComplete when finished', () => {
    const onComplete = jest.fn();
    const steps = [
      { id: '1', title: 'Step 1', description: 'Desc 1', icon: '👋' },
    ];

    const { getByRole } = render(
      <Onboarding steps={steps} onComplete={onComplete} />
    );

    getByRole('button', { name: /get started|finish/i }).click();
    expect(onComplete).toHaveBeenCalled();
  });
});

export default TransactionScreen;
