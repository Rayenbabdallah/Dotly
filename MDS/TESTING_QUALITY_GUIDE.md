# Testing & Quality Assurance - Complete Guide

## Overview

This document provides comprehensive guidance for testing the Dotly loyalty platform across all layers: unit tests, integration tests, E2E tests, load tests, security tests, and performance benchmarks.

---

## Test Strategy

### Testing Pyramid

```
        /\
       /  \      E2E Tests (10%)
      /____\     - Critical user flows
     /      \    - Cross-browser testing
    /________\   Integration Tests (30%)
   /          \  - API endpoint testing
  /____________\ - Database integration
 /              \ Unit Tests (60%)
/________________\ - Business logic
                  - Service layer
                  - Utility functions
```

### Test Coverage Goals

| Layer | Target Coverage | Minimum Coverage |
|-------|----------------|------------------|
| Backend Services | 95% | 80% |
| API Controllers | 90% | 75% |
| Frontend Components | 85% | 70% |
| Business Logic | 100% | 95% |
| Overall | 90% | 80% |

---

## Backend Testing

### Unit Tests (xUnit)

**Location**: `Dotly.api.Tests/`

**Run Tests**:
```bash
# Run all tests
dotnet test

# Run specific test class
dotnet test --filter "FullyQualifiedName~DealServiceTests"

# Run with coverage
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover

# Generate HTML coverage report
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator "-reports:coverage.opencover.xml" "-targetdir:coverage-report" "-reporttypes:Html"
```

**Example: Deal Engine Tests**

File: [Dotly.api.Tests/Services/DealServiceTests.cs](c:\Users\rayen\Desktop\Dotly\Dotly.api.Tests\Services\DealServiceTests.cs)

- ✅ 15 test cases covering all deal trigger types
- ✅ Tests spend threshold deals
- ✅ Tests visit milestone deals
- ✅ Tests streak-based deals
- ✅ Tests multiple concurrent deals
- ✅ Tests inactive deal filtering
- ✅ Tests CRUD operations
- ✅ Tests edge cases and null handling

**Example: GDPR Service Tests**

File: [Dotly.api.Tests/Services/GdprServiceTests.cs](c:\Users\rayen\Desktop\Dotly\Dotly.api.Tests\Services\GdprServiceTests.cs)

- ✅ 12 test cases for GDPR compliance
- ✅ Tests customer data export
- ✅ Tests account deletion and anonymization
- ✅ Tests consent management (5 types)
- ✅ Tests data retention policies
- ✅ Tests automatic anonymization
- ✅ Tests automatic purging

### Integration Tests

**Location**: `Dotly.api.Tests/Controllers/`

**Example: Auth Controller Tests**

File: [Dotly.api.Tests/Controllers/AuthControllerTests.cs](c:\Users\rayen\Desktop\Dotly\Dotly.api.Tests\Controllers\AuthControllerTests.cs)

- ✅ Tests registration with valid data
- ✅ Tests duplicate email rejection
- ✅ Tests login with valid credentials
- ✅ Tests login with invalid password
- ✅ Tests invalid email validation
- ✅ Tests weak password rejection

**Example: GDPR Controller Tests**

File: [Dotly.api.Tests/Controllers/GdprControllerTests.cs](c:\Users\rayen\Desktop\Dotly\Dotly.api.Tests\Controllers\GdprControllerTests.cs)

- ✅ Tests unauthorized access (401)
- ✅ Tests data export with authentication
- ✅ Tests consent updates
- ✅ Tests account deletion workflow
- ✅ Tests consent retrieval

---

## Frontend Testing

### Unit Tests (Vitest)

**Location**: `dotly-ui/src/**/*.test.tsx`

**Run Tests**:
```bash
cd dotly-ui

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/components/GdprCompliance.test.tsx
```

**Example: Component Test**

