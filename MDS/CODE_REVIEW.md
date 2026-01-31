# DOTLY APP - COMPREHENSIVE REVIEW
## Code & Business Perspectives | January 30, 2026

---

## 🔴 CRITICAL ISSUES (BLOCKING)

### 1. **DealsPage.tsx - Build Broken** (Blocks all builds)
- **Status**: ❌ NOT WORKING
- **Location**: [src/pages/DealsPage.tsx](src/pages/DealsPage.tsx)
- **Error**: Missing closing tag on JSX div (lines 146, 289, 292)
- **Impact**: `npm run build` fails with TS17008, TS1381, TS1005
- **Fix**: Add closing `</div>` tags - appears to be template syntax issue
- **Time to Fix**: 5 minutes

### 2. **API Endpoint Mismatch - Old vs New Design** (Breaks staff flows)
- **Problem**: Code has TWO different architectures simultaneously
  - **OLD**: `StaffPage.tsx` calls `/api/visit` (phone-based, per-tenant)
  - **NEW**: `StaffPOS.tsx` calls `/api/visits/pcs-purchase` (QR-based, multi-tenant)
- **Impact**: 
  - `StaffPage.tsx` uses `createVisit(phone, amount)` → won't work
  - `StaffPOS.tsx` uses `pcs-purchase(customerAccountId, tenantId, amount)` → correct
  - StaffRedeem uses old reward endpoints that may not exist
- **Root Cause**: Partial refactor - old code not cleaned up
- **Fix**: **DELETE StaffPage.tsx entirely** - it's obsolete. Only use StaffPOS + StaffRedeem

### 3. **Customer Authentication - Broken Flow**
- **Problem**: Three different customer auth approaches mixed in:
  1. **customerLogin** (phone + PIN) - OLD, doesn't exist in backend
  2. **customerOnboard** - OLD, doesn't exist in backend  
  3. **QR-based via pcs-purchase** - NEW, correct
- **Impact**: 
  - CustomerLogin.tsx won't work (no endpoint)
  - CustomerOnboard.tsx won't work (no endpoint)
  - Only CustomerRegister → CustomerMyShops → StaffPOS works
- **Missing Pages**: No dedicated customer login/onboard for existing customers
- **Fix**: 
  - Delete CustomerLogin.tsx
  - Delete CustomerOnboard.tsx OR convert to shop picker
  - Add simple "returning customer" flow that just requires QR

### 4. **DotWallet - Unused/Wrong Model**
- **Problem**: Code has per-shop DotWallet but unclear if it's working
- **Status**: Entity exists, being created in link-shop, but NO endpoints to fetch it
- **Issue**: CustomerPage.tsx tries to fetch balance via `customerGetShop()` but that endpoint may not return it
- **Fix**: Verify DotWallet is returned in GET /api/customer-portal/shops/{tenantId}

---

## 🟡 MAJOR ISSUES (HIGH PRIORITY)

### 5. **Product Templates in DealTemplateSeeder - VIOLATES ARCHITECTURE**
- **Location**: [Infrastructure/Seed/DealTemplateSeeder.cs](Infrastructure/Seed/DealTemplateSeeder.cs)
- **Problem**: 11 templates (IDs 13-27) are PRODUCT-BASED:
  - "Buy any coffee, get pastry 50% off"
  - "Buy 2 drinks, get food free"
  - "Early bird special: 25% off all coffee"
  - "Lunch rush: free upgrade to large"
- **Violation**: You explicitly said NO product-level deals
- **Impact**: Users can activate these templates but system doesn't have product data
- **Fix**: **DELETE all 11 product templates** (IDs 13-27)
- **Keep**: Only transaction-based templates (IDs 1-12)

### 6. **Unused/Overcomplicated Controllers**
- **Exists but wrong**:
  - `CustomerController.cs` - OLD customer model (before QR redesign)
  - `AuthController.cs` - PIN-based auth (obsolete)
  - `BoostController.cs` - Using BoostInstance/BoostTemplate (overly complex)
  - `ReferralController.cs` - Not in architecture spec
- **Should exist but missing**:
  - `ManagerDashboardController.cs` - No endpoints for manager metrics
  - `OwnerDashboardController.cs` - No endpoints for owner deal management

### 7. **Unused Entities in Database**
- **Product.cs** - No products needed
- **BoostInstance.cs** & **BoostTemplate.cs** - Overcomplicated (just use Deal)
- **EmailVerificationToken.cs** - No email auth in architecture
- **PasswordResetToken.cs** - No password reset (QR-based)
- **Referral.cs** & **ReferralController.cs** - Not in spec
- **AuditLog.cs** - Created but no endpoints
- **ISoftDelete.cs** - Used everywhere but no benefit

