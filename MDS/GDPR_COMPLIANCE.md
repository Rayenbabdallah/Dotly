# GDPR & Data Privacy Compliance Implementation

## Overview

Complete GDPR compliance system enabling customers and staff to:
- ✅ Export personal data (Right to Data Portability)
- ✅ Delete accounts (Right to be Forgotten)
- ✅ Manage consent preferences
- ✅ Automatic data anonymization and purging
- ✅ Audit trail of all data operations

## Features Implemented

### 1. Data Export (Right to Portability)

**Endpoint**: `GET /api/gdpr/customer/export?customerId={id}`

Downloads user data in JSON format including:
- Profile information
- Transaction history (visits)
- Rewards and redemptions
- Streaks and badges
- Consent preferences

```typescript
// Client-side usage
const response = await fetch(`/api/gdpr/customer/export?customerId=123`);
const blob = await response.blob();
// Trigger download
```

**Technical Implementation**:
```csharp
// GdprService.ExportCustomerDataAsync()
- Collects all customer related data
- Serializes to JSON with pretty printing
- Logged in audit trail
```

### 2. Account Deletion (Right to be Forgotten)

**Endpoint**: `POST /api/gdpr/customer/delete-account`

Soft delete with 30-day waiting period:
1. User requests deletion
2. Data is anonymized immediately
3. Account marked for deletion (30-day retention period)
4. User can cancel within 30 days
5. After 30 days, data is permanently purged

**Request**:
```json
{
  "customerId": 123,
  "reason": "No longer using the service"
}
```

**Process**:
1. Soft delete account (IsActive = false)
2. Anonymize personal data:
   - Email → deleted_{id}@deleted.local
   - Phone → DELETED
   - Name → Deleted Customer {id}
   - DateOfBirth → null
3. Log deletion in AuditLog
4. Mark redemptions as anonymized

**Automatic Purge**: After 90 days, permanently delete soft-deleted accounts

### 3. Consent Management

**Endpoint**: `POST /api/gdpr/consent/update`

Track 5 types of user consent:

```csharp
public enum ConsentType
{
    Marketing,      // Promotional emails/messages
    Cookies,        // Analytics and tracking
    Privacy,        // Privacy policy acknowledgment
    DataProcessing, // Data processing agreement
    Profiling       // User personalization
}
```

**Request**:
```json
{
  "userId": 123,
  "consentType": "Marketing",
  "isGranted": true
}
```

