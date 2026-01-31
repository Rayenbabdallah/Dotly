# Customer Analytics - Implementation Guide

## Overview

The Customer Analytics module provides deep insights into customer behavior, lifecycle, and engagement patterns. It enables managers and owners to make data-driven decisions about customer retention, targeting, and deal effectiveness.

## Features Implemented

### 1. Churn Prediction
**Purpose**: Identify customers at risk of becoming inactive

**How It Works**:
- Analyzes 100 most recent visits per customer
- Calculates risk score (0.0-1.0) based on:
  - **Inactivity**: 30+ days = 0.3 risk, 60+ days = additional 0.2 risk
  - **Spending Decline**: >20% decrease = 0.2 risk
  - **Visit Frequency**: Days since visit > 1.5× average = 0.15 risk
  - **Low Engagement**: <3 visits = 0.15 risk
- Generates risk factors JSON array for detailed analysis

**Risk Levels**:
- **Critical** (>80%): Immediate intervention needed
- **High** (60-80%): Targeted retention campaign
- **Medium** (40-60%): Monitor and re-engage

**Endpoints**:
```
GET  /api/customeranalytics/churn-risk/{customerId}        # Single customer
GET  /api/customeranalytics/churn-risk-customers             # List all at-risk
POST /api/customeranalytics/churn-risk/recalculate           # Batch update
GET  /api/customeranalytics/churn-risk/export               # Export as CSV
```

### 2. Customer Segmentation
**Purpose**: Group customers by behavior/value for targeted campaigns

**How It Works**:
- Create segments with JSON-based criteria:
  - `minLifetimeSpend`: Minimum customer value
  - `minVisits`: Minimum visit count
  - `maxDaysSinceVisit`: Maximum inactivity threshold
- Auto-populate segment based on matching criteria
- Dynamic re-population on demand

**Example Criteria**:
```json
{
  "minLifetimeSpend": 500,
  "minVisits": 10,
  "maxDaysSinceVisit": 30
}
```

**Endpoints**:
```
POST /api/customeranalytics/segments                        # Create
GET  /api/customeranalytics/segments                        # List all
GET  /api/customeranalytics/segments/{id}                   # Get details + members
POST /api/customeranalytics/segments/{id}/repopulate        # Re-evaluate members
GET  /api/customeranalytics/segments/{id}/export            # Export as CSV
```

### 3. Cohort Analysis
**Purpose**: Track customer groups by acquisition period to measure retention

**How It Works**:
- Group customers by signup month/quarter/year
- Calculate retention curves (weeks 0-26 after acquisition)
- Compare cohort performance
- Track initial size vs active retention

**Granularities**:
- **Month**: "2025-01", "2025-02", etc.
- **Quarter**: "2025-Q1", "2025-Q2", etc.
- **Year**: "2025", "2024", etc.

**Endpoints**:
```
GET /api/customeranalytics/cohorts                          # All cohorts overview
GET /api/customeranalytics/cohorts/{id}/retention           # Retention curve
```

### 4. Customer Tagging
**Purpose**: Mark customers with labels for identification and targeting

**Tags**:
- **VIP**: High-value customers
- **Churn-Risk**: At-risk customers (auto-generated)
- **Loyal**: Consistent repeat customers
- **New**: Recent acquisitions
- Custom tags with confidence scores

**Features**:
- Confidence scoring (0.0-1.0)
- Automatic expiration
- Tag history and audit trail

**Endpoints**:
```
POST /api/customeranalytics/customers/{customerId}/tags     # Add tag
GET  /api/customeranalytics/customers/{customerId}/tags     # Get tags
```

### 5. Retention Metrics
**Purpose**: Track customer activity and spending trends

**Metrics**:
- Total visits over period
- Lifetime spend vs period spend
- Activity status (active/inactive)
- Days since last visit
- Retention rate trends

**Endpoints**:
```
GET /api/customeranalytics/retention-metrics?monthsBack=3   # Last 3 months
```

### 6. Deal Engagement Tracking
**Purpose**: Measure deal effectiveness and customer response

**Metrics**:
- Unique customers per deal
- Total engagements/redemptions
- Bonus value issued
- Engagement rate (% of customer base)
- Deal type performance comparison

**Endpoints**:
```
GET /api/customeranalytics/deal-engagement                  # All deals
```

### 7. A/B Testing Framework
**Purpose**: Test deal variations and optimize performance

