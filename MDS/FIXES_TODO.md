# DOTLY FIX CHECKLIST
## All Issues from CODE_REVIEW - Organized by Priority

---

## 🔴 CRITICAL (BLOCKING) - Fix Today

### 1. Delete Broken/Duplicate Pages
- [ ] Delete `src/pages/StaffPage.tsx` (OLD, uses phone-based API)
- [ ] Delete `src/pages/CustomerLogin.tsx` (NO backend endpoint)
- [ ] Delete `src/pages/CustomerOnboard.tsx` (NO backend endpoint)
- [ ] Delete `src/pages/HomePage.tsx` (never used)
- [ ] Delete `src/pages/CustomerOverview.tsx` (never used)
- [ ] Update `src/main.tsx` - Remove imports & routes for deleted pages

### 2. Fix DealsPage.tsx Syntax Error
- [ ] Fix JSX closing tags at lines 146, 289, 292
- [ ] Test: `npm run build` should pass with 0 errors

### 3. Fix API Endpoint Mismatch
- [ ] Update `src/lib/api.ts` - Remove phone-based functions:
  - Remove `createVisit(phone, amount)`
  - Remove `customerLogin(phone, pin)`
  - Remove `customerOnboard(tenantId, phone, pin)`
  - Remove `redeemReward(rewardId, phone)`
- [ ] Update `src/lib/api.ts` - Add QR-based functions:
  - Add `customerRegister(name, phone, email)`
  - Add `customerLinkShop(customerAccountId, tenantId)`
  - Add `customerGetMyShops()`
  - Add `customerGetMyQR()`
  - Add `staffPurchase(customerAccountId, tenantId, amount)`
  - Add `staffRedeemReward(customerAccountId, tenantId, rewardId)`

