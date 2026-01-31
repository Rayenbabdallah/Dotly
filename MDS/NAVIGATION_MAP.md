# 🗺️ Navigation Map - Advanced Deal Templates

## Frontend Routes

### Main Dashboard
```
/manager/dashboard
├── Sidebar: "Advanced Deal Manager"
└── Route: /manager/deals → ManagerDealDashboard.tsx
```

### Deal Management Interface
```
/manager/deals
├── Tab: Streak Deals
├── Tab: Tier Deals  
├── Tab: Comeback Deals
├── Tab: Lottery Deals
├── Tab: Birthday Deals
└── Tab: Time Deals
```

### Deal Builder (Modal)
```
/manager/deals → "Create New Deal" button
├── Type: Streak Deal
│   ├── Name
│   ├── Min Consecutive Days
│   ├── Dots Bonus
│   ├── Start/End Date
│   └── Active Toggle
├── Type: Tier Deal
│   ├── Name
│   ├── Required Tier (Bronze/Silver/Gold)
│   ├── Dots Bonus
│   ├── Dots Multiplier
│   └── Active Toggle
├── Type: Comeback Deal
│   ├── Name
│   ├── Inactivity Threshold (days)
│   ├── Dots Bonus
│   └── Active Toggle
├── Type: Lottery Deal
│   ├── Name
│   ├── Win Probability (0.01-1.0)
│   ├── Prize Range (Min-Max)
│   ├── Start/End Date
│   └── Active Toggle
├── Type: Birthday Deal
│   ├── Name
│   ├── Birthday Bonus Dots
│   ├── Days Around Birthday
│   └── Active Toggle
└── Type: Time Deal
    ├── Name
    ├── Days of Week
    ├── Hour Range
    ├── Bonus Dots
    ├── Dots Multiplier
    └── Active Toggle
```

---

## Backend API Routes

### Base Path
```
https://api.dotly.local/api/advanceddeal
```

### Streak Deals
```
GET    /streak-deals
POST   /streak-deals
PUT    /streak-deals/{id}
DELETE /streak-deals/{id}
```

### Tier Deals
```
GET    /tier-deals
POST   /tier-deals
PUT    /tier-deals/{id}
DELETE /tier-deals/{id}
```

### Comeback Deals
```
GET    /comeback-deals
POST   /comeback-deals
PUT    /comeback-deals/{id}
DELETE /comeback-deals/{id}
```

### Lottery Deals
```
GET    /lottery-deals
POST   /lottery-deals
PUT    /lottery-deals/{id}
DELETE /lottery-deals/{id}
```

### Birthday Deals
```
GET    /birthday-deals
POST   /birthday-deals
PUT    /birthday-deals/{id}
DELETE /birthday-deals/{id}
```

### Time Deals
```
GET    /time-deals
POST   /time-deals
PUT    /time-deals/{id}
DELETE /time-deals/{id}
```

### Utilities
```
GET    /customer-tier/{customerId}
GET    /applicable/{customerId}
GET    /inactive-customers?inactiveDays=30
```

---

## File Structure Navigation

### Backend (C#)
```
Dotly.Api/
│
├── Domain/Entities/
│   ├── CustomerTier.cs
│   └── AdvancedDealTemplate.cs (contains 7 deal template classes)
│
├── Services/
│   ├── TierService.cs
│   ├── ComebackService.cs
│   └── DealService.cs (extended with 7 new methods)
│
├── Controllers/
│   ├── AdvancedDealController.cs (24 endpoints)
│   └── VisitController.cs (modified: tier + deal integration)
│
├── Data/
│   └── ApplicationDbContext.cs (modified: +8 DbSets)
│
├── Migrations/
│   └── 20260130232801_AddAdvancedDealTemplates.cs
│
└── Program.cs (modified: +2 service registrations)
```