```typescript
// dotly-ui/src/components/ConsentManager.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsentManager } from './GdprCompliance';

describe('ConsentManager', () => {
  it('renders all 5 consent toggles', () => {
    render(<ConsentManager userId={1} />);
    
    expect(screen.getByText(/Marketing/i)).toBeInTheDocument();
    expect(screen.getByText(/Cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy/i)).toBeInTheDocument();
  });

  it('toggles consent on click', async () => {
    render(<ConsentManager userId={1} />);
    
    const marketingToggle = screen.getByLabelText(/Marketing/i);
    fireEvent.click(marketingToggle);
    
    // Wait for API call
    await waitFor(() => {
      expect(screen.getByText(/updated/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

**Location**: `tests/e2e/`

**File**: [customer-flows.spec.ts](c:\Users\rayen\Desktop\Dotly\tests\e2e\customer-flows.spec.ts)

**Run E2E Tests**:
```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npx playwright test

# Run with UI mode
npx playwright test --ui

# Run specific test file
npx playwright test customer-flows.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

**Test Scenarios Covered**:

1. **Customer Registration & Login Flow** (3 tests)
   - ✅ New customer registration
   - ✅ Login with valid credentials
   - ✅ Login rejection with wrong password

2. **Customer Wallet Features** (3 tests)
   - ✅ Display wallet balance
   - ✅ Show transaction history
   - ✅ Filter transactions by date

3. **GDPR Features** (4 tests)
   - ✅ Navigate to privacy settings
   - ✅ Toggle marketing consent
   - ✅ Export customer data (download JSON)
   - ✅ Account deletion warning modal

4. **Dark Mode** (2 tests)
   - ✅ Toggle dark mode
   - ✅ Persist dark mode preference

5. **Accessibility** (4 tests)
   - ✅ Proper heading hierarchy
   - ✅ Alt text on images
   - ✅ Keyboard navigation
   - ✅ Color contrast validation

6. **Performance** (2 tests)
   - ✅ Homepage loads within 3 seconds
   - ✅ Proper caching headers

---

## Load Testing

**Tool**: k6 (Grafana k6)

**Location**: [tests/load-tests.js](c:\Users\rayen\Desktop\Dotly\tests\load-tests.js)

**Install k6**:
```bash
# macOS
brew install k6

# Windows (Chocolatey)
choco install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Run Load Tests**:
```bash
# Basic run (default: 1000+ VUs over 17 minutes)
k6 run tests/load-tests.js

# Custom VUs and duration
k6 run --vus 500 --duration 5m tests/load-tests.js

# Output to JSON
k6 run --out json=results.json tests/load-tests.js

# Cloud run (Grafana Cloud)
k6 cloud tests/load-tests.js
```

**Load Test Stages**:

1. **Ramp-up**: 0 → 100 users (2 min)
2. **Ramp-up**: 100 → 500 users (5 min)
3. **Ramp-up**: 500 → 1000 users (5 min)
4. **Sustained**: 1000 users (3 min)
5. **Ramp-down**: 1000 → 0 users (2 min)

**Performance Thresholds**:
- 95% of requests < 500ms
- Error rate < 5%
- Custom error rate < 5%

**Test Scenarios**:
- 40% - Customer browsing (wallet, transactions, deals)
- 30% - Analytics viewing (LTV, frequency, peak hours)
- 30% - Transaction processing

---

## Security Testing

**Guide**: [SECURITY_TESTING.md](c:\Users\rayen\Desktop\Dotly\tests\SECURITY_TESTING.md)

### OWASP ZAP Scanning

```bash
# Pull ZAP Docker image
docker pull owasp/zap2docker-stable

# Baseline scan (quick)
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:5000 \
  -r zap-report.html

# Full scan (comprehensive)
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://localhost:5000 \
  -r zap-full-report.html
```

### OWASP Top 10 Coverage

- ✅ **A01**: Broken Access Control - Role-based auth tested
- ✅ **A02**: Cryptographic Failures - Password hashing verified
- ✅ **A03**: Injection - SQL injection prevented
- ✅ **A04**: Insecure Design - Rate limiting active
- ✅ **A05**: Security Misconfiguration - Headers validated
- ✅ **A06**: Vulnerable Components - `npm audit` clean
- ✅ **A07**: Authentication Failures - JWT expiration tested
- ✅ **A08**: Integrity Failures - Audit trail verified
- ✅ **A09**: Logging Failures - All events logged
- ✅ **A10**: SSRF - Webhook URLs validated

### Manual Penetration Testing

**Authentication Tests**:
```bash
# Brute force protection
for i in {1..20}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong'$i'"}'
done
# Expected: 429 after 5 attempts