### 8. **API Client Misalignment** [src/lib/api.ts](src/lib/api.ts)
- **Missing new endpoints**:
  ```typescript
  // These don't exist:
  export const customerRegister = ... ❌
  export const customerLinkShop = ... ❌
  export const customerGetMyShops = ... ❌
  export const customerGetMyQR = ... ❌
  export const staffPurchase = ... ❌
  export const staffRedeemReward = ... ❌
  ```
- **These are wrong** (old phone-based):
  ```typescript
  export const createVisit = (phone, amount) ❌
  export const redeemReward = (rewardId, phone) ❌
  export const customerLogin = (phone, pin) ❌
  ```
- **Fix**: Rewrite entire api.ts to match new QR-based architecture

### 9. **Frontend Routes - Partial Wiring**
- **Status**: main.tsx has routes defined but pointing to wrong/incomplete pages
- **Problem Routes**:
  - `/customer/register` → Works (CustomerRegister.tsx)
  - `/customer/login` → Points to CustomerLogin.tsx (NO backend endpoint)
  - `/customer/onboard` → Points to CustomerOnboard.tsx (NO backend endpoint)
  - `/staff` → Points to StaffPage.tsx (OLD, uses phone-based API)
- **Correct Routes**:
  - `/staff/pos` → StaffPOS.tsx (QR-based, correct)
  - `/staff/redeem` → StaffRedeem.tsx (QR-based, correct)
  - `/customer/my-shops` → CustomerMyShops.tsx (correct)

### 10. **Deal Template Categories - Confusing**
- **Problem**: Templates have categories like "Product", "Time", "Membership", "Seasonal", "Social"
- **Issue**: Some categories imply features that don't exist:
  - "Product" = product-based deals (invalid)
  - "Social" = referrals/reviews (not in spec)
  - "Membership" = tiered system (not in spec)
- **Better**: Stick to: "Spend", "Visit", "Time", "Lifecycle"

---

## 🟠 MEDIUM ISSUES (IMPORTANT)

### 11. **Manager Dashboard - Not Implemented**
- **What Exists**: ManagerDashboard.tsx page (but mostly placeholder)
- **What's Missing**: 
  - GET /api/manager/dashboard (daily metrics)
  - POST /api/manager/deal-override (branch overrides)
  - No backend controller
- **Business Impact**: Managers can't see daily performance or override deals

