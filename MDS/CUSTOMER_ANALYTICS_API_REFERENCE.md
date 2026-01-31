# Customer Analytics API Reference

## Base URL
```
https://api.dotly.com/api/customeranalytics
```

## Authentication
All endpoints require JWT Bearer token in Authorization header:
```
Authorization: Bearer {token}
```

## Response Format
All responses follow this structure:
```json
{
  "data": { /* response data */ },
  "error": null,
  "timestamp": "2025-01-30T12:00:00Z"
}
```

---

## CHURN PREDICTION ENDPOINTS

### 1. Get Customer Churn Risk
```
GET /churn-risk/{customerId}
```

**Description**: Get churn risk score for a specific customer

**Parameters**:
- `customerId` (path, required): Customer ID (UUID)

**Response**:
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "customerId": "uuid",
  "churnRiskScore": 0.75,
  "daysSinceLastVisit": 45,
  "averageDaysBetweenVisits": 14,
  "averageMonthlySpendings": 125.50,
  "monthlySpendingTrend": -0.15,
  "riskFactors": [
    {
      "factor": "inactivity",
      "contribution": 0.30,
      "details": "45 days since last visit"
    },
    {
      "factor": "spending_decline",
      "contribution": 0.20,
      "details": "15% decrease from average"
    }
  ],
  "isChurnRisk": true,
  "predictedAt": "2025-01-30T10:00:00Z",
  "updatedAt": "2025-01-30T10:00:00Z"
}
```

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Customer not found
- `401 Unauthorized`: Invalid token

---

### 2. Get All At-Risk Customers
```
GET /churn-risk-customers?riskThreshold=0.7
```

**Description**: Get list of customers exceeding risk threshold

**Parameters**:
- `riskThreshold` (query, optional): Risk threshold 0.0-1.0, default 0.7

**Response**:
```json
{
  "riskThreshold": 0.7,
  "customerCount": 45,
  "customers": [
    {
      "customerId": "uuid",
      "name": "John Doe",
      "churnScore": 0.85,
      "daysSinceVisit": 60
    },
    {
      "customerId": "uuid",
      "name": "Jane Smith",
      "churnScore": 0.72,
      "daysSinceVisit": 35
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Invalid token

---

### 3. Recalculate All Churn Risks
```
POST /churn-risk/recalculate
```

**Description**: Trigger batch churn recalculation for all customers

**Body**: Empty or `{}`

**Response**:
```json
{
  "customersRecalculated": 1250
}
```

**Notes**:
- Async operation (returns immediately)
- Typically completes in 30-60 seconds
- Can be run weekly as scheduled job

**Status Codes**:
- `200 OK`: Recalculation started
- `401 Unauthorized`: Invalid token

---

### 4. Export Churn Risk Data
```
GET /churn-risk/export?riskThreshold=0.7
```

**Description**: Export at-risk customers as CSV file

**Parameters**:
- `riskThreshold` (query, optional): Risk threshold, default 0.7

**Response**: CSV file (text/csv)
```
CustomerId,Name,ChurnScore,DaysSinceVisit
uuid1,John Doe,0.850,60
uuid2,Jane Smith,0.725,35
```

**Headers**:
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="churn-risk-2025-01-30.csv"`

**Status Codes**:
- `200 OK`: CSV file
- `401 Unauthorized`: Invalid token

---

## SEGMENTATION ENDPOINTS

### 5. Create Customer Segment
```
POST /segments
```

**Description**: Create new customer segment with JSON criteria

**Body**:
```json
{
  "name": "VIP Customers",
  "description": "High-value loyal customers",
  "criteriaJson": "{\"minLifetimeSpend\": 2000, \"minVisits\": 20, \"maxDaysSinceVisit\": 30}"
}
```

**Criteria Schema**:
```json
{
  "minLifetimeSpend": 0,           // Minimum total customer spend
  "minVisits": 0,                  // Minimum visit count
  "maxDaysSinceVisit": 365         // Maximum days since last visit
}
```

**Response**:
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "name": "VIP Customers",
  "description": "High-value loyal customers",
  "criteria": "{\"minLifetimeSpend\": 2000, ...}",
  "customerCount": 245,
  "isActive": true,
  "createdAt": "2025-01-30T10:00:00Z",
  "updatedAt": "2025-01-30T10:00:00Z"
}
```

**Status Codes**:
- `201 Created`: Segment created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Invalid token

---

### 6. List All Segments
```
GET /segments
```

**Description**: Get all customer segments for tenant

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "VIP Customers",
    "description": "High-value loyal customers",
    "customerCount": 245,
    "isActive": true,
    "createdAt": "2025-01-30T10:00:00Z"
  },
  {
    "id": "uuid",
    "name": "At-Risk Customers",
    "description": "Churn risk above 60%",
    "customerCount": 120,
    "isActive": true,
    "createdAt": "2025-01-29T14:30:00Z"
  }
]
```

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Invalid token

---

### 7. Get Segment Details
```
GET /segments/{segmentId}
```

**Description**: Get segment details with member list

**Parameters**:
- `segmentId` (path, required): Segment ID (UUID)

**Response**:
```json
{
  "id": "uuid",
  "name": "VIP Customers",
  "description": "High-value loyal customers",
  "customerCount": 245,
  "isActive": true,
  "memberCount": 245,
  "members": [
    {
      "customerId": "uuid",
      "name": "Alice Johnson",
      "lifetimeSpend": 3500.00,
      "visitCount": 25
    },
    {
      "customerId": "uuid",
      "name": "Bob Wilson",
      "lifetimeSpend": 2750.00,
      "visitCount": 22
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Segment not found
- `401 Unauthorized`: Invalid token

---

### 8. Repopulate Segment
```
POST /segments/{segmentId}/repopulate
```

**Description**: Re-evaluate segment membership based on current criteria

**Parameters**:
- `segmentId` (path, required): Segment ID (UUID)

**Body**: Empty or `{}`

**Response**:
```json
{
  "message": "Segment repopulated",
  "customerCount": 250
}
```

**Use Cases**:
- After customer visits/purchases
- After criteria adjustment
- Scheduled re-evaluation

**Status Codes**:
- `200 OK`: Repopulated
- `404 Not Found`: Segment not found
- `401 Unauthorized`: Invalid token

---

### 9. Export Segment Members
```
GET /segments/{segmentId}/export
```

**Description**: Export segment members as CSV file

**Parameters**:
- `segmentId` (path, required): Segment ID (UUID)

**Response**: CSV file (text/csv)
```
CustomerId,Name,LifetimeSpend,VisitCount
uuid1,Alice Johnson,3500.00,25
uuid2,Bob Wilson,2750.00,22
```

**Headers**:
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="segment-VIP-Customers-2025-01-30.csv"`

**Status Codes**:
- `200 OK`: CSV file
- `404 Not Found`: Segment not found
- `401 Unauthorized`: Invalid token

---

## COHORT ANALYSIS ENDPOINTS

### 10. Get All Cohorts Overview
```
GET /cohorts
```

**Description**: Get all cohorts with retention metrics

**Response**:
```json
[
  {
    "cohortPeriod": "2025-01",
    "initialSize": 156,
    "week1Retention": "84.5%",
    "week4Retention": "71.2%"
  },
  {
    "cohortPeriod": "2024-12",
    "initialSize": 142,
    "week1Retention": "87.3%",
    "week4Retention": "68.9%"
  }
]
```

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Invalid token

---

### 11. Get Cohort Retention Curve
```
GET /cohorts/{cohortId}/retention
```

**Description**: Get detailed retention curve for specific cohort (weeks 0-26)

**Parameters**:
- `cohortId` (path, required): Cohort ID (UUID)

**Response**:
```json
[
  {
    "weeksAfterAcquisition": 0,
    "retentionRate": "100.0%",
    "activeCustomers": 156
  },
  {
    "weeksAfterAcquisition": 1,
    "retentionRate": "84.5%",
    "activeCustomers": 132
  },
  {
    "weeksAfterAcquisition": 4,
    "retentionRate": "71.2%",
    "activeCustomers": 111
  },
  {
    "weeksAfterAcquisition": 26,
    "retentionRate": "45.3%",
    "activeCustomers": 71
  }
]
```

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Cohort not found
- `401 Unauthorized`: Invalid token

---

## RETENTION & ENGAGEMENT ENDPOINTS

### 12. Get Retention Metrics
```
GET /retention-metrics?monthsBack=3
```

**Description**: Get customer retention trends over time period

**Parameters**:
- `monthsBack` (query, optional): Months to look back, default 3

**Response**:
```json
[
  {
    "snapshotDate": "2025-01-30T00:00:00Z",
    "totalCustomers": 5000,
    "activeCustomers": 4250,
    "averageSpend": 125.50,
    "retentionRate": 85.0
  },
  {
    "snapshotDate": "2025-01-29T00:00:00Z",
    "totalCustomers": 4998,
    "activeCustomers": 4240,
    "averageSpend": 124.75,
    "retentionRate": 84.8
  }
]
```

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Invalid token

---

### 13. Get Deal Engagement Statistics
```
GET /deal-engagement
```

**Description**: Get engagement metrics for all deals

**Response**:
```json
[
  {
    "dealName": "Birthday Deal",
    "uniqueCustomers": 1200,
    "totalEngagements": 1850,
    "totalBonusIssued": 3500.00,
    "engagementRate": 0.24
  },
  {
    "dealName": "Streak Bonus",
    "uniqueCustomers": 980,
    "totalEngagements": 2340,
    "totalBonusIssued": 2800.00,
    "engagementRate": 0.196
  }
]
```

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Invalid token

---

## CUSTOMER TAGS ENDPOINTS

### 14. Add Customer Tag
```
POST /customers/{customerId}/tags
```

**Description**: Add tag to customer

**Parameters**:
- `customerId` (path, required): Customer ID (UUID)

**Body**:
```json
{
  "tag": "VIP",
  "reason": "Lifetime spend > $5000",
  "confidence": 0.95,
  "expiresAt": "2025-02-28T23:59:59Z"
}
```

**Fields**:
- `tag` (required): Tag name
- `reason` (required): Why tag was added
- `confidence` (optional): 0.0-1.0, default 1.0
- `expiresAt` (optional): ISO date string, auto-delete when reached

**Response**:
```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "customerId": "uuid",
  "tag": "VIP",
  "reason": "Lifetime spend > $5000",
  "confidence": 0.95,
  "addedAt": "2025-01-30T10:00:00Z",
  "expiresAt": "2025-02-28T23:59:59Z"
}
```

**Status Codes**:
- `201 Created`: Tag added
- `400 Bad Request`: Invalid input
- `404 Not Found`: Customer not found
- `401 Unauthorized`: Invalid token

---

### 15. Get Customer Tags
```
GET /customers/{customerId}/tags
```

**Description**: Get all active tags for customer

**Parameters**:
- `customerId` (path, required): Customer ID (UUID)

**Response**:
```json
[
  {
    "tag": "VIP",
    "reason": "Lifetime spend > $5000",
    "confidence": 0.95,
    "addedAt": "2025-01-30T10:00:00Z",
    "expiresAt": "2025-02-28T23:59:59Z"
  },
  {
    "tag": "Loyal",
    "reason": "20+ visits in past 12 months",
    "confidence": 0.85,
    "addedAt": "2025-01-15T14:30:00Z",
    "expiresAt": null
  }
]
```

**Note**: Expired tags are automatically excluded

**Status Codes**:
- `200 OK`: Success
- `404 Not Found`: Customer not found
- `401 Unauthorized`: Invalid token

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Segment name is required",
    "field": "name"
  }
}
```

### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authorization token"
  }
}
```

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Segment not found",
    "resourceId": "uuid"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "uuid"
  }
}
```

---

## RATE LIMITING

All endpoints are subject to rate limiting:
- **Default**: 100 requests per minute per IP
- **Auth endpoints**: 5 requests per minute per IP

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 1675068000
```

### 429 Too Many Requests
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "retryAfter": 60
  }
}
```

---

## PAGINATION

Endpoints returning lists support pagination:
- `pageNumber` (query, optional): Page number, default 1
- `pageSize` (query, optional): Page size, default 50, max 500

Example:
```
GET /segments?pageNumber=2&pageSize=25
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "pageNumber": 2,
    "pageSize": 25,
    "totalCount": 156,
    "totalPages": 7
  }
}
```

---

## FILTERING & SORTING

### Filter Example
```
GET /churn-risk-customers?riskThreshold=0.8&daysInactive=30
```

### Sort Example
```
GET /cohorts?sortBy=week1Retention&sortOrder=desc
```

---

## CHANGELOG

### Version 1.0.0 (2025-01-30)
- Initial release with 15 endpoints
- Churn prediction, segmentation, cohort analysis
- Customer tags and engagement tracking
- CSV export for all major data types

### Planned for Future Releases
- A/B testing endpoints
- Real-time webhook notifications
- Custom report builder API
- Machine learning predictions
- Data streaming API

---

**Last Updated**: 2025-01-30
**API Version**: 1.0.0
**Status**: Production Ready