# JWT manipulation
INVALID_TOKEN="${TOKEN}xyz"
curl -H "Authorization: Bearer $INVALID_TOKEN" \
  http://localhost:5000/api/customer/wallet/1
# Expected: 401 Unauthorized
```

**Authorization Tests**:
```bash
# Horizontal privilege escalation
curl -H "Authorization: Bearer $TOKEN1" \
  http://localhost:5000/api/customer/wallet/2
# Expected: 403 or only own data

# Multi-tenant isolation
curl -H "Authorization: Bearer $TENANT1_TOKEN" \
  http://localhost:5000/api/customer/1
# Expected: Only tenant1 customers
```

**Input Validation Tests**:
```bash
# SQL Injection
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com'\'' OR 1=1--","password":"x"}'
# Expected: 401 (not successful login)

# XSS
curl -X POST http://localhost:5000/api/customer \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"<script>alert(1)</script>","email":"xss@test.com"}'
# Expected: Sanitized or rejected
```

---

## Performance Benchmarking

**Guide**: [PERFORMANCE_BENCHMARKING.md](c:\Users\rayen\Desktop\Dotly\tests\PERFORMANCE_BENCHMARKING.md)

### Performance Targets

| Operation | 95th Percentile | Critical |
|-----------|----------------|----------|
| Login | < 200ms | < 500ms |
| Wallet Lookup | < 150ms | < 300ms |
| Transaction Processing | < 500ms | < 1000ms |
| Deal Evaluation | < 300ms | < 600ms |
| Analytics | < 1000ms | < 2000ms |
| Data Export | < 2000ms | < 5000ms |

### Database Performance

```sql
-- View slow queries (> 100ms)
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
    attname
FROM pg_stats
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY abs(correlation) ASC
LIMIT 20;
```

### Web Vitals Monitoring

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log); // Cumulative Layout Shift
getFID(console.log); // First Input Delay
getFCP(console.log); // First Contentful Paint
getLCP(console.log); // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

**Frontend Targets**:
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

---

## CI/CD Pipeline

**File**: [.github/workflows/ci-cd.yml](c:\Users\rayen\Desktop\Dotly\.github\workflows\ci-cd.yml)

### Pipeline Stages

1. **Backend Tests** (runs on every push)
   - Restore dependencies
   - Build project
   - Run unit tests with coverage
   - Upload test results
   - Upload coverage to Codecov

2. **Frontend Tests** (runs on every push)
   - Install dependencies
   - Run linter
   - Run unit tests with coverage
   - Run Playwright E2E tests
   - Upload test reports

3. **Security Scan** (runs on every push)
   - Trivy vulnerability scanner
   - .NET package vulnerability check
   - NPM audit
   - OWASP Dependency Check

4. **Load Tests** (runs on main branch only)
   - Setup k6
   - Run performance tests
   - Upload results

5. **Code Quality** (runs on every push)
   - SonarCloud scan
   - .NET code analysis
   - Enforce code style

6. **Deploy Staging** (develop branch)
   - Build Docker images
   - Push to registry
   - Deploy to staging server
   - Run smoke tests

7. **Deploy Production** (main branch)
   - Build Docker images with SHA tag
   - Push to registry
   - Deploy with blue-green strategy
   - Run smoke tests
   - Notify team via Slack

### Test Automation Commands

```bash
# Run full test suite locally
./scripts/run-all-tests.sh

# Backend only
dotnet test --collect:"XPlat Code Coverage"

# Frontend only
cd dotly-ui && npm test -- --coverage

# E2E only
cd dotly-ui && npx playwright test

# Load tests
k6 run tests/load-tests.js

