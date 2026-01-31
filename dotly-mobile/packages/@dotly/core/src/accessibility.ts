/**
 * Accessibility Utilities - WCAG 2.1 AA Compliance Helpers
 */

/**
 * Contrast Ratio Calculator
 * Calculates the contrast ratio between two colors
 * Meets WCAG 2.1 AA: 4.5:1 for normal text, 3:1 for large text
 * Meets WCAG 2.1 AAA: 7:1 for normal text, 4.5:1 for large text
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const { r, g, b } = rgb;

  // Convert to sRGB
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const sRgb = val / 255;
    return sRgb <= 0.03928 ? sRgb / 12.92 : Math.pow((sRgb + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Check if contrast ratio meets WCAG 2.1 AA standard
 * Returns true if ratio >= 4.5:1 (normal text) or >= 3:1 (large text)
 */
export function meetsWCAGAA(color1: string, color2: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG 2.1 AAA standard
 * Returns true if ratio >= 7:1 (normal text) or >= 4.5:1 (large text)
 */
export function meetsWCAGAAA(color1: string, color2: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Accessibility Labels for Screen Readers
 */
export const a11yLabels = {
  // Navigation
  navigateBack: 'Navigate back',
  navigateHome: 'Go to home',
  openMenu: 'Open navigation menu',
  closeMenu: 'Close navigation menu',

  // Common Actions
  loading: 'Loading content, please wait',
  error: 'An error occurred. Please try again.',
  success: 'Operation completed successfully',
  delete: 'Delete item',
  edit: 'Edit item',
  save: 'Save changes',
  cancel: 'Cancel',
  refresh: 'Refresh content',

  // Customer Actions
  redeemReward: 'Redeem this reward',
  applyDeal: 'Apply this deal',
  viewMore: 'View more details',
  expandSection: 'Expand section',
  collapseSection: 'Collapse section',

  // Form
  required: 'This field is required',
  invalid: 'This field contains invalid information',
  success: 'This field is valid',
  clearField: 'Clear field',
};

/**
 * Semantic HTML5 Role Mappings
 */
export const a11yRoles = {
  button: 'button',
  link: 'link',
  heading: 'heading',
  main: 'main',
  navigation: 'navigation',
  article: 'article',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  form: 'form',
  search: 'search',
  tab: 'tab',
  tablist: 'tablist',
  tabpanel: 'tabpanel',
  alert: 'alert',
  alertdialog: 'alertdialog',
  dialog: 'dialog',
};

/**
 * Focus Management Utilities
 */
export class FocusManager {
  private focusStack: HTMLElement[] = [];

  /**
   * Trap focus within an element (modal, dialog)
   */
  static trapFocus(element: HTMLElement, restoreFocus: HTMLElement | null = null) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    element.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    });

    if (restoreFocus) {
      element.addEventListener('blur', () => {
        restoreFocus.focus();
      });
    }

    firstElement.focus();
  }

  /**
   * Announce a message to screen readers
   */
  static announce(message: string, type: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', type);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only'; // Visually hidden
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }
}

/**
 * Keyboard Navigation Utilities
 */
export const keyboardKeys = {
  enter: 'Enter',
  space: ' ',
  escape: 'Escape',
  tab: 'Tab',
  arrowUp: 'ArrowUp',
  arrowDown: 'ArrowDown',
  arrowLeft: 'ArrowLeft',
  arrowRight: 'ArrowRight',
  home: 'Home',
  end: 'End',
};

/**
 * Handle arrow key navigation in lists
 */
export function createArrowKeyNavigationHandler(
  items: HTMLElement[],
  onSelect?: (item: HTMLElement, index: number) => void
) {
  let currentIndex = 0;

  return (event: KeyboardEvent) => {
    const { key } = event;

    if (key === keyboardKeys.arrowDown) {
      currentIndex = Math.min(currentIndex + 1, items.length - 1);
      event.preventDefault();
    } else if (key === keyboardKeys.arrowUp) {
      currentIndex = Math.max(currentIndex - 1, 0);
      event.preventDefault();
    } else if (key === keyboardKeys.home) {
      currentIndex = 0;
      event.preventDefault();
    } else if (key === keyboardKeys.end) {
      currentIndex = items.length - 1;
      event.preventDefault();
    } else if (key === keyboardKeys.enter || key === keyboardKeys.space) {
      event.preventDefault();
      if (onSelect) {
        onSelect(items[currentIndex], currentIndex);
      }
      return;
    } else {
      return;
    }

    items[currentIndex].focus();
  };
}

/**
 * ARIA Attributes Helper
 */
export const ariaAttributes = {
  /**
   * Indicate that element is loading
   */
  loading: {
    'aria-busy': 'true',
    'aria-label': 'Loading',
  },

  /**
   * Indicate that element is disabled
   */
  disabled: {
    'aria-disabled': 'true',
  },

  /**
   * Indicate button that opens a menu
   */
  menuButton: (isOpen: boolean) => ({
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen.toString(),
  }),

  /**
   * Indicate expandable section
   */
  expandable: (isExpanded: boolean) => ({
    'aria-expanded': isExpanded.toString(),
  }),

  /**
   * Indicate current page in pagination
   */
  currentPage: (pageNumber: number) => ({
    'aria-label': `Page ${pageNumber}`,
    'aria-current': 'page',
  }),
};

/**
 * Text Sizing Guide for Accessibility
 * - Normal text: min 14px
 * - Large text: min 18px
 * - Large text with bold: min 14px
 */
export const accessibleTextSizes = {
  xs: { size: 10, bold: false, minContrast: 'Should avoid' },
  sm: { size: 12, bold: false, minContrast: 'Should avoid' },
  base: { size: 14, bold: true, minContrast: '4.5:1 (AA)' },
  lg: { size: 18, bold: false, minContrast: '3:1 (AA)' },
  xl: { size: 20, bold: false, minContrast: '3:1 (AA)' },
  '2xl': { size: 24, bold: false, minContrast: '3:1 (AA)' },
};

/**
 * Skip Link Component Helper
 * Allows users to skip to main content using keyboard
 */
export function createSkipLink(targetId: string, label: string = 'Skip to main content') {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.textContent = label;
  link.className = 'skip-link';
  link.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    z-index: 100;
  `;

  // Show on focus
  link.addEventListener('focus', () => {
    link.style.top = '0';
  });

  // Hide on blur
  link.addEventListener('blur', () => {
    link.style.top = '-40px';
  });

  return link;
}
