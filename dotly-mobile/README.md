# Dotly Mobile Apps

Cross-platform React Native apps for iOS and Android. Built with Expo for fast development and deployment.

## Project Structure

```
dotly-mobile/
├── shared/
│   └── core/                    # Shared library (API client, types, utilities)
│       ├── src/
│       │   ├── api.ts           # Axios HTTP client with all endpoints
│       │   ├── storage.ts       # Cross-platform AsyncStorage adapter
│       │   ├── offline.ts       # Offline transaction queue system
│       │   └── index.ts         # TypeScript interface exports
│       ├── package.json
│       └── tsconfig.json
│
├── apps/
│   ├── staff/                   # Staff POS app (100+ LOC)
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   │   ├── LoginScreen.tsx      # Staff authentication
│   │   │   │   ├── POSScreen.tsx        # QR scanning + amount entry
│   │   │   │   └── DashboardScreen.tsx  # Stats and branch info
│   │   │   ├── navigation/
│   │   │   │   └── StaffNavigator.tsx   # Bottom tab navigation
│   │   │   └── contexts/
│   │   │       └── AuthContext.tsx      # Auth state management
│   │   ├── App.tsx
│   │   ├── app.json             # Expo config with camera plugin
│   │   └── package.json
│   │
│   └── customer/                # Customer loyalty app (100+ LOC)
│       ├── src/
│       │   ├── screens/
│       │   │   ├── RegisterScreen.tsx   # Account creation
│       │   │   ├── WalletScreen.tsx     # Dots balance display
│       │   │   └── QRScreen.tsx         # Personal QR code
│       │   ├── navigation/
│       │   │   └── CustomerNavigator.tsx # Bottom tab navigation
│       │   └── contexts/
│       │       └── AuthContext.tsx      # Auth state management
│       ├── App.tsx
│       ├── app.json             # Expo config with barcode scanner plugin
│       └── package.json
│
├── package.json                 # Monorepo workspaces config
└── .gitignore                   # React Native specific ignores
```

## Features

### Staff App (`apps/staff/`)

**Authentication:**
- Phone + password login
- JWT token stored in AsyncStorage
- Auto-login on app launch if token exists

**POS (Point of Sale):**
- QR code scanning (expo-camera)
- Customer phone entry field
- Amount input (Rs)
- **Offline Support:** Transactions queued automatically if no network
- Real-time sync when connection restored

**Dashboard:**
- Branch information display
- Staff role and ID
- Transaction statistics
- Logout functionality

**Offline Features:**
- OfflineQueue stores transactions locally
- Automatic retry when online
- Visual indicator for pending transactions

### Customer App (`apps/customer/`)

**Authentication:**
- Name + Phone registration
- Email (optional)
- Auto-login after registration

**Wallet:**
- Display dots balance
- Account information
- Member since date
- Quick action buttons

**QR Code:**
- Personal QR code display (unique per customer)
- Instruction steps
- Refresh QR functionality

## Setup Instructions

### Prerequisites

```bash
# Install Node.js 16+
# Install Expo CLI globally
npm install -g expo-cli
```

### Installation

```bash
# 1. Clone repository and navigate to mobile folder
cd dotly-mobile

# 2. Install dependencies for all workspaces
npm install

# 3. Build shared library
npm run build:shared

# 4. Start staff app (iOS)
npm run staff:ios

# OR start customer app (iOS)
npm run customer:ios

# OR start on Android
npm run staff:android
npm run customer:android

# OR web development
npm run staff:web
npm run customer:web
```

## Running the Apps

### Development Mode

```bash
# Terminal 1: Start expo server for staff app
cd apps/staff
npm start

# Then press:
# i - for iOS simulator
# a - for Android emulator
# w - for web browser

# Terminal 2: Start expo server for customer app
cd apps/customer
npm start
```

### Building for Production

```bash
# Build Staff App
npm run build:staff:ios
npm run build:staff:android

# Build Customer App
npm run build:customer:ios
npm run build:customer:android

# Requires EAS account setup (free tier available)
# eas login
# eas build --platform ios --release
```

## Shared Library (`@dotly/core`)

### API Client

```typescript
import { apiClient } from '@dotly/core';

// Login
const response = await apiClient.login(phone, password);

// Create visit (staff)
await apiClient.createVisit(phone, amount);

// Get wallet (customer)
const wallet = await apiClient.customerGetWallet();

// Get QR code (customer)
const qr = await apiClient.customerGetQR();
```

### Storage Adapter

```typescript
import { storage, initStorage } from '@dotly/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize with AsyncStorage (React Native)
initStorage(AsyncStorage);

// Use same API on web and mobile
await storage.setItem('key', value, expiresIn);
const data = await storage.getItem('key');
await storage.removeItem('key');
```

### Offline Queue

```typescript
import { offlineQueue } from '@dotly/core';

// Add transaction
const transaction = await offlineQueue.addTransaction('visit', {
  phone: '1234567890',
  amount: 500,
});

// Get pending
const pending = await offlineQueue.getPendingTransactions();

// Mark synced
await offlineQueue.markSynced(transaction.id);
```

## Shared Types

All TypeScript types are exported from `@dotly/core`:

```typescript
import {
  // Auth
  AuthToken,
  LoginResponse,
  LoginRequest,
  
  // Entities
  Branch,
  Customer,
  Deal,
  Reward,
  Visit,
  StaffAssignment,
  
  // Queue
  QueuedTransaction,
} from '@dotly/core';
```

## API Endpoints Implemented

### Auth
- `POST /api/auth/login` - Staff login
- `POST /api/customer-portal/register` - Customer registration