### 12. **Owner Deal Management - Not Wired**
- **What Exists**: 
  - OwnerDashboard.tsx (shows templates but can't actually use them)
  - DealsPage.tsx (syntax error, can't build)
  - Deal template seeder (with wrong templates)
- **What's Missing**:
  - No clear "activate deal" UI
  - No "customize parameters" UI
  - DealsPage.tsx is broken (JSX error)
- **Business Impact**: Owners can't manage deals - core feature blocked

### 13. **Reward Lifecycle - Incomplete**
- **Missing**:
  - Can't create rewards via UI (only via API)
  - Can't edit reward cost/name
  - Can't deactivate rewards
  - Can't see redemption history
- **Status**: POST /api/rewards/redeem-by-qr exists but:
  - No validation on dot balance
  - No deduplication of redemptions
  - No audit trail

### 14. **Customer Account Model - Unclear Design**
- **What is CustomerAccount.cs?**
  - Global account? (Yes, per phone/email)
  - Has personal QR? (Yes, Id = QR value)
  - Can have multiple shops? (Yes, via CustomerTenantLink)
- **What is Customer.cs?**
  - Per-shop customer record? (Unclear from model)
  - Duplicate of CustomerAccount? (Appears to be)
  - Why two models? (Migration from old design)
- **Issue**: Design is correct but naming is confusing

### 15. **TenantMiddleware - Purpose Unclear**
- **Location**: [Middleware/TenantMiddleware.cs](Middleware/TenantMiddleware.cs)
- **Purpose**: Extract tenant from request (how?)
- **Implementation**: Unknown if it's used/needed
- **Question**: How does staff member know which shop they work at?
  - Currently: From User.BranchId (correct)
  - But: What about multi-tenant context?

---

## 🟡 MISSING FEATURES (BY PRIORITY)

### Tier 1 (Core) - NEEDED FOR LAUNCH
- ✅ Customer registration (DONE)
- ✅ Shop linking (DONE)
- ✅ Staff POS purchase (DONE - but StaffPage.tsx is wrong)
- ✅ Reward redemption (DONE)
- ❌ **DELETE old StaffPage.tsx** (using wrong API)
- ❌ **DELETE old CustomerLogin.tsx** (no endpoint)
- ❌ **DELETE old CustomerOnboard.tsx** (no endpoint)
- ❌ **FIX DealsPage.tsx JSX errors**
- ❌ **DELETE product-based deal templates** (violates spec)
- ❌ **Rewrite api.ts** (mismatch with new architecture)

### Tier 2 (Important) - NEEDED WITHIN 1 WEEK
- ❌ Manager dashboard with daily metrics
- ❌ Manager branch deal overrides
- ❌ Owner deal activation UI (working DealsPage)
- ❌ Owner deal customization form
- ❌ Reward creation UI (currently API-only)
- ❌ RedemptionController & Redemption tracking

### Tier 3 (Nice to Have) - LOWER PRIORITY
- ❌ Business limits (max redemptions/day)
- ❌ Audit trail for all transactions
- ❌ Customer transaction history page
- ❌ Manager staff management UI
- ❌ Promotional caps & budget tracking
- ❌ Notifications (in-app, SMS, email)

---

## ❌ COMPLETELY UNUSED CODE (DELETE)

### Backend
```
❌ CustomerController.cs - OLD customer management (phone-based)
❌ BoostController.cs - Uses complex BoostInstance/Template (overcomplicated)
❌ ReferralController.cs - Feature not in spec
❌ ExportController.cs - Not needed
❌ ImportController.cs - Not needed
❌ BackupController.cs - Not needed
❌ NotificationsController.cs - No notification system
❌ TenantConfigController.cs - Purpose unclear
❌ HealthController.cs - Leftover boilerplate
```

### Database Entities
```
❌ Product.cs - No products in architecture
❌ BoostInstance.cs - Use Deal instead
❌ BoostTemplate.cs - Use DealTemplate instead
❌ AuditLog.cs - Not used
❌ EmailVerificationToken.cs - No email auth
❌ PasswordResetToken.cs - No password reset
❌ Referral.cs - Not in spec
❌ ISoftDelete.cs - Adds complexity without benefit
```

### Frontend Pages
```
❌ StaffPage.tsx - OLD staff interface (uses phone-based API)
❌ CustomerLogin.tsx - NO backend endpoint
❌ CustomerOnboard.tsx - NO backend endpoint (or convert to shop picker)
❌ ForgotPassword.tsx - No password system
❌ HomePage.tsx - Never used
❌ CustomerOverview.tsx - Never used
```

### Frontend API
```
❌ api.createVisit(phone, amount) - Wrong (should be QR-based)
❌ api.customerLogin(phone, pin) - Wrong (no backend)
❌ api.customerOnboard(tenantId, phone, pin) - Wrong (no backend)
❌ api.redeemReward(rewardId, phone) - Wrong (should be QR-based)
```

---

## ✅ WHAT'S CORRECT

### Backend - Good Design
- ✅ **DealService** - Transaction-based deal engine (amount, visits, time)
- ✅ **Visit entity** - Tracks all purchases correctly
- ✅ **CustomerPortalController** - QR registration flow is right
- ✅ **VisitController.pcs-purchase** - Staff POS endpoint is correct
- ✅ **DotWallet** - Per-shop balance tracking (if wired correctly)
- ✅ **CustomerTenantLink** - Multi-shop linking is right

### Frontend - Mostly Good
- ✅ **CustomerRegister.tsx** - Works correctly
- ✅ **CustomerMyShops.tsx** - Works correctly
- ✅ **StaffPOS.tsx** - Perfect POS interface (QR + amount)
- ✅ **StaffRedeem.tsx** - Elegant redemption flow
- ✅ **CustomerPage.tsx** - Shop wallet view is right idea

### Architecture - Sound
- ✅ **Transaction-based** not item-based (correct)
- ✅ **QR-based** customer auth (right)
- ✅ **Multi-shop** customers (right)
- ✅ **Staff role** restrictions (right)
- ✅ **Deal engine** integration (right)

---

## 📋 IMMEDIATE ACTION ITEMS

### BLOCKING (Today - 1 hour total)
1. Delete [src/pages/StaffPage.tsx](src/pages/StaffPage.tsx)
2. Delete [src/pages/CustomerLogin.tsx](src/pages/CustomerLogin.tsx)
3. Delete [src/pages/CustomerOnboard.tsx](src/pages/CustomerOnboard.tsx) OR convert to shop picker
4. Fix [src/pages/DealsPage.tsx](src/pages/DealsPage.tsx) JSX closing tags
5. Update [main.tsx](main.tsx) routes to remove deleted pages
6. Verify [npm run build](npm run build) passes

### CRITICAL (Today - 2 hours total)
7. Rewrite [src/lib/api.ts](src/lib/api.ts) with correct endpoints:
   - Remove phone-based functions
   - Add new QR-based functions
   - Remove PIN auth functions
8. Delete product-based templates from [DealTemplateSeeder.cs](Infrastructure/Seed/DealTemplateSeeder.cs) (IDs 13-27)
9. Test StaffPOS.tsx end-to-end:
   - Register customer
   - Link shop
   - Staff POS purchase
   - Verify dots awarded

### HIGH PRIORITY (Next 2 days)
10. Implement Manager Dashboard:
    - GET /api/manager/dashboard
    - UI showing daily metrics
11. Fix DealsPage.tsx to actually work
12. Create reward creation UI (not just API)
13. Implement Redemption entity + controller

### MEDIUM PRIORITY (Next week)
14. Owner deal activation UI
15. Business limits enforcement
16. Audit trail
17. Delete all unused controllers & entities

---

## 🎯 BUSINESS PERSPECTIVE

### What's Working ✅
- Customer can register and get personal QR
- Customer can link shops
- Staff can scan QR and enter amount
- Dots are awarded correctly
- Rewards can be redeemed (in theory)

### What's Broken ❌
- **DealsPage can't build** (syntax error)
- **Two staff interfaces** - old one is wrong
- **Product-based templates exist** - violates spec
- **Managers have no dashboard** - can't oversee business
- **Owners can't manage deals** - core feature missing
- **Reward creation only via API** - poor UX

### What's Confusing 🤔
- Why are there 27 deal templates when only 12 are valid?
- Why are there two customer models (Customer + CustomerAccount)?
- Why is there a BoostController AND DealController?
- Why are there so many unused entities in database?

### Risk Level: **MEDIUM** 🟡
- Core transaction flow works (good)
- But many features are half-implemented or broken (risky)
- Lots of dead code makes maintenance harder
- Inconsistent architecture (mix of old & new design)

---

## 💡 RECOMMENDATIONS

### Short Term (Make it work)
1. **Delete all OLD code** (phone-based staff, customer login, onboard)
2. **Delete all PRODUCT templates** (violates spec)
3. **Fix DealsPage.tsx** JSX
4. **Rewrite api.ts** cleanly
5. **Test end-to-end** flow: Register → Link Shop → Purchase → Redeem

### Medium Term (Make it complete)
1. **Manager Dashboard** - daily metrics + overrides
2. **Owner Deal UI** - working DealsPage + customization
3. **Reward Management** - create/edit/deactivate
4. **RedemptionController** - track all redemptions

### Long Term (Clean it up)
1. **Delete 10+ unused controllers** (ReferralController, ExportController, etc.)
2. **Delete 6+ unused entities** (Product, BoostInstance, Referral, etc.)
3. **Document architecture** clearly
4. **Add business limits** (redemption caps)
5. **Add audit trail** (all transactions)

---

## 📊 SUMMARY TABLE

| Area | Status | Issue | Severity |
|------|--------|-------|----------|
| **Staff POS** | ⚠️ Mixed | Two interfaces, one wrong | 🔴 CRITICAL |
| **Customer Register** | ✅ Works | None | ✅ OK |
| **Customer Auth** | ❌ Broken | PIN-based has no endpoint | 🔴 CRITICAL |
| **Reward Redemption** | ✅ Mostly | No creation UI | 🟠 MEDIUM |
| **Deal Management** | ❌ Broken | DealsPage syntax error | 🔴 CRITICAL |
| **Manager Dashboard** | ❌ Missing | No endpoints | 🟡 HIGH |
| **API Client** | ⚠️ Outdated | Mismatch with backend | 🔴 CRITICAL |
| **Database** | ⚠️ Bloated | 6+ unused entities | 🟠 MEDIUM |
| **Controllers** | ⚠️ Mixed | 8+ unused/wrong | 🟠 MEDIUM |
| **Architecture** | ✅ Sound | Correct concepts | ✅ OK |

---

**Generated**: January 30, 2026
**Severity**: 🔴 3 Critical, 🟡 2 High, 🟠 5 Medium (Total: 10 issues)
