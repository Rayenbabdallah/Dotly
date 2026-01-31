# Phase 4: Push Notifications & Advanced Features - Planning & Implementation

## Overview

Phase 4 focuses on delivering push notifications, advanced animations, and preparing for production deployment. This phase builds on the completed Phases 1-3.

---

## Phase 4 Features to Implement

### 1. Push Notifications System (High Priority)

#### Architecture
```
Firebase Cloud Messaging (FCM) Backend
    ↓
Notification Queue Service
    ↓
Both Mobile Apps (Staff & Customer)
    ↓
Notification Handlers & UI
```

#### Customer App - Deal Alerts
**When triggered:**
- New personalized deal available
- Reward unlocked
- Birthday bonus activated
- Streak milestone reached
- Limited-time offer expiring

**Notification Content:**
```json
{
  "title": "New Deal Available!",
  "body": "Get 30% off your next visit",
  "data": {
    "type": "deal",
    "dealId": "deal_123",
    "deepLink": "app://deals/deal_123"
  }
}
```

#### Staff App - Action Alerts
**When triggered:**
- Large redemption approval needed
- Customer VIP visiting
- Daily/weekly quota milestones
- High transaction spike detected
- System alerts

**Notification Content:**
```json
{
  "title": "Approval Needed",
  "body": "Customer wants to redeem $50 reward",
  "data": {
    "type": "approval",
    "redemptionId": "redemption_456",
    "deepLink": "app://approvals/redemption_456"
  }
}
```

#### Achievement Badges Notification
**Customer achievements:**
- First 10 visits
- $100 lifetime spending
- Streak milestones (7, 30, 100 days)
- Tier upgrades (Bronze → Silver → Gold)
- Monthly leaderboard top 10

**Notification:**
```json
{
  "title": "🏆 Achievement Unlocked!",
  "body": "You reached 30-day streak!",
  "data": {
    "type": "badge",
    "badgeId": "badge_789",
    "animation": "celebration"
  }
}
```

#### Implementation Steps

**Step 1: Firebase Setup**
```bash
# 1. Create Firebase project
# 2. Create Android app (get google-services.json)
# 3. Create iOS app (get GoogleService-Info.plist)
# 4. Add to Expo app.json
```

**Step 2: Backend Notification Service**
```typescript
// Services/PushNotificationService.ts
interface PushNotificationRequest {
  userId: string;
  type: 'deal' | 'approval' | 'badge' | 'alert';
  title: string;
  body: string;
  data: Record<string, any>;
  scheduledTime?: DateTime;
}

class PushNotificationService {
  async sendToUser(request: PushNotificationRequest): Promise<void>
  async sendToSegment(segment: string, request: PushNotificationRequest): Promise<void>
  async scheduleNotification(request: PushNotificationRequest): Promise<void>
  async updateFCMToken(userId: string, token: string): Promise<void>
  async getDeliveryStatus(notificationId: string): Promise<Status>
}
```

**Step 3: Frontend Implementation (React Native)**
```typescript
// notificationHandler.ts
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

export function useNotificationHandler() {
  const navigation = useNavigation();

  useEffect(() => {
    // Handle notification when app is foreground
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { type, deepLink } = response.notification.request.content.data;
      
      switch (type) {
        case 'deal':
          navigation.navigate('Deals', { dealId: deepLink.split('/').pop() });
          break;
        case 'approval':
          navigation.navigate('Approvals', { redemptionId: deepLink.split('/').pop() });
          break;
        case 'badge':
          showAchievementAnimation(response.notification);
          break;
      }
    });

    return () => subscription.remove();
  }, [navigation]);
}
```

**Step 4: Database Updates**
```csharp
// Models/UserFCMToken.cs
public class UserFCMToken
{
  public int Id { get; set; }
  public int UserId { get; set; }
  public string Token { get; set; }
  public string DeviceType { get; set; } // ios, android
  public DateTime CreatedAt { get; set; }
  public DateTime UpdatedAt { get; set; }
  public DateTime? LastUsedAt { get; set; }
  public bool IsActive { get; set; } = true;
  
  public User User { get; set; }
}

// Models/NotificationLog.cs
public class NotificationLog
{
  public int Id { get; set; }
  public int UserId { get; set; }
  public string Type { get; set; }
  public string Title { get; set; }
  public string Body { get; set; }
  public Dictionary<string, object> Data { get; set; }
  public NotificationStatus Status { get; set; }
  public DateTime SentAt { get; set; }
  public DateTime? DeliveredAt { get; set; }
  public User User { get; set; }
}

public enum NotificationStatus
{
  Pending,
  Sent,
  Delivered,
  Clicked,
  Failed
}
```