### 4. Fix Backend Compilation Errors
- [ ] `Controllers/RewardsController.cs` - Fix property references
  - Change `!r.IsDeleted` to remove (Reward doesn't have IsDeleted)
  - Change `DotsDeducted` to removed (Redemption doesn't have it)
- [ ] `Controllers/CustomerController.cs` - Fix Referral property names
  - Change `r.RewardDots` to `r.ReferrerRewardDots` (line 457)
  - Change `referralsAsReferred?.RewardDots` to `referralsAsReferred?.ReferredRewardDots` (line 459)
  - Change `r.RewardDots` to `r.ReferrerRewardDots` in select (line 483)

---

## 🟡 HIGH PRIORITY - Fix This Week

### 5. Delete Product-Based Deal Templates
- [ ] Open `Infrastructure/Seed/DealTemplateSeeder.cs`
- [ ] Delete templates IDs 13-27 (all product-based deals):
  - "Buy any coffee, get pastry 50% off"
  - "Combo Deal: Coffee + Croissant"
  - "Buy 2 Drinks, Get Food Item Free"
  - "Early Bird Special"
  - "Lunch Rush Upgrade"
  - "Late Night Boost"
  - "Bronze Tier Member"
  - "Silver Tier Member"
  - "Gold Tier Member"
  - "Bring a Friend"
  - "Instagram Check-in"
  - "Review Us"
  - "Holiday Special"
  - "Rainy Day Deal"
  - "Birthday Month Free Drink"
- [ ] Keep only transaction-based templates (IDs 1-12)
- [ ] Test: Templates should only be: Double Dots, Buy 9 Get 1, Buy 5 Get Reward, Visit Streak, Spend 20 Get 5, 10% Big Order, Happy Hour, Weekend Boost, First Visit Bonus, Comeback Reward, Surprise Reward, Birthday Reward

### 6. Delete Unused Backend Controllers
- [ ] Delete `Controllers/CustomerController.cs` (OLD customer model)
- [ ] Delete `Controllers/AuthController.cs` (PIN-based auth)
- [ ] Delete `Controllers/BoostController.cs` (overcomplicated)
- [ ] Delete `Controllers/ReferralController.cs` (not in spec)
- [ ] Delete `Controllers/ExportController.cs` (not needed)
- [ ] Delete `Controllers/ImportController.cs` (not needed)
- [ ] Delete `Controllers/BackupController.cs` (not needed)
- [ ] Delete `Controllers/NotificationsController.cs` (no system)
- [ ] Delete `Controllers/TenantConfigController.cs` (unclear)
- [ ] Delete `Controllers/HealthController.cs` (boilerplate)

### 7. Delete Unused Database Entities
- [ ] Delete `Domain/Entities/Product.cs` (no products)
- [ ] Delete `Domain/Entities/BoostInstance.cs` (use Deal instead)
- [ ] Delete `Domain/Entities/BoostTemplate.cs` (use DealTemplate)
- [ ] Delete `Domain/Entities/AuditLog.cs` (unused)
- [ ] Delete `Domain/Entities/EmailVerificationToken.cs` (no email auth)
- [ ] Delete `Domain/Entities/PasswordResetToken.cs` (no passwords)
- [ ] Delete `Domain/Entities/Referral.cs` (not in spec)
- [ ] Delete `Domain/Entities/ISoftDelete.cs` (complexity without benefit)

### 8. Fix Deal Template Categories
- [ ] Update `Infrastructure/Seed/DealTemplateSeeder.cs` - Category values:
  - Only use: "Spend", "Visit", "Time", "Lifecycle"
  - Remove: "Product", "Membership", "Social", "Seasonal"

### 9. Implement Manager Dashboard Backend
- [ ] Create `Controllers/ManagerController.cs` with:
  - `GET /api/manager/dashboard` - Daily metrics (visits, revenue, redemptions, dots)
  - Response: totalVisits, totalRevenue, totalRedemptions, totalDotsIssued, averageOrderValue
- [ ] Implement endpoints to return daily aggregated data
- [ ] Filter by tenant and branch

### 10. Implement Owner Deal Management Backend
- [ ] Create `Controllers/OwnerDealController.cs` with:
  - `POST /api/owner/deals/activate` - Activate deal template with custom parameters
  - `PUT /api/owner/deals/{id}` - Update deal parameters
  - `GET /api/owner/deals/templates` - List available templates
- [ ] Allow customization of template parameters

---

## 🟠 MEDIUM PRIORITY - Fix Next Week

### 11. Fix API Client (api.ts)
- [ ] Verify all customer endpoints match backend:
  - `POST /api/customer-portal/register`
  - `POST /api/customer-portal/link-shop`
  - `GET /api/customer-portal/my-shops`
  - `GET /api/customer-portal/my-qr`
- [ ] Verify all staff endpoints:
  - `POST /api/visits/pcs-purchase`
  - `GET /api/rewards/available-for-qr`
  - `POST /api/rewards/redeem-by-qr`
- [ ] Export `api` object if needed by other pages

### 12. Implement Reward Management UI
- [ ] Create reward creation page/dialog
- [ ] Allow edit reward name and cost
- [ ] Allow deactivate reward
- [ ] Add to OwnerDashboard

### 13. Implement Redemption Tracking
- [ ] Verify `Redemption` entity has proper fields:
  - Id, TenantId, RewardId, CustomerId, CreatedAt
- [ ] Create `RedemptionController` with:
  - `GET /api/redemptions` - List all redemptions (Owner/Manager)
  - `GET /api/redemptions/customer/{customerId}` - Get customer's redemption history
  - `GET /api/redemptions/daily-summary` - Daily aggregation

### 14. Implement Manager Dashboard UI
- [ ] Update `pages/ManagerDashboard.tsx` with:
  - Daily visit count
  - Daily revenue
  - Daily redemptions
  - Daily dots issued
  - Branch-specific metrics
- [ ] Add deal override UI:
  - Disable/enable deals per branch
  - Modify discount % per branch
  - Custom time windows per branch

### 15. Implement Owner Deal Management UI
- [ ] Update `pages/DealsPage.tsx` (fix syntax first):
  - Show available templates
  - Form to activate template with parameters
  - List active deals
  - Edit active deals
  - Deactivate deals

### 16. Fix Customer Account Model Documentation
- [ ] Add comments to clarify:
  - `CustomerAccount` = Global account (phone/email/name + personal QR)
  - `Customer` = Per-shop customer record
  - `CustomerTenantLink` = Links account to shop
  - `DotWallet` = Per-shop balance
- [ ] Document relationship diagram in README

### 17. Clarify/Remove TenantMiddleware
- [ ] Verify TenantMiddleware is actually used
- [ ] If used, document how tenant is extracted
- [ ] If not used, delete it

### 18. Implement Business Limits
- [ ] Create `Domain/Entities/BusinessLimits.cs` with:
  - MaxRedemptionsPerDay
  - MaxPromoCapPerMonth
  - TenantId, CreatedAt, UpdatedAt
- [ ] Create `Controllers/BusinessLimitsController.cs`
- [ ] Enforce in purchase/redemption endpoints

### 19. Add Audit Trail
- [ ] Create `Domain/Entities/AuditLog.cs` with:
  - Action, EntityType, EntityId, UserId, CreatedAt
- [ ] Log all critical operations:
  - Purchase created
  - Reward redeemed
  - Deal activated/deactivated
  - Override created

### 20. Verify DotWallet Integration
- [ ] Verify `GET /api/customer-portal/shops/{tenantId}` returns DotWallet:
  - { id, tenantId, customerId, dots, updatedAt }
- [ ] Test balance updates after purchase
- [ ] Test balance deduction after redemption

---

## ✅ VERIFICATION CHECKLIST

After completing fixes, verify:

### Build & Compilation
- [ ] `dotnet build` - 0 errors in Dotly.api
- [ ] `npm run build` - 0 errors in dotly-ui
- [ ] No unused variable warnings

### Frontend Routes
- [ ] `/customer/register` → Works
- [ ] `/customer/my-shops` → Works
- [ ] `/customer/shop/:tenantId` → Works
- [ ] `/staff/pos` → Works
- [ ] `/staff/redeem` → Works
- [ ] `/manager` → Works
- [ ] `/owner` → Works
- [ ] `/deals` → Works
- [ ] All deleted routes return 404

### API Endpoints
- [ ] `POST /api/customer-portal/register` → Works
- [ ] `POST /api/customer-portal/link-shop` → Works
- [ ] `GET /api/customer-portal/my-shops` → Works
- [ ] `POST /api/visits/pcs-purchase` → Works
- [ ] `GET /api/rewards/available-for-qr` → Works
- [ ] `POST /api/rewards/redeem-by-qr` → Works

### End-to-End Flows
- [ ] Customer registration → Get QR ✅
- [ ] Shop linking → See in My Shops ✅
- [ ] Staff POS → Scan QR → Enter amount → Confirm ✅
- [ ] Reward redemption → Scan QR → Select reward → Confirm ✅

### Database
- [ ] Migrations apply cleanly
- [ ] No orphaned entities
- [ ] No broken foreign keys

---

## 📊 PRIORITY SUMMARY

| Priority | Count | Est. Time |
|----------|-------|-----------|
| 🔴 Critical | 4 issues | 2 hours |
| 🟡 High | 5 issues | 4 hours |
| 🟠 Medium | 11 issues | 8 hours |
| **Total** | **20 issues** | **~14 hours** |

---

## 🎯 RECOMMENDED SEQUENCE

1. **Day 1 Morning** (2 hours)
   - Fix #1: Delete broken pages
   - Fix #2: Fix DealsPage.tsx
   - Fix #3: Fix API endpoint mismatch
   - Fix #4: Fix compilation errors
   - **Verify**: App builds & runs

2. **Day 1 Afternoon** (4 hours)
   - Fix #5: Delete product templates
   - Fix #6: Delete unused controllers
   - Fix #7: Delete unused entities
   - Fix #8: Fix template categories
   - **Verify**: Seed data is correct

3. **Day 2** (4 hours)
   - Fix #9: Manager dashboard backend
   - Fix #10: Owner deal management backend
   - Fix #11: API client verification
   - **Test**: End-to-end flows

4. **Day 3+** (8+ hours)
   - Fix #12-20: Polish & features
   - Testing & validation

---

**Last Updated**: January 30, 2026
**Status**: Ready to begin fixes
**Target Completion**: 3-4 days with focused work
