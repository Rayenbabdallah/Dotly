# Advanced Deal Templates - Quick Reference Guide

## 🚀 How to Use

### For Store Managers

1. **Navigate to Deal Dashboard**
   - Go to Manager Dashboard → Advanced Deal Manager
   - Or directly visit: `/manager/deals`

2. **Create a New Deal**
   - Click "+ New Deal" button
   - Select deal type (Streak, Tier, Comeback, Lottery, Birthday, Time)
   - Fill in type-specific fields
   - Set activation status and save

3. **View Deal Statistics**
   - Each deal type card shows: Total deals | Active deals
   - Click card to filter and view all deals of that type

4. **Edit/Delete Deals**
   - Click "Edit" to modify existing deal
   - Click "Delete" to remove (requires confirmation)
   - Changes apply immediately

---

## 🎯 Deal Type Quick Guide

### Streak Deal
**Purpose**: Encourage daily visits
```
Minimum 3 consecutive days → +50 dots bonus
```
- Best for: Monday-Friday lunch rush scenarios
- Settings: Min days, bonus dots, date range
- Audit: Automatically calculates consecutive visits

### Tier Deal
**Purpose**: Reward VIP customers
```
Gold tier (2000+ lifetime spend) → +20 dots + ×1.5 multiplier
```
- Best for: Lifetime value recognition
- Settings: Tier (Bronze/Silver/Gold), bonus, multiplier
- Auto-updates: Tier recalculated on every transaction

### Comeback Deal
**Purpose**: Win back inactive customers
```
30+ days inactive → +100 dots (one-time only)
```
- Best for: Customer retention campaigns
- Settings: Inactivity threshold, bonus amount
- Safety: Redeemable only once per customer

### Lottery Deal
**Purpose**: Create excitement, drive engagement
```
25% chance to win 50-200 dots randomly
```
- Best for: Marketing campaigns, viral moments
- Settings: Win probability, prize range, date range
- Random: Uses cryptographic randomization

### Birthday Deal
**Purpose**: Personal customer recognition
```
Birthday month (±3 days) → +150 dots
```
- Best for: Customer loyalty, personal touch
- Settings: Bonus amount, eligibility window
- Auto-applied: Checks birthday date automatically

### Time Deal
**Purpose**: Peak hour promotions (Happy Hour)
```
Fri 11:00-14:00 → +25 dots + ×1.2 multiplier
```
- Best for: Traffic shaping, off-peak promotions
- Settings: Days of week, hour range, bonus/multiplier
- Flexible: Any combination of days/hours

---

## 📊 API Endpoints Reference

### Streak Deals
```
GET    /api/advanceddeal/streak-deals           # List
POST   /api/advanceddeal/streak-deals           # Create
PUT    /api/advanceddeal/streak-deals/{id}      # Update
DELETE /api/advanceddeal/streak-deals/{id}      # Delete
```

### Tier Deals
```
GET    /api/advanceddeal/tier-deals             # List
POST   /api/advanceddeal/tier-deals             # Create
PUT    /api/advanceddeal/tier-deals/{id}        # Update
DELETE /api/advanceddeal/tier-deals/{id}        # Delete
```

### Comeback Deals
```
GET    /api/advanceddeal/comeback-deals         # List
POST   /api/advanceddeal/comeback-deals         # Create
PUT    /api/advanceddeal/comeback-deals/{id}    # Update
DELETE /api/advanceddeal/comeback-deals/{id}    # Delete
```

### Lottery Deals
```
GET    /api/advanceddeal/lottery-deals          # List
POST   /api/advanceddeal/lottery-deals          # Create
PUT    /api/advanceddeal/lottery-deals/{id}     # Update
DELETE /api/advanceddeal/lottery-deals/{id}     # Delete
```

### Birthday Deals
```
GET    /api/advanceddeal/birthday-deals         # List
POST   /api/advanceddeal/birthday-deals         # Create
PUT    /api/advanceddeal/birthday-deals/{id}    # Update
DELETE /api/advanceddeal/birthday-deals/{id}    # Delete
```

### Time Deals
```
GET    /api/advanceddeal/time-deals             # List
POST   /api/advanceddeal/time-deals             # Create
PUT    /api/advanceddeal/time-deals/{id}        # Update
DELETE /api/advanceddeal/time-deals/{id}        # Delete
```

### Utilities
```
GET    /api/advanceddeal/customer-tier/{customerId}        # Get tier info
GET    /api/advanceddeal/applicable/{customerId}           # Eligible deals
GET    /api/advanceddeal/inactive-customers?inactiveDays=30 # Inactive list
```

---

## 💡 Implementation Details

### How Deals Apply During Transactions