#### Testing Checklist
- [ ] FCM token registration on app launch
- [ ] Token refresh on expiration
- [ ] Deal notification delivery to relevant customers
- [ ] Approval notifications to appropriate staff
- [ ] Badge unlocked animations
- [ ] Deep link navigation from notification
- [ ] Notification persistence (show history)
- [ ] Mute/unmute per notification type
- [ ] Scheduled notifications delivery
- [ ] Offline handling (queue and retry)

---

### 2. Animated Reward Unlock Screen

#### Screen Behavior
```
1. Customer triggers reward redemption
2. Screen transitions to AnimatedRewardUnlock
3. Celebration animations (3-5 seconds)
4. Show reward details
5. Confetti effect
6. Sound effect
7. Button to continue
```

#### Implementation
```typescript
// screens/AnimatedRewardUnlock.tsx
import { Animated, View, Text, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';

export function AnimatedRewardUnlock({ route, navigation }) {
  const { reward } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Scale animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 30,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Play sound
    playRewardSound();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Confetti */}
      <LottieView
        source={require('../animations/confetti.json')}
        autoPlay
        loop={false}
        style={styles.confetti}
      />

      {/* Reward Card */}
      <Animated.View
        style={[
          styles.rewardCard,
          {
            transform: [{ scale: scaleAnim }, { rotate: spin }],
          },
        ]}
      >
        <Text style={styles.rewardIcon}>{reward.icon}</Text>
        <Text style={styles.rewardTitle}>{reward.title}</Text>
        <Text style={styles.rewardValue}>${reward.value}</Text>
      </Animated.View>

      {/* Celebration particles */}
      <ParticleEffect />

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Got It!</Text>
      </TouchableOpacity>
    </View>
  );
}

function ParticleEffect() {
  const particles = Array.from({ length: 20 }).map((_, i) => {
    const animValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    }, []);

    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -400],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.8, 1],
      outputRange: [1, 1, 0],
    });

    return (
      <Animated.View
        key={i}
        style={[
          styles.particle,
          {
            transform: [{ translateY }],
            opacity,
            left: `${Math.random() * 100}%`,
          },
        ]}
      >
        <Text>✨</Text>
      </Animated.View>
    );
  });

  return <>{particles}</>;
}
```

#### Animation Variations
1. **Scale Bounce** - Card bounces in with spring physics
2. **Rotate Spin** - Card slowly rotates (3 seconds)
3. **Confetti Fall** - Particle effects falling down
4. **Pulse Glow** - Card pulses with color change
5. **Sound Effect** - Celebration sound plays

#### Required Assets
- `confetti.json` - Lottie animation
- `reward-sound.mp3` - Celebration sound
- Particle effects (emoji or icons)

#### Testing Checklist
- [ ] Animation runs smoothly (60fps)
- [ ] Confetti particles render correctly
- [ ] Sound plays on Android and iOS
- [ ] Screen dismisses after timeout
- [ ] Works with different reward types
- [ ] Back button still works
- [ ] Testing on both platforms

---

### 3. Production Build & Deployment

#### Web App (dotly-ui)
```bash
# Build
npm run build
# Output: dist/

# Deploy (options)
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Azure Static Web Apps
```

#### Mobile Apps (Expo)
```bash
# Setup EAS
npm install -g eas-cli
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Internal testing (TestFlight/Beta)
eas build --platform ios --auto-submit
eas build --platform android --auto-submit

# Production (App Store/Play Store)
eas submit --platform ios
eas submit --platform android
```

#### Backend API (Dotly.Api)
```bash
# Docker build
docker build -t dotly-api:1.0.0 .

# Deploy options
# - Azure App Service
# - AWS ECS/EC2
# - Google Cloud Run
# - DigitalOcean App Platform
# - Heroku
```