**Features**:
- Create test with variant A and B
- Random customer assignment
- Track conversion rates
- Calculate statistical significance
- Compare revenue per variant

**Endpoints** (Available in future expansion):
```
POST /api/customeranalytics/ab-tests                        # Create test
GET  /api/customeranalytics/ab-tests                        # List tests
GET  /api/customeranalytics/ab-tests/{id}                   # Get results
POST /api/customeranalytics/ab-tests/{id}/assign-customer   # Assign customer
POST /api/customeranalytics/ab-tests/{id}/mark-conversion   # Track conversion
```

## Database Schema

### Core Entities

**ChurnPrediction**
```csharp
public Guid Id { get; set; }
public Guid TenantId { get; set; }
public Guid CustomerId { get; set; }
public decimal ChurnRiskScore { get; set; }        // 0.0-1.0
public int DaysSinceLastVisit { get; set; }
public int AverageDaysBetweenVisits { get; set; }
public decimal AverageMonthlySpendings { get; set; }
public decimal MonthlySpendingTrend { get; set; }  // -1.0 to 1.0
public string RiskFactors { get; set; }            // JSON array
public bool IsChurnRisk { get; set; }
public DateTime PredictedAt { get; set; }
public DateTime UpdatedAt { get; set; }
```

**CustomerSegment**
```csharp
public Guid Id { get; set; }
public Guid TenantId { get; set; }
public string Name { get; set; }
public string Description { get; set; }
public string Criteria { get; set; }               // JSON with criteria
public int CustomerCount { get; set; }             // Cache
public bool IsActive { get; set; }
public DateTime CreatedAt { get; set; }
public DateTime UpdatedAt { get; set; }
```

**CohortGroup**
```csharp
public Guid Id { get; set; }
public Guid TenantId { get; set; }
public string CohortPeriod { get; set; }           // "2025-01", "2025-Q1", "2025"
public string Granularity { get; set; }            // "Month", "Quarter", "Year"
public int MemberCount { get; set; }
public DateTime StartDate { get; set; }
public DateTime EndDate { get; set; }
```

**CustomerTag**
```csharp
public Guid Id { get; set; }
public Guid TenantId { get; set; }
public Guid CustomerId { get; set; }
public string Tag { get; set; }                    // e.g., "VIP"
public string Reason { get; set; }
public decimal Confidence { get; set; }            // 0.0-1.0
public DateTime AddedAt { get; set; }
public DateTime? ExpiresAt { get; set; }
```

**RetentionSnapshot**
```csharp
public Guid Id { get; set; }
public Guid TenantId { get; set; }
public Guid CustomerId { get; set; }
public DateTime SnapshotDate { get; set; }
public int TotalVisits { get; set; }
public decimal LifetimeSpend { get; set; }
public int VisitsThisPeriod { get; set; }
public decimal SpendThisPeriod { get; set; }
public bool IsActive { get; set; }
public int DaysSinceLastVisit { get; set; }
```

**DealEngagement**
```csharp
public Guid Id { get; set; }
public Guid TenantId { get; set; }
public Guid CustomerId { get; set; }
public Guid DealId { get; set; }
public string DealType { get; set; }               // e.g., "Streak", "Tier"
public string DealName { get; set; }
public int EngagementCount { get; set; }
public decimal TotalBonusEarned { get; set; }
public DateTime FirstEngagedAt { get; set; }
public DateTime LastEngagedAt { get; set; }
```

## Frontend Components

### CustomerAnalyticsDashboard.tsx
Main dashboard with 5 tabs:
1. **Overview**: Quick statistics and KPIs
2. **Churn Prediction**: At-risk customer list with scores
3. **Segments**: Active customer segments and member counts
4. **Cohorts**: Retention curves and cohort comparison
5. **Deal Engagement**: Deal performance by customer response

**Features**:
- Real-time data loading
- Responsive grid layout
- Risk level visualization (color-coded)
- Progress bars for retention rates
- Tab-based organization

### SegmentBuilder.tsx
Modal component for creating customer segments
- Segment name and description
- Interactive criteria sliders
- Live criteria summary
- Success/error handling

### ChurnPredictionDetail.tsx
Modal for detailed churn analysis
- Risk threshold adjustment
- Filter by risk level (Critical/High/Medium)
- Statistics breakdown
- Customer list with scores
- CSV export functionality

## API Integration Functions