1. Customer visits shop (QR scan or manual lookup)
2. Staff enters transaction amount
3. Backend executes in order:
   - Apply base deals (BranchDealOverride, DealTemplate)
   - Calculate customer tier (automatic update)
   - Evaluate streak bonus (if applicable)
   - Evaluate tier multiplier (if applicable)
   - Evaluate comeback bonus (if eligible)
   - Evaluate lottery draw (if applicable)
   - Evaluate birthday bonus (if in window)
   - Evaluate time bonus (if in window)
   - **Sum all bonuses** (non-overlapping)
   - Add to dots earned
   - Create Visit record
   - Log to AuditLog

### Tier Calculation Logic

```csharp
// On each visit
CustomerTier tier = CalculateTierFromLifetimeSpend(
  sumOf(all historical visits) + currentVisit.amount
);

// Thresholds
Bronze:  $0 - $500        (×1.0 dots, ×1.0 discount)
Silver:  $500 - $2000     (×1.25 dots, ×1.1 discount)
Gold:    $2000+           (×1.5 dots, ×1.25 discount)

// Change is logged to AuditLog
```

### Streak Calculation Logic

```csharp
// Consecutive visit days
currentStreak = 1;
for each visit in last 100 visits (most recent first) {
  if (visit.date == today - streak_offset) {
    currentStreak++;
  } else {
    break;
  }
}
```

---

## 🔍 Monitoring & Analytics

### View Tier Distribution
- Access: Manager Dashboard → Analytics
- Shows: Customer distribution across Bronze/Silver/Gold

### View Comeback Opportunities
- API: `GET /api/advanceddeal/inactive-customers`
- Use for: Email campaigns, push notifications

### Audit Trail
- Access: Manager Dashboard → Audit Logs
- Filter by: Entity Type = "CustomerTier" or "ComebackBonus"
- See: All tier changes and comeback redemptions

---

## ⚙️ Configuration Examples

### Aggressive Growth (High Engagement)
```
Streak:    3 days minimum, 75 dots bonus
Tier:      Bronze +30 dots, Silver +50, Gold +75
Comeback:  14 days inactivity, 150 bonus (aggressive)
Lottery:   30% win chance, 100-250 dots
Birthday:  180 bonus dots, ±5 day window
Time:      Fri-Sat 18:00-21:00, 50 dots + ×1.5
```

### Conservative (Cost-Controlled)
```
Streak:    7 days minimum, 25 dots bonus
Tier:      Bronze only, +10 dots
Comeback:  60 days inactivity, 50 bonus
Lottery:   10% win chance, 25-75 dots
Birthday:  50 bonus dots, ±1 day window
Time:      None (disabled)
```

### Balanced (Recommended)
```
Streak:    5 days minimum, 50 dots bonus
Tier:      All tiers, +20/35/50 bonus
Comeback:  30 days inactivity, 100 bonus
Lottery:   20% win chance, 50-150 dots
Birthday:  100 bonus dots, ±3 day window
Time:      Sat 12:00-14:00, 25 dots + ×1.2
```

---

## 🐛 Troubleshooting

### Deal Not Appearing in "Applicable" List
1. Check: Deal `isActive` = true
2. Check: Current date between `startDate` and `endDate`
3. Check: Customer meets conditions (tier, streak, inactivity, time)

### Tier Not Updating
1. Check: VisitController calling `TierService.CalculateAndUpdateTierAsync()`
2. Check: Visit record created successfully
3. Check: AuditLog shows "Tier updated during transaction"

### Comeback Not Eligible
1. Check: AuditLog for "ComebackBonus" redemption
2. Check: Last visit date + inactiveDays < today
3. Check: Deal `isActive` = true

### Lottery Always Winning (or Never)
1. Check: `winProbability` is decimal between 0.01 and 1.0
2. Note: Small sample size may show variance
3. Test with 100+ simulated transactions for accuracy

---

## 📞 Support

### Common Questions

**Q: Can a customer win multiple times on a Lottery deal?**
A: Yes, lottery is evaluated every transaction with independent probability

**Q: Can Comeback bonus stack with other bonuses?**
A: Yes, all bonuses (except tier multiplier) add together non-overlapping

**Q: How do I run a time-limited campaign?**
A: Set startDate and endDate on any deal type

**Q: Can I target specific tiers with a deal?**
A: Use Tier Deal to limit to Bronze/Silver/Gold

**Q: What happens if two Time deals overlap?**
A: Both bonuses apply (additive, not multiplicative)

---

## 📚 Related Documentation

- [Backend API Docs](./Dotly.api/README.md)
- [Frontend Component Guide](./dotly-ui/README.md)
- [Database Schema](./DATABASE.md)
- [Feature Roadmap](./FEATURE_ROADMAP.md)

---

**Last Updated**: January 31, 2026
**Status**: Production Ready ✨