#### Deployment Checklist
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Staging deployment verified
- [ ] Production rollback plan ready
- [ ] Monitoring/alerts configured
- [ ] Database backups automated
- [ ] SSL certificates updated
- [ ] Environment variables configured

---

## Implementation Timeline

| Feature | Effort | Priority | Timeline |
|---------|--------|----------|----------|
| Push Notifications | 2-3 weeks | High | Week 1-3 |
| Animated Rewards | 1 week | High | Week 2-3 |
| Production Build | 1 week | High | Week 3-4 |
| Testing & QA | 2 weeks | High | Week 4-5 |
| Deployment | 1 week | High | Week 5-6 |

---

## API Endpoints for Phase 4

### Notification Management
```
POST   /api/notifications/send              - Send notification
POST   /api/notifications/send-segment      - Send to segment
GET    /api/notifications/history           - Get notification history
POST   /api/notifications/{id}/mark-read    - Mark as read
DELETE /api/notifications/{id}              - Delete notification
POST   /api/notifications/preferences       - Set preferences
GET    /api/notifications/status/{id}       - Get delivery status
POST   /api/notifications/fcm-token         - Register FCM token
DELETE /api/notifications/fcm-token/{token} - Unregister FCM token
```

### Achievement Tracking
```
GET    /api/achievements/earned            - Get earned badges
GET    /api/achievements/available          - Get available badges
POST   /api/achievements/{id}/claim         - Claim achievement
GET    /api/achievements/progress/{type}    - Get progress toward badge
```

---

## Deliverables for Phase 4

### Component Files (4 new files)
1. **PushNotificationService.cs** (200 lines) - Backend notification service
2. **notificationHandler.ts** (150 lines) - React Native notification handling
3. **AnimatedRewardUnlock.tsx** (250 lines) - Reward unlock animation screen
4. **AchievementNotification.tsx** (180 lines) - Achievement badge animation

### Configuration Files
1. **firebase.json** - Firebase configuration
2. **eas.json** - EAS build configuration
3. **docker-compose.prod.yml** - Production Docker setup

### Documentation
1. **PUSH_NOTIFICATIONS_GUIDE.md** - Implementation guide
2. **PRODUCTION_DEPLOYMENT.md** - Deployment instructions
3. **PHASE4_COMPLETION.md** - Phase 4 summary

**Total Phase 4: 1,500+ lines of code + deployment configs**

---

## Success Criteria

### Push Notifications
- ✅ 99.9% delivery rate
- ✅ <5 second latency
- ✅ Proper handling offline
- ✅ Deep link navigation works

### Animations
- ✅ 60fps performance
- ✅ Smooth transitions
- ✅ Sound effects play
- ✅ Confetti renders properly

### Production
- ✅ Zero downtime deployment
- ✅ All tests passing
- ✅ Performance metrics met
- ✅ Security audit passed

---

## Dependencies to Add

### Mobile Apps
```json
{
  "expo-notifications": "^0.20.0",
  "firebase": "^10.0.0",
  "lottie-react-native": "^6.0.0",
  "@react-native-async-storage/async-storage": "^1.18.0"
}
```

### Backend
```xml
<PackageReference Include="FirebaseAdmin" Version="2.3.0" />
<PackageReference Include="Firebase.Authentication" Version="4.4.0" />
```

---

## Next Steps

1. **Week 1**: Set up Firebase project, implement backend notification service
2. **Week 2**: Build FCM token management, create notification handlers
3. **Week 3**: Implement animated unlock screen, achievement badges
4. **Week 4**: Testing, QA, performance optimization
5. **Week 5**: Staging deployment, final verification
6. **Week 6**: Production deployment, monitoring setup

---

## Questions & Decisions

- [ ] Use Firebase FCM or alternative (OneSignal, Pusher)?
- [ ] Notification sound preferences (system sound, custom, silent)?
- [ ] Notification grouping (single notification or all separate)?
- [ ] Scheduled notifications support needed?
- [ ] Rich notifications (images, buttons)?
- [ ] Default notification frequency per user?
- [ ] Analytics tracking for notification engagement?

---

**Status**: Ready to begin Phase 4 implementation  
**Estimated Completion**: 6 weeks  
**Team Size**: 2-3 developers