**Storage**:
```csharp
public class UserConsent
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public ConsentType ConsentType { get; set; }
    public bool IsGranted { get; set; }
    public DateTime? GrantedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

**Get Consent**: `GET /api/gdpr/consent/{userId}`

Returns all consent preferences for a user

### 4. Data Retention Policy

**Entity**: `DataRetentionPolicy`

Configurable per tenant:
- RetentionDays: How long to keep deleted data (default: 90)
- TransactionRetentionDays: How long to keep transaction history
- AnonymizeAfterDeletion: Auto-anonymize deleted accounts
- AutoPurgeDeleted: Auto-purge after retention period

### 5. Automatic Data Maintenance

**Endpoint**: `POST /api/gdpr/data/anonymize`

Scheduled job to anonymize old data:
- Finds redemptions older than retention period
- Marks as IsAnonymized = true
- Clears sensitive notes from visits

**Endpoint**: `POST /api/gdpr/data/purge`

Scheduled job to permanently delete:
- Finds soft-deleted accounts older than retention period
- Deletes related records (rewards, redemptions, visits)
- Removes customer record

## Database Schema

### UserConsent Table
```sql
CREATE TABLE UserConsents (
    Id INT PRIMARY KEY IDENTITY,
    UserId INT NOT NULL FOREIGN KEY,
    ConsentType INT NOT NULL,
    IsGranted BIT NOT NULL,
    GrantedAt DATETIME,
    RevokedAt DATETIME,
    IpAddress VARCHAR(45),
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    TenantId INT NOT NULL FOREIGN KEY,
    UNIQUE (UserId, ConsentType)
);
```

### DeletionRequest Table
```sql
CREATE TABLE DeletionRequests (
    Id INT PRIMARY KEY IDENTITY,
    UserId INT NOT NULL FOREIGN KEY,
    CustomerId INT FOREIGN KEY,
    Status INT NOT NULL, -- Pending, Confirmed, Scheduled, Completed, Cancelled
    Reason NVARCHAR(MAX),
    RequestedAt DATETIME NOT NULL,
    CompletedAt DATETIME,
    ScheduledFor DATETIME,
    Notes NVARCHAR(MAX),
    TenantId INT NOT NULL FOREIGN KEY
);
```

### DataRetentionPolicy Table
```sql
CREATE TABLE DataRetentionPolicies (
    Id INT PRIMARY KEY IDENTITY,
    TenantId INT NOT NULL UNIQUE FOREIGN KEY,
    RetentionDays INT,
    TransactionRetentionDays INT,
    AnonymizeAfterDeletion BIT DEFAULT 1,
    AutoPurgeDeleted BIT DEFAULT 1,
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL
);
```

### Enhanced Tables
- Customer: Added IsDeleted, DeletedAt, DeletionReason
- User: Added DeletedAt
- Redemption: Added IsAnonymized flag

## Web Components

### ConsentManager
Manages all user consents with toggles:
```typescript
<ConsentManager />
```

Features:
- Marketing consent toggle
- Cookies/analytics toggle
- Privacy policy acknowledgment (required)
- Data processing agreement (required)
- Personalization consent toggle
- Real-time API updates

### DataExport
Allows users to download their data:
```typescript
<DataExport />
```

Features:
- One-click export
- Downloads as JSON
- Includes all personal data
- Audit logged

### AccountDeletion
Guided account deletion flow:
```typescript
<AccountDeletion />
```

3-step process:
1. Information screen with warnings
2. Confirmation of consequences
3. Reason collection (optional)

## Mobile Components

### PrivacySettings Screen
React Native implementation with all consent toggles:
```typescript
<PrivacySettings />
```

### DataDownloadScreen
Mobile-friendly data export:
```typescript
<DataDownloadScreen />
```

### DeleteAccountScreen
Mobile account deletion flow:
```typescript
<DeleteAccountScreen />
```

## API Endpoints Summary

| Endpoint | Method | Purpose | Role |
|----------|--------|---------|------|
| `/api/gdpr/customer/export` | GET | Export customer data | Customer |
| `/api/gdpr/user/export` | GET | Export user data | Staff |
| `/api/gdpr/customer/delete-account` | POST | Request account deletion | Customer |
| `/api/gdpr/user/delete-account` | POST | Request user deletion | Staff |
| `/api/gdpr/consent/update` | POST | Update consent preference | Any |
| `/api/gdpr/consent/{userId}` | GET | Get all consents | Owner |
| `/api/gdpr/data/anonymize` | POST | Anonymize old data | Admin |
| `/api/gdpr/data/purge` | POST | Purge deleted data | Admin |

## Integration Steps

### 1. Backend Setup

Add GDPR service to DI container:
```csharp
services.AddScoped<IGdprService, GdprService>();
```

### 2. Register Database Models

Update ApplicationDbContext:
```csharp
public DbSet<UserConsent> UserConsents { get; set; }
public DbSet<DeletionRequest> DeletionRequests { get; set; }
public DbSet<DataRetentionPolicy> DataRetentionPolicies { get; set; }
```

### 3. Run Migration

```bash
dotnet ef migrations add AddGdprCompliance
dotnet ef database update
```

### 4. Web Integration

Add to user settings/profile page:
```typescript
import { ConsentManager, DataExport, AccountDeletion } from './components/GdprCompliance';

export function PrivacyPage() {
  return (
    <>
      <ConsentManager />
      <DataExport />
      <AccountDeletion />
    </>
  );
}
```

### 5. Mobile Integration

Add privacy settings screen:
```typescript
import { PrivacySettings, DataDownloadScreen, DeleteAccountScreen } from './screens/PrivacySettings';

