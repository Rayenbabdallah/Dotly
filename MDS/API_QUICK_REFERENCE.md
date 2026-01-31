# Dotly API Quick Reference

## Base URL
```
http://localhost:5082
```

## Authentication
All endpoints require JWT bearer token in Authorization header:
```
Authorization: Bearer {token}
```

---

## Notification Endpoints (NEW)

### Send Dots Expiration Warning
```
POST /api/notifications/send-expiration-warning
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "uuid",
  "daysRemaining": 7,
  "dotsAboutToExpire": 150.50
}

Response: 200 OK
{
  "message": "Expiration warning sent successfully to customer"
}
```

### Send Welcome Message
```
POST /api/notifications/send-welcome
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "uuid"
}

Response: 200 OK
{
  "message": "Welcome message sent successfully"
}
```

### Send Promotion Announcement
```
POST /api/notifications/send-promotion
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Spring Sale",
  "description": "Get 2x dots on all purchases this week!",
  "customerIds": ["uuid1", "uuid2"]  // optional, targets all if omitted
}

Response: 200 OK
{
  "message": "Promotion announced successfully to N customers"
}
```

### Send Birthday Deal Reminder
```
POST /api/notifications/send-birthday-deal
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "uuid",
  "customerName": "John Doe",
  "dealName": "Birthday Bonus",
  "bonusReward": "50 free dots"
}

Response: 200 OK
{
  "message": "Birthday reminder sent successfully"
}
```

### Send Comeback Offer
```
POST /api/notifications/send-comeback-offer
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "uuid",
  "daysSinceLastVisit": 30,
  "offerDescription": "Come back and get 3x dots on your next visit"
}

Response: 200 OK
{
  "message": "Comeback offer sent successfully"
}
```

### Send New Reward Available
```
POST /api/notifications/send-new-reward
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "uuid",
  "rewardId": "uuid",
  "rewardName": "Free Coffee",
  "rewardCost": 100
}

Response: 200 OK
{
  "message": "New reward notification sent successfully"
}
```

---

## Analytics Endpoints (NEW/EXTENDED)

### Get Branch Summary
```
GET /api/analytics/branch/{branchId}/summary
Authorization: Bearer {token}

Response: 200 OK
{
  "branchId": "uuid",
  "branchName": "Downtown Cafe",
  "totalVisits": 1250,
  "uniqueCustomers": 456,
  "totalRevenue": 45300.50,
  "totalDotsIssued": 8950,
  "averageOrderValue": 36.24,
  "averageDotsPerVisit": 7.16
}
```

### Compare All Branches
```
GET /api/analytics/branch-comparison
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "branchId": "uuid1",
    "branchName": "Downtown",
    "visitCount": 1250,
    "uniqueCustomers": 456,
    "totalRevenue": 45300.50,
    "averageOrderValue": 36.24,
    "totalDotsIssued": 8950
  },
  {
    "branchId": "uuid2",
    "branchName": "Midtown",
    "visitCount": 890,
    "uniqueCustomers": 312,
    "totalRevenue": 32100.00,
    "averageOrderValue": 36.07,
    "totalDotsIssued": 6230
  }
]
```

---

## Data Export Endpoints (NEW)

### Export Customers
```
GET /api/export/customers?from=2025-01-01&to=2025-01-31
Authorization: Bearer {token}

Response: 200 OK + CSV File
Content-Type: text/csv
Content-Disposition: attachment; filename="customers_20250130_153022.csv"

CustomerId,Phone,Name,Email,Birthday,Tier,LifetimeDots,CurrentDots,CreatedAt
"uuid1","+16175551234","John Doe","john@example.com","1990-05-15","Gold","2500.50","1200.25","2025-01-15T10:30:00Z"
...
```

### Export Visits
```
GET /api/export/visits?from=2025-01-01&to=2025-01-31&customerId=uuid
Authorization: Bearer {token}

Response: 200 OK + CSV File
Content-Type: text/csv
Content-Disposition: attachment; filename="visits_20250130_153022.csv"

VisitId,CustomerId,BranchName,Amount,FinalAmount,DotsEarned,Discount,CreatedAt
"uuid1","uuid-cust","Downtown Cafe","50.00","47.50","95","2.50","2025-01-15T14:30:00Z"
...
```

