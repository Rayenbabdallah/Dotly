# Performance Benchmarking Guide

## Overview

This document provides guidelines and tools for performance benchmarking across the Dotly platform.

## Performance Targets

### API Response Times (95th percentile)

| Endpoint Category | Target | Critical |
|-------------------|--------|----------|
| Authentication | < 200ms | < 500ms |
| Customer Wallet | < 150ms | < 300ms |
| Transaction Processing | < 500ms | < 1000ms |
| Deal Evaluation | < 300ms | < 600ms |
| Analytics Queries | < 1000ms | < 2000ms |
| Data Export (GDPR) | < 2000ms | < 5000ms |

### Database Performance

| Operation | Target | Critical |
|-----------|--------|----------|
| Customer lookup | < 10ms | < 50ms |
| Transaction insert | < 20ms | < 100ms |
| Deal evaluation query | < 50ms | < 200ms |
| Analytics aggregation | < 500ms | < 2000ms |

### Frontend Performance

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | < 3s |
| Time to Interactive | < 3s | < 5s |
| Largest Contentful Paint | < 2.5s | < 4s |
| Cumulative Layout Shift | < 0.1 | < 0.25 |

## BenchmarkDotNet Tests

### Setup

```csharp
// Dotly.api.Tests/Benchmarks/DealEngineBenchmarks.cs
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;

[MemoryDiagnoser]
[SimpleJob(warmupCount: 3, targetCount: 10)]
public class DealEngineBenchmarks
{
    private ApplicationDbContext _context;
    private DealService _service;

    [GlobalSetup]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase("BenchmarkDb")
            .Options;
        
        _context = new ApplicationDbContext(options);
        _service = new DealService(_context, null);
        
        // Seed test data
        SeedTestData();
    }

    [Benchmark]
    public async Task EvaluateDeals_SingleCustomer_10Deals()
    {
        await _service.EvaluateDealsAsync(1, 100m, 1000);
    }

    [Benchmark]
    public async Task EvaluateDeals_SingleCustomer_100Deals()
    {
        // Add 100 deals to context
        await _service.EvaluateDealsAsync(1, 100m, 1000);
    }

    [Benchmark]
    public async Task ProcessTransaction_WithDealEvaluation()
    {
        var visit = new Visit
        {
            CustomerId = 1,
            Amount = 50m,
            DotsEarned = 500
        };
        
        _context.Visits.Add(visit);
        await _context.SaveChangesAsync();
        await _service.EvaluateDealsAsync(1, 50m, 500);
    }
}

// Run benchmarks:
// dotnet run -c Release --project Dotly.api.Tests/Benchmarks
```

### Sample Results

```
|                      Method |     Mean |    Error |   StdDev |   Gen 0 | Allocated |
|---------------------------- |---------:|---------:|---------:|--------:|----------:|
| EvaluateDeals_10Deals       |  2.45 ms | 0.048 ms | 0.045 ms |  7.8125 |     32 KB |
| EvaluateDeals_100Deals      | 15.32 ms | 0.298 ms | 0.279 ms | 62.5000 |    256 KB |
| ProcessTransaction          |  8.67 ms | 0.172 ms | 0.161 ms | 15.6250 |     64 KB |
```

## Database Query Profiling

### Enable Query Logging

```csharp
// Program.cs
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString);
    
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
        options.LogTo(Console.WriteLine, LogLevel.Information);
    }
});
```

### Analyze Slow Queries

```sql
-- PostgreSQL: Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 100; -- Log queries > 100ms
SELECT pg_reload_conf();

-- View slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;

-- Missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY abs(correlation) ASC
LIMIT 20;
```

### Query Optimization Examples

```csharp
// ❌ BAD: N+1 query problem
var customers = await _context.Customers.ToListAsync();
foreach (var customer in customers)
{
    var visits = await _context.Visits
        .Where(v => v.CustomerId == customer.Id)
        .ToListAsync(); // Separate query for each customer!
}

// ✅ GOOD: Eager loading
var customers = await _context.Customers
    .Include(c => c.Visits)
    .ToListAsync(); // Single query with JOIN

// ❌ BAD: Loading unnecessary data
var customers = await _context.Customers
    .ToListAsync(); // Loads all columns

// ✅ GOOD: Projection
var customers = await _context.Customers
    .Select(c => new { c.Id, c.Name, c.Email })
    .ToListAsync(); // Only needed columns

// ❌ BAD: Client-side evaluation
var filtered = await _context.Customers
    .ToListAsync(); // Load all
var result = filtered.Where(c => c.TotalSpent > 100); // Filter in memory

// ✅ GOOD: Server-side filtering
var result = await _context.Customers
    .Where(c => c.TotalSpent > 100) // Filter in SQL
    .ToListAsync();
```

## API Load Testing with k6

### Basic Performance Test