### Frontend (React/TypeScript)
```
dotly-ui/src/
│
├── pages/
│   └── ManagerDealDashboard.tsx (main interface)
│
├── components/
│   ├── AdvancedDealBuilder.tsx (modal form)
│   │
│   └── DealCards/
│       ├── StreakDealCard.tsx
│       ├── TierDealCard.tsx
│       ├── ComebackDealCard.tsx
│       ├── LotteryDealCard.tsx
│       ├── BirthdayDealCard.tsx
│       └── TimeDealCard.tsx
│
└── lib/
    └── api.ts (modified: +22 functions)
```

---

## Data Flow Diagram

### Transaction Processing
```
1. Customer Scan (QR or Phone)
   ↓ VisitController.RecordPurchaseByQR()
   
2. Validate Customer & Staff
   ↓
   
3. Apply Base Deals
   ↓ DealService.ApplyDeals()
   
4. Evaluate Advanced Deals [NEW]
   ↓ DealService.EvaluateAllAdvancedDealsAsync()
   ├─→ EvaluateStreakDealAsync()
   ├─→ EvaluateTierDealAsync()
   ├─→ EvaluateComebackDealAsync()
   ├─→ EvaluateLotteryDealAsync()
   ├─→ EvaluateBirthdayDealAsync()
   └─→ EvaluateTimeDealAsync()
   
5. Calculate Tier [NEW]
   ↓ TierService.CalculateAndUpdateTierAsync()
   
6. Log Changes
   ↓ AuditService.LogUpdateAsync()
   
7. Create Visit Record
   ↓ _context.Visits.Add()
   
8. Return Result
   ↓
   Customer receives: Dots + Bonuses + Tier Update
```

### Manager Creating a Deal
```
1. Visit ManagerDealDashboard
   ↓ /manager/deals
   
2. Click "+ New Deal"
   ↓
   
3. Open AdvancedDealBuilder Modal
   ↓
   
4. Select Deal Type (Dropdown)
   ↓
   
5. Fill Type-Specific Form
   ├─ Streak: min days, bonus, dates
   ├─ Tier: tier level, bonus, multiplier
   ├─ Comeback: inactivity days, bonus
   ├─ Lottery: win %, prize range, dates
   ├─ Birthday: bonus dots, window days
   └─ Time: days, hours, bonus, multiplier
   ↓
   
6. Click "Create Deal"
   ↓ api.createXxxDeal(formData)
   
7. Backend Validation
   ↓ AdvancedDealController.CreateXxxDeal()
   
8. Save to Database
   ↓ _context.XxxDealTemplates.Add()
   
9. Return Success & Reload List
   ↓ loadAllDeals()
   
10. UI Updates Statistics
    ↓ ManagerDealDashboard.tsx
    
Deal is now active and applies to customers!
```

---

## Key Integration Points

### VisitController (Lines Added)

**RecordPurchaseByQR()**
```csharp
Line 150: Evaluate all advanced deals
Line 155: Add advanced deal bonus to result
Line 158: Calculate and update tier
Line 168: Log tier change
```

**CreateVisit()**
```csharp
Line 326: Evaluate all advanced deals
Line 331: Add advanced deal bonus to result
Line 334: Calculate and update tier
Line 344: Log tier change
```

### DealService (New Methods)

```csharp
Line 543: EvaluateStreakDealAsync()
Line 560: EvaluateTierDealAsync()
Line 580: EvaluateComebackDealAsync()
Line 605: EvaluateLotteryDealAsync()
Line 620: EvaluateBirthdayDealAsync()
Line 645: EvaluateTimeDealAsync()
Line 686: EvaluateAllAdvancedDealsAsync()
```

### ApplicationDbContext (New DbSets)

```csharp
Line X: public DbSet<CustomerTier> CustomerTiers { get; set; }
Line X: public DbSet<StreakDealTemplate> StreakDealTemplates { get; set; }
Line X: public DbSet<TierDealTemplate> TierDealTemplates { get; set; }
Line X: public DbSet<ComebackDealTemplate> ComebackDealTemplates { get; set; }
Line X: public DbSet<LotteryDealTemplate> LotteryDealTemplates { get; set; }
Line X: public DbSet<BirthdayDealTemplate> BirthdayDealTemplates { get; set; }
Line X: public DbSet<TimeDealTemplate> TimeDealTemplates { get; set; }
Line X: public DbSet<RedeemableAdvancedDeal> RedeemableAdvancedDeals { get; set; }
```