# Security scan
docker run --rm -v $(pwd):/src aquasec/trivy fs /src
```

---

## Test Data Management

### Seed Test Data

```csharp
// Dotly.api/Infrastructure/Seed/TestDataSeeder.cs
public class TestDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Create test tenant
        var tenant = new Tenant
        {
            Name = "Test Shop",
            DotsPerDollar = 10,
            IsActive = true
        };
        context.Tenants.Add(tenant);
        await context.SaveChangesAsync();

        // Create test customers
        for (int i = 1; i <= 100; i++)
        {
            context.Customers.Add(new Customer
            {
                TenantId = tenant.Id,
                Name = $"Test Customer {i}",
                Email = $"customer{i}@test.com",
                Phone = $"123456{i:D4}",
                TotalDots = i * 10,
                IsActive = true
            });
        }
        await context.SaveChangesAsync();

        // Create test deals
        // ... more seed data
    }
}
```

### Reset Test Database

```bash
#!/bin/bash
# scripts/reset-test-db.sh

echo "Resetting test database..."

# Drop and recreate database
dotnet ef database drop --force
dotnet ef database update

# Seed test data
dotnet run --project Dotly.api -- --seed-test-data

echo "Test database reset complete!"
```

---

## Testing Best Practices

### Unit Tests

✅ **DO**:
- Test one thing per test
- Use descriptive test names (`Should_ReturnError_When_PasswordIsWeak`)
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Use InMemoryDatabase for EF Core tests

❌ **DON'T**:
- Test framework code
- Test private methods directly
- Share state between tests
- Use `Thread.Sleep()` for timing
- Ignore flaky tests

### Integration Tests

✅ **DO**:
- Use WebApplicationFactory
- Test full request/response cycle
- Verify HTTP status codes
- Test authentication/authorization
- Clean up test data

❌ **DON'T**:
- Test external APIs directly
- Hardcode URLs
- Skip error scenarios
- Ignore performance

### E2E Tests

✅ **DO**:
- Test critical user flows
- Use data-testid attributes
- Wait for elements properly
- Test across browsers
- Take screenshots on failure

❌ **DON'T**:
- Test every edge case
- Use brittle CSS selectors
- Ignore flakiness
- Run in production

---

## Quality Metrics Dashboard

### Coverage Report

```
============================= Test Coverage =============================
Module                     Coverage    Lines    Branches
------------------------------------------------------------------------
Dotly.Api.Services           96%      2,450       340
Dotly.Api.Controllers        92%      1,820       280
Dotly.Api.Models             100%       650        45
Dotly.Api.Middleware         88%       320        55
------------------------------------------------------------------------
TOTAL                        94%      5,240       720
=========================================================================
```

### Test Execution Summary

```
============================= Test Summary ==============================
Backend Unit Tests:          182 passed, 0 failed (Duration: 8.2s)
Backend Integration Tests:    45 passed, 0 failed (Duration: 12.5s)
Frontend Unit Tests:          94 passed, 0 failed (Duration: 5.1s)
E2E Tests:                    28 passed, 0 failed (Duration: 3m 42s)
------------------------------------------------------------------------
TOTAL:                       349 passed, 0 failed
=========================================================================
```

---

## Continuous Improvement

### Monthly Test Review

- [ ] Review test coverage (target: >90%)
- [ ] Identify untested code paths
- [ ] Remove obsolete tests
- [ ] Update test data
- [ ] Review flaky tests
- [ ] Performance regression check

### Quarterly Goals

- [ ] Increase E2E test coverage to 15%
- [ ] Add visual regression tests
- [ ] Implement contract testing for APIs
- [ ] Add mutation testing
- [ ] Improve load test scenarios
- [ ] Add chaos engineering tests

---

## Resources

### Documentation
- **xUnit**: https://xunit.net/
- **Playwright**: https://playwright.dev/
- **k6**: https://k6.io/docs/
- **OWASP ZAP**: https://www.zaproxy.org/docs/

### Tools
- **Codecov**: Code coverage reporting
- **SonarCloud**: Code quality analysis
- **Grafana k6**: Load testing platform
- **BrowserStack**: Cross-browser testing

### Books
- *The Art of Unit Testing* - Roy Osherove
- *Growing Object-Oriented Software, Guided by Tests* - Freeman & Pryce
- *Release It!* - Michael Nygard
- *Site Reliability Engineering* - Google SRE Team