### Staff (POS)
- `POST /api/visits/pcs-purchase` - Create visit/transaction
- `GET /api/staff/{staffId}/branch` - Get staff's branch

### Customer
- `GET /api/customer-portal/wallet` - Get wallet info
- `GET /api/customer-portal/my-qr` - Get personal QR code
- `GET /api/customer-portal/available-deals` - Browse deals
- `GET /api/customer-portal/my-shops` - View favorite shops

## Configuration

### Environment Variables

Create `.env` files in each app directory:

**`apps/staff/.env`**
```
EXPO_PUBLIC_API_URL=http://localhost:5082
EXPO_PUBLIC_APP_NAME=Dotly Staff
```

**`apps/customer/.env`**
```
EXPO_PUBLIC_API_URL=http://localhost:5082
EXPO_PUBLIC_APP_NAME=Dotly Customer
```

### API URL Configuration

In production, update the API URL in shared library:

```typescript
// shared/core/src/api.ts
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://api.dotly.com';
```

## Authentication Flow

### Staff App
```
Phone Input → Password Input → Login Request
    ↓
API validates credentials
    ↓
Returns JWT token + userId + role
    ↓
Store in AsyncStorage
    ↓
Add Authorization header to all requests
    ↓
Auto-login on app restart
```

### Customer App
```
Name + Phone Registration
    ↓
API creates customer account
    ↓
Optionally returns JWT token
    ↓
Store in AsyncStorage
    ↓
Navigate to Wallet (auto-login)
```

## Offline Support

The staff app has built-in offline transaction support:

1. **Detection:** Try API call, catch network error
2. **Queue:** Add transaction to OfflineQueue
3. **Storage:** Persist to AsyncStorage
4. **Display:** Show "pending offline" indicator
5. **Sync:** Retry when connection restored

This ensures no transaction data is lost and staff can continue working offline.

## Development Workflow

### Creating a New Screen

1. Create screen component in `screens/`
2. Add to navigation in `navigation/`
3. Import necessary hooks (`useAuth`)
4. Use shared types from `@dotly/core`

Example:
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { apiClient, Deal } from '@dotly/core';
import { useAuth } from '../contexts/AuthContext';

export function DealsScreen() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      const items = await apiClient.customerGetAvailableDeals();
      setDeals(items);
    } catch (error) {
      console.error('Failed to load deals:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen JSX */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

### Adding New API Endpoints

1. Add method to `DotlyApiClient` in `shared/core/src/api.ts`
2. Define request/response types
3. Use in components via `apiClient.methodName()`

Example:
```typescript
// In shared/core/src/api.ts
async getShopDetails(shopId: string): Promise<Shop> {
  const response = await this.api.get(`/api/shops/${shopId}`);
  return response.data;
}

// In component
const shop = await apiClient.getShopDetails(shopId);
```

## Testing

### Unit Tests

```bash
# Run Jest tests
npm test

# Watch mode
npm test -- --watch
```

### Device Testing

**iOS:**
```bash
# Requires Mac with Xcode
npm run staff:ios
# Choose simulator or device
```

**Android:**
```bash
# Requires Android emulator running
npm run staff:android
```

## Debugging

### React Native Debugger

```bash
# Install React Native Debugger
# brew install react-native-debugger

# Enable in app development menu
# Shake device (iOS) or press R twice (Android)
# Select "Debug Remote JS"
```

### Expo Inspector

During development, press:
- `i` - Open Inspector
- `d` - Open Developer Menu
- `o` - Open on iOS
- `a` - Open on Android

## Deployment

### Pre-deployment Checklist

- [ ] Update version in `app.json`
- [ ] Update API URL for production
- [ ] Remove console.log statements
- [ ] Test offline functionality
- [ ] Test on real device
- [ ] Update app icons and splash screens

### App Store Submission

**iOS (App Store):**
```bash
cd apps/staff
eas build --platform ios --release
eas submit --platform ios
```

**Android (Google Play):**
```bash
cd apps/staff
eas build --platform android --release
eas submit --platform android
```

## Future Enhancements

- [ ] **Push Notifications** - Real-time deal and achievement alerts
- [ ] **Biometric Auth** - Face ID / Touch ID login
- [ ] **QR Code Generation** - Generate QR codes with react-native-qrcode-svg
- [ ] **Rewards Redemption** - In-app redemption UI
- [ ] **Leaderboard** - Real-time customer rankings
- [ ] **Shop Locator** - Map view with nearby shops
- [ ] **Transaction History** - Detailed transaction logs
- [ ] **Analytics** - Staff performance metrics
- [ ] **Dark Mode** - System theme support
- [ ] **Multi-language** - i18n support

## Troubleshooting

### Common Issues

**"Cannot find module '@dotly/core'"**
```bash
# Rebuild shared library
cd shared/core
npm run build
cd ../..
npm install
```

**Metro bundler errors**
```bash
# Clear cache and restart
watchman watch-del-all
npm start -- --reset-cache
```

**Camera permission denied**
- Check `app.json` plugins configuration
- iOS: Ensure NSCameraUsageDescription in Info.plist
- Android: Ensure camera permission in AndroidManifest.xml

**AsyncStorage not working**
```bash
# Install package in the specific app
cd apps/staff
npm install @react-native-async-storage/async-storage
```

## Performance Tips

1. **Images:** Use expo-image for better caching
2. **Lists:** Implement FlatList with initialNumToRender
3. **Navigation:** Use useFocusEffect for screen-specific logic
4. **API:** Implement request debouncing for searches
5. **Storage:** Clear old data periodically

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review Expo documentation: https://docs.expo.dev
3. Check React Native docs: https://reactnative.dev

## License

Proprietary - Dotly Loyalty Platform