### Program.cs (Service Registration)

```csharp
builder.Services.AddScoped<TierService>();
builder.Services.AddScoped<ComebackService>();
```

---

## Configuration Files Modified

### None - All changes are additive!
```
✅ No breaking changes
✅ All existing functionality preserved
✅ Backward compatible
✅ Can be deployed without downtime
```

---

## Testing Navigation

### Unit Test Locations
```
Dotly.Tests/
├── Services/
│   ├── TierServiceTests.cs (recommended to create)
│   └── ComebackServiceTests.cs (recommended to create)
└── Controllers/
    └── AdvancedDealControllerTests.cs (recommended to create)
```

### Integration Test Flow
```
1. Start API server
2. Create test tenant
3. Create test customer
4. Create multiple deal types
5. Simulate visit with all conditions met
6. Verify all bonuses applied
7. Verify tier updated
8. Verify AuditLog entries created
```

### Frontend E2E Test Flow
```
1. Login as manager
2. Navigate to /manager/deals
3. Test each deal type creation
4. Test edit functionality
5. Test delete with confirmation
6. Test statistics update
7. Verify API calls in network tab
```

---

## Performance Monitoring

### Metrics to Track
```
/api/advanceddeal/* endpoints
├── Response Time (target: <100ms)
├── Error Rate (target: <0.1%)
├── P95 Latency (target: <200ms)
└── P99 Latency (target: <500ms)

VisitController integration
├── Total Visit Time (target: <500ms)
├── Deal Evaluation Time (target: <50ms)
├── Tier Calculation Time (target: <20ms)
└── Database Query Time (target: <50ms)
```

### Database Monitoring
```
8 new tables to monitor:
├── CustomerTiers (index: CustomerId, TenantId)
├── StreakDealTemplates (index: TenantId)
├── TierDealTemplates (index: TenantId)
├── ComebackDealTemplates (index: TenantId)
├── LotteryDealTemplates (index: TenantId)
├── BirthdayDealTemplates (index: TenantId)
├── TimeDealTemplates (index: TenantId)
└── RedeemableAdvancedDeals (index: CustomerId, TenantId)
```

---

## Troubleshooting Navigation

### Issue: Deal not appearing in list
- Check: `/api/advanceddeal/[type]-deals` endpoint
- Verify: `isActive` property is true
- Verify: Date range is current

### Issue: Tier not updating
- Check: VisitController logs
- Check: AuditLog for "Tier updated" entries
- Verify: TierService method is being called

### Issue: Frontend component not rendering
- Check: Browser console for errors
- Verify: All 6 DealCard components imported
- Verify: AdvancedDealBuilder modal is visible

### Issue: API authentication fails
- Check: Bearer token in Authorization header
- Verify: Token not expired
- Check: User has manager role

---

## Quick Access Links

### Development
```
Backend API Base:        http://localhost:5082/api/advanceddeal
API Swagger Docs:        http://localhost:5082/swagger/index.html
Frontend Dev Server:     http://localhost:5173
React Dev Tools:         F12 → Components tab
```

### Production (Example)
```
Backend API Base:        https://api.dotly.com/api/advanceddeal
Frontend App:            https://app.dotly.com/manager/deals
Monitoring Dashboard:    https://metrics.dotly.com
```

### Documentation
```
Technical Summary:       ./ADVANCED_DEALS_SUMMARY.md
Quick Reference:         ./ADVANCED_DEALS_QUICK_REFERENCE.md
This Navigation Guide:   ./NAVIGATION_MAP.md
Main README:             ./README_ADVANCED_DEALS.md
```

---

**Navigation Complete!** You now have a complete roadmap of the Advanced Deal Templates system. 🗺️✨