// Add to navigation
<Stack.Screen name="PrivacySettings" component={PrivacySettings} />
<Stack.Screen name="DataDownload" component={DataDownloadScreen} />
<Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
```

### 6. Scheduled Jobs

Configure background tasks to run periodically:

```csharp
// In Program.cs - Add hosted service
services.AddHostedService<GdprMaintenanceService>();
```

Example service:
```csharp
public class GdprMaintenanceService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var gdprService = scope.ServiceProvider.GetRequiredService<IGdprService>();
                
                // Run daily at 2 AM
                await gdprService.AnonymizeExpiredDataAsync();
                await gdprService.PurgeExpiredDataAsync();
            }

            // Wait 24 hours
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}
```

## GDPR Rights Supported

### ✅ Right to Access (GDPR Article 15)
- Users can access all their personal data
- Implemented via `/api/gdpr/*/export` endpoints

### ✅ Right to Data Portability (GDPR Article 20)
- Users can download data in structured JSON format
- One-click download with audit trail

### ✅ Right to be Forgotten (GDPR Article 17)
- Users can request account deletion
- Soft delete with 30-day waiting period
- Automatic permanent purge after retention

### ✅ Right to Rectification (GDPR Article 16)
- Users can update personal information
- Changes tracked in audit trail

### ✅ Right to Restrict Processing (GDPR Article 18)
- Users can revoke specific consents
- Marketing, cookies, profiling can all be disabled

### ✅ Right to Object (GDPR Article 21)
- Users can opt-out of profiling/personalization
- Granular consent management

## Audit & Compliance

### Audit Trail
All GDPR operations logged in AuditLog table:
- Data export requests
- Account deletion requests
- Consent changes
- Anonymization/purging operations

### Data Minimization
- Only necessary data collected
- Automatic anonymization after 90 days
- Regular purging of deleted accounts

### Privacy by Design
- Consent-first approach
- Default to most private settings
- Required consents clearly marked

## Testing

### Unit Tests
```csharp
[Test]
public async Task ExportCustomerData_ReturnsAllData()
{
    var service = new GdprService(_context, _logger);
    var json = await service.ExportCustomerDataAsync(123);
    Assert.IsNotNull(json);
    Assert.Contains("CustomerId", json);
}

[Test]
public async Task DeleteCustomerAccount_SoftDeletes()
{
    var service = new GdprService(_context, _logger);
    await service.DeleteCustomerAccountAsync(123, "Testing");
    
    var customer = _context.Customers.First(c => c.Id == 123);
    Assert.IsFalse(customer.IsActive);
    Assert.NotNull(customer.DeletedAt);
}
```

### API Tests
```bash
# Test export
curl -X GET "http://localhost:5000/api/gdpr/customer/export?customerId=1" \
  -H "Authorization: Bearer {token}"

# Test delete
curl -X POST "http://localhost:5000/api/gdpr/customer/delete-account" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"customerId": 1, "reason": "No longer needed"}'

# Test consent
curl -X POST "http://localhost:5000/api/gdpr/consent/update" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "consentType": "Marketing", "isGranted": true}'
```

## Compliance Checklist

- [x] Data Export (Right to Portability)
- [x] Account Deletion (Right to be Forgotten)
- [x] Consent Management (All 5 types)
- [x] Data Retention Policies
- [x] Automatic Anonymization
- [x] Automatic Purging
- [x] Audit Trail
- [x] 30-Day Waiting Period
- [x] Web UI Components
- [x] Mobile UI Components
- [x] Database Schema
- [x] API Endpoints
- [x] Error Handling
- [x] Accessibility
- [ ] GDPR Documentation (next)
- [ ] Privacy Policy (next)
- [ ] Data Processing Agreement (next)

## Performance Considerations

- **Data Export**: Indexing on UserId for fast queries
- **Deletion**: Soft delete to preserve referential integrity
- **Purge Job**: Background task at off-peak hours
- **Retention**: Configurable per tenant to balance compliance and storage

## Future Enhancements

1. **GDPR Documentation Portal**
   - Auto-generated DPA
   - Privacy policy builder
   - Consent audit reports

2. **Advanced Retention**
   - Document-level retention policies
   - Custom purge schedules
   - Immutable audit logs

3. **Enhanced Analytics**
   - Consent analytics dashboard
   - Deletion reason trends
   - GDPR compliance reporting

4. **International Compliance**
   - CCPA (California)
   - LGPD (Brazil)
   - PDPA (Thailand)
   - POPIA (South Africa)