### Churn Endpoints
```typescript
// Get single customer churn risk
getChurnRisk(customerId: string)

// List all at-risk customers
getChurnRiskCustomers(riskThreshold?: number = 0.7)

// Recalculate all risks
recalculateChurnRisk()

// Export at-risk customers
exportChurnRisk(riskThreshold?: number = 0.7)
```

### Segment Endpoints
```typescript
// Create new segment
createSegment(data: CreateSegmentRequest)

// List all segments
getSegments()

// Get segment details
getSegment(segmentId: string)

// Re-populate segment
repopulateSegment(segmentId: string)

// Export segment members
exportSegment(segmentId: string)
```

### Cohort Endpoints
```typescript
// Get all cohorts overview
getCohorts()

// Get retention curve
getCohortRetention(cohortId: string)
```

### Other Endpoints
```typescript
// Retention metrics
getRetentionMetrics(monthsBack?: number = 3)

// Deal engagement stats
getDealEngagement()

// Customer tags
addCustomerTag(customerId: string, data: AddTagRequest)
getCustomerTags(customerId: string)
```

## Usage Examples

### 1. Creating a VIP Segment
```typescript
const segment = await createSegment({
  name: "VIP Customers",
  description: "High-value loyal customers",
  criteriaJson: JSON.stringify({
    minLifetimeSpend: 2000,
    minVisits: 20,
    maxDaysSinceVisit: 30
  })
});
```

### 2. Identifying At-Risk Customers
```typescript
const churnData = await getChurnRiskCustomers(0.8); // 80%+ risk
console.log(`${churnData.customerCount} critical churn risks`);

churnData.customers.forEach(customer => {
  console.log(`${customer.name}: ${customer.churnScore * 100}% risk`);
});
```

### 3. Analyzing Cohort Retention
```typescript
const cohorts = await getCohorts();

cohorts.forEach(cohort => {
  console.log(`Cohort ${cohort.cohortPeriod}`);
  console.log(`  Week 1 Retention: ${cohort.week1Retention}`);
  console.log(`  Week 4 Retention: ${cohort.week4Retention}`);
});
```

### 4. Tagging Customers
```typescript
await addCustomerTag(customerId, {
  tag: "VIP",
  reason: "Lifetime spend > $5000",
  confidence: 0.95,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
});
```

## Performance Optimization

### Database Indexes
- TenantId (all tables)
- CustomerId (churn, tags, engagement, retention)
- DealId (engagement)
- SegmentId (memberships)
- CohortGroupId (memberships)

### Query Optimization
- Batch churn calculation with async/await
- Cohort analysis uses indexed date ranges
- Segment population pre-filters large datasets
- Engagement data grouped and aggregated

### Caching Strategy
- CustomerCount cached on segments (updated on repopulate)
- Cohort member count cached
- Churn calculations cached (update on POST)

## Future Enhancements

### Phase 2
- [ ] A/B testing endpoints implementation
- [ ] Email notification on churn risk
- [ ] Segment-based campaign creation
- [ ] Revenue attribution by cohort
- [ ] Customer lifetime value prediction

### Phase 3
- [ ] Machine learning churn prediction
- [ ] Automated segment re-evaluation
- [ ] Real-time dashboards
- [ ] Mobile app support
- [ ] Advanced filtering and search

### Phase 4
- [ ] Predictive analytics
- [ ] Custom report builder
- [ ] Integration with external CRM
- [ ] API rate limiting per plan
- [ ] Data export to cloud storage

## Security & Compliance

### Data Privacy
- Soft delete for compliance
- Audit logging for all analytics queries
- Tenant data isolation
- No PII in logs

### Access Control
- [Authorize] attribute on all endpoints
- TenantId validation on requests
- Role-based data filtering

### Data Retention
- Churn predictions updated weekly
- Retention snapshots archived monthly
- Tags expire automatically
- Audit logs retained 1 year

## Troubleshooting

### Churn Scores Not Updating
1. Check if visits are being recorded
2. Run recalculate endpoint: `POST /api/customeranalytics/churn-risk/recalculate`
3. Verify database connectivity

### Segment Members Empty
1. Check criteria JSON syntax
2. Run repopulate: `POST /api/customeranalytics/segments/{id}/repopulate`
3. Verify customer data exists in database

### High Query Latency
1. Check database indexes are created
2. Monitor active database connections
3. Consider batching API calls
4. Use export endpoints for large datasets

## Support & Contact

For issues or feature requests:
- Create GitHub issue
- Contact development team
- Review FEATURE_ROADMAP.md for planned features