```javascript
// tests/performance/api-benchmark.js
import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

const loginTrend = new Trend('login_duration');
const walletTrend = new Trend('wallet_duration');
const transactionTrend = new Trend('transaction_duration');

export const options = {
  vus: 50,
  duration: '5m',
  thresholds: {
    'login_duration': ['p(95)<200'],
    'wallet_duration': ['p(95)<150'],
    'transaction_duration': ['p(95)<500'],
  },
};

export default function () {
  // Login
  const loginStart = new Date();
  const loginRes = http.post('http://localhost:5000/api/auth/login', JSON.stringify({
    email: 'bench@test.com',
    password: 'Test@123'
  }), { headers: { 'Content-Type': 'application/json' } });
  loginTrend.add(new Date() - loginStart);
  
  check(loginRes, { 'login status 200': (r) => r.status === 200 });
  const token = loginRes.json('token');
  
  // Wallet lookup
  const walletStart = new Date();
  const walletRes = http.get('http://localhost:5000/api/customer/wallet/1', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  walletTrend.add(new Date() - walletStart);
  
  check(walletRes, { 'wallet status 200': (r) => r.status === 200 });
  
  // Process transaction
  const txStart = new Date();
  const txRes = http.post('http://localhost:5000/api/visit/process', JSON.stringify({
    customerId: 1,
    amount: 50.00
  }), { headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json' 
  }});
  transactionTrend.add(new Date() - txStart);
  
  check(txRes, { 'transaction status 200': (r) => r.status === 200 || r.status === 201 });
}
```

### Run Benchmarks

```bash
# Run performance test
k6 run tests/performance/api-benchmark.js

# Run with specific VUs and duration
k6 run --vus 100 --duration 10m tests/performance/api-benchmark.js

# Output results to JSON
k6 run --out json=benchmark-results.json tests/performance/api-benchmark.js
```

## Frontend Performance

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
        working-directory: ./dotly-ui
      - run: npm run build
        working-directory: ./dotly-ui
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:5173
            http://localhost:5173/login
            http://localhost:5173/wallet
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Web Vitals Monitoring

```typescript
// dotly-ui/src/lib/performance.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to analytics service
  console.log(metric);
  
  // Or send to backend
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
    headers: { 'Content-Type': 'application/json' }
  });
}

// Measure all Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Performance Optimization Checklist

### Backend

- [ ] Database indexes on all foreign keys
- [ ] Composite indexes on frequently queried columns
- [ ] Eager loading for related entities (`.Include()`)
- [ ] Pagination for large result sets
- [ ] Response compression enabled
- [ ] Output caching for read-heavy endpoints
- [ ] Connection pooling configured
- [ ] Async/await used consistently
- [ ] N+1 queries eliminated

### Frontend

- [ ] Code splitting by route
- [ ] Lazy loading for heavy components
- [ ] Image optimization (WebP, lazy loading)
- [ ] CSS minification and bundling
- [ ] JavaScript minification
- [ ] Tree shaking enabled
- [ ] Service worker for caching
- [ ] CDN for static assets
- [ ] Critical CSS inlined

### Database

- [ ] Proper indexing strategy
- [ ] Query execution plans reviewed
- [ ] Connection pooling configured
- [ ] Autovacuum enabled
- [ ] Statistics up to date
- [ ] Partition large tables
- [ ] Archive old data

## Continuous Monitoring

### Application Insights

```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry();

// Custom metrics
var telemetryClient = app.Services.GetRequiredService<TelemetryClient>();

app.Use(async (context, next) =>
{
    var stopwatch = Stopwatch.StartNew();
    await next();
    stopwatch.Stop();
    
    telemetryClient.TrackMetric("request_duration", stopwatch.ElapsedMilliseconds);
});
```

### Prometheus Metrics

```csharp
// Add prometheus-net package
using Prometheus;

var app = builder.Build();

app.UseMetricServer(); // /metrics endpoint
app.UseHttpMetrics();  // Track HTTP metrics

// Custom counters
var requestCounter = Metrics.CreateCounter("dotly_requests_total", "Total requests");
var dealEvaluationDuration = Metrics.CreateHistogram("dotly_deal_evaluation_duration", "Deal evaluation time");

app.Use(async (context, next) =>
{
    requestCounter.Inc();
    using (dealEvaluationDuration.NewTimer())
    {
        await next();
    }
});
```

## Performance Reports

Generate weekly performance reports:

```bash
#!/bin/bash
# generate-performance-report.sh

echo "=== Dotly Performance Report ==="
echo "Date: $(date)"
echo ""

# Run k6 tests
k6 run --vus 100 --duration 5m tests/performance/api-benchmark.js \
  --out json=results.json

# Analyze results
echo "API Performance:"
cat results.json | jq '.metrics | to_entries[] | 
  select(.key | contains("duration")) | 
  {endpoint: .key, p95: .value.p95, p99: .value.p99}'

# Database stats
echo ""
echo "Database Performance:"
psql -U postgres -d dotly_db -c "
  SELECT query, calls, mean_time, max_time 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;"

# Server metrics
echo ""
echo "Server Metrics:"
curl http://localhost:5000/metrics | grep dotly_
```