### Export Rewards
```
GET /api/export/rewards
Authorization: Bearer {token}

Response: 200 OK + CSV File
Content-Type: text/csv
Content-Disposition: attachment; filename="rewards_20250130_153022.csv"

RewardId,Name,CostDots,CreatedAt
"uuid1","Free Coffee","150","2025-01-10T09:00:00Z"
"uuid2","Free Pastry","100","2025-01-10T09:00:00Z"
...
```

### Export Redemptions
```
GET /api/export/redemptions?from=2025-01-01&to=2025-01-31
Authorization: Bearer {token}

Response: 200 OK + CSV File
Content-Type: text/csv
Content-Disposition: attachment; filename="redemptions_20250130_153022.csv"

RedemptionId,CustomerId,RewardName,RewardCost,CreatedAt
"uuid1","uuid-cust","Free Coffee","150","2025-01-15T16:45:00Z"
...
```

---

## Deal Rule Engine - New Conditions (Updated)

### Birthday Month Rule
Applies deal only during customer's birth month.

```json
{
  "name": "Birthday Bonus Deal",
  "rules": {
    "isBirthdayMonth": true,
    "multiplier": 2.0
  },
  "actions": {
    "dotsMultiplier": 2.0
  }
}
```

### Exact Tier Match Rule
Applies deal only to customers with matching tier.

```json
{
  "name": "Gold VIP Deal",
  "rules": {
    "tierMatch": "Gold",
    "multiplier": 1.5
  },
  "actions": {
    "dotsMultiplier": 1.5
  }
}
```

### Minimum Tier Rule
Applies deal to customers at or above tier level.

```json
{
  "name": "Silver+ Member Deal",
  "rules": {
    "tierMinimum": "Silver",
    "multiplier": 1.3
  },
  "actions": {
    "dotsMultiplier": 1.3
  }
}
```

Tier Hierarchy: Bronze (level 1) → Silver (level 2) → Gold (level 3)

---

## Existing Endpoints (Reference)

### Customer Profile
```
PUT /api/customer/{id}
GET /api/customer/{id}/history
```

### Analytics (Original)
```
GET /api/analytics/summary
GET /api/analytics/daily-revenue
GET /api/analytics/top-customers
GET /api/analytics/deal-performance
GET /api/analytics/customer-retention
GET /api/analytics/category-performance
```

### Core Operations
```
POST /api/auth/register
POST /api/auth/login
POST /api/visits
POST /api/deals
GET  /api/customers
GET  /api/branches
```

---

## Error Responses

All endpoints return standardized error responses:

```
400 Bad Request
{
  "errors": ["Field validation error"]
}

401 Unauthorized
{
  "message": "Invalid or missing authentication token"
}

403 Forbidden
{
  "message": "Insufficient permissions for this operation"
}

404 Not Found
{
  "message": "Resource not found"
}

500 Internal Server Error
{
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Standard Endpoints**: 100 requests per minute
- **Auth Endpoints**: 5 requests per minute
- **Export Endpoints**: 100 requests per minute

---

## CSV Export Features

- ✅ RFC 4180 compliant formatting
- ✅ Proper quoting for special characters
- ✅ Timestamp-based filename: `{type}_{YYYYMMDD}_{HHmmss}.csv`
- ✅ Date range filtering supported
- ✅ UTF-8 encoding
- ✅ Soft-delete aware (excludes deleted records)

---

## Testing Endpoints with cURL

### Send Email Notification
```bash
curl -X POST http://localhost:5082/api/notifications/send-welcome \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId":"00000000-0000-0000-0000-000000000001"}'
```

### Export Customers to CSV
```bash
curl -X GET "http://localhost:5082/api/export/customers?from=2025-01-01&to=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o customers.csv
```

### Get Branch Analytics
```bash
curl -X GET http://localhost:5082/api/analytics/branch/00000000-0000-0000-0000-000000000002/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Last Updated**: 2025-01-30  
**API Version**: 1.0  
**Status**: Production Ready
