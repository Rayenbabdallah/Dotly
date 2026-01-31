# Security Testing & Penetration Testing Guide

## Overview

This document outlines security testing procedures and penetration testing guidelines for the Dotly loyalty platform.

## Automated Security Scanning

### OWASP ZAP Integration

Install and run OWASP ZAP (Zed Attack Proxy):

```bash
# Pull ZAP Docker image
docker pull owasp/zap2docker-stable

# Run baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:5000 \
  -r zap-report.html

# Run full scan (longer, more thorough)
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://localhost:5000 \
  -r zap-full-report.html
```

### OWASP Top 10 Checklist

- [ ] **A01 - Broken Access Control**
  - Test: Try accessing admin endpoints without proper role
  - Test: Attempt to access other tenant's data
  - Test: Modify TenantId in requests
  - Expected: All return 401/403

- [ ] **A02 - Cryptographic Failures**
  - Test: Passwords stored as bcrypt hashes (not plaintext)
  - Test: JWT tokens properly signed
  - Test: Sensitive data encrypted at rest
  - Test: HTTPS enforced in production

- [ ] **A03 - Injection**
  - Test: SQL injection on all input fields
  - Test: NoSQL injection attempts
  - Test: Command injection in file uploads
  - Expected: Parameterized queries prevent all injection

- [ ] **A04 - Insecure Design**
  - Test: Rate limiting on login endpoint (max 10/min)
  - Test: Account lockout after 5 failed attempts
  - Test: Session timeout after inactivity
  - Test: Multi-factor auth available

- [ ] **A05 - Security Misconfiguration**
  - Test: No default credentials accepted
  - Test: Error messages don't leak stack traces
  - Test: Unnecessary HTTP methods disabled
  - Test: Security headers present (CSP, X-Frame-Options)

- [ ] **A06 - Vulnerable and Outdated Components**
  - Run: `dotnet list package --vulnerable`
  - Run: `npm audit`
  - Expected: No critical/high vulnerabilities

- [ ] **A07 - Identification and Authentication Failures**
  - Test: Password complexity enforced
  - Test: JWT expiration enforced
  - Test: Brute force protection active
  - Test: Session invalidation on logout

- [ ] **A08 - Software and Data Integrity Failures**
  - Test: Webhook HMAC signatures verified
  - Test: API responses include integrity hashes
  - Test: Code signing for releases
  - Test: Audit trail tamper detection

- [ ] **A09 - Security Logging and Monitoring Failures**
  - Test: Failed logins logged
  - Test: Privilege escalation attempts logged
  - Test: Data export events logged
  - Test: Logs include user, IP, timestamp

- [ ] **A10 - Server-Side Request Forgery (SSRF)**
  - Test: Webhook URLs validated
  - Test: No internal network access via webhooks
  - Test: URL scheme whitelist enforced
  - Expected: Only HTTPS allowed

## Manual Penetration Testing

### Authentication Testing

```bash
# Test 1: Brute force protection
for i in {1..20}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong'$i'"}'
done
# Expected: After 5 attempts, should return 429 Too Many Requests

# Test 2: JWT token manipulation
# Get valid token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123"}' \
  | jq -r '.token')

# Try modifying token
INVALID_TOKEN="${TOKEN}xyz"
curl -H "Authorization: Bearer $INVALID_TOKEN" \
  http://localhost:5000/api/customer/wallet/1
# Expected: 401 Unauthorized

# Test 3: Password complexity
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"weak@test.com","phone":"123","password":"123"}'
# Expected: 400 Bad Request
```

### Authorization Testing

```bash
# Test 1: Horizontal privilege escalation
# Login as customer1
TOKEN1=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@test.com","password":"Test@123"}' \
  | jq -r '.token')

# Try accessing customer2's wallet
curl -H "Authorization: Bearer $TOKEN1" \
  http://localhost:5000/api/customer/wallet/2
# Expected: 403 Forbidden or only see own data

# Test 2: Vertical privilege escalation
# Login as staff
STAFF_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@test.com","password":"Test@123"}' \
  | jq -r '.token')

# Try accessing owner analytics
curl -H "Authorization: Bearer $STAFF_TOKEN" \
  http://localhost:5000/api/analytics/customer-ltv/1
# Expected: 403 Forbidden (requires Owner role)

# Test 3: Multi-tenant isolation
# Login as tenant1 user
TENANT1_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tenant1@test.com","password":"Test@123"}' \
  | jq -r '.token')

# Try accessing tenant2 customer
curl -H "Authorization: Bearer $TENANT1_TOKEN" \
  http://localhost:5000/api/customer/1
# Expected: Only see customers from own tenant
```

### Input Validation Testing

```bash
# Test 1: SQL Injection
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com'\'' OR 1=1--","password":"anything"}'
# Expected: 401 Unauthorized (not successful login)

# Test 2: XSS in customer name
curl -X POST http://localhost:5000/api/customer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>","email":"xss@test.com","phone":"123"}'
# Expected: Input sanitized or rejected

# Test 3: Path traversal in file upload
curl -X POST http://localhost:5000/api/branding/logo \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@../../etc/passwd"
# Expected: File path sanitized, upload rejected

# Test 4: Large payload DoS
dd if=/dev/zero bs=1M count=100 | curl -X POST \
  http://localhost:5000/api/customer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @-
# Expected: Request rejected (max size limit)
```

### API Abuse Testing

```bash
# Test 1: Rate limiting
for i in {1..100}; do
  curl -H "Authorization: Bearer $TOKEN" \
    http://localhost:5000/api/customer/wallet/1 &
done
# Expected: Some requests return 429 Too Many Requests

# Test 2: Mass data export
for i in {1..50}; do
  curl -H "Authorization: Bearer $TOKEN" \
    http://localhost:5000/api/gdpr/customer/export?customerId=$i &
done
# Expected: Rate limited or queued

# Test 3: Webhook flood
for i in {1..100}; do
  curl -X POST http://localhost:5000/webhooks/receive/test-endpoint \
    -H "Content-Type: application/json" \
    -d '{"event":"test","data":{}}' &
done
# Expected: Rate limited
```

### GDPR Compliance Testing

```bash
# Test 1: Data export includes all data
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/gdpr/customer/export?customerId=1 \
  -o export.json
cat export.json | jq 'keys'
# Expected: Contains profile, visits, rewards, consents, etc.

# Test 2: Account deletion removes PII
curl -X POST http://localhost:5000/api/gdpr/customer/delete-account \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId":1,"reason":"Test deletion"}'

# Verify customer data anonymized
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:5000/api/customer/1
# Expected: Email/phone/name anonymized

# Test 3: Consent revocation respected
curl -X POST http://localhost:5000/api/gdpr/consent/update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"consentType":"Marketing","isGranted":false}'

# Verify no marketing emails sent
# Expected: Marketing notifications blocked
```

## Security Regression Tests

Add these tests to CI/CD pipeline:

```bash
#!/bin/bash
# security-regression.sh

echo "Running security regression tests..."

# 1. Check for secrets in code
if grep -r "password.*=.*['\"]" --include="*.cs" .; then
  echo "FAIL: Hardcoded password detected"
  exit 1
fi

# 2. Check for vulnerable packages
dotnet list package --vulnerable | grep -q "critical\|high"
if [ $? -eq 0 ]; then
  echo "FAIL: Vulnerable packages detected"
  exit 1
fi

# 3. Check security headers
RESPONSE=$(curl -s -I http://localhost:5000)
if ! echo "$RESPONSE" | grep -q "X-Frame-Options"; then
  echo "FAIL: Missing X-Frame-Options header"
  exit 1
fi

# 4. Check HTTPS redirect
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)
if [ "$HTTP_RESPONSE" != "301" ] && [ "$HTTP_RESPONSE" != "307" ]; then
  echo "WARN: HTTP not redirecting to HTTPS"
fi

echo "All security regression tests passed!"
```

## Reporting Security Issues

If you find a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email security@dotly.com with details
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)
4. Wait for acknowledgment (within 48 hours)
5. Coordinate disclosure timeline

## Security Testing Schedule

- **Daily**: Automated dependency scanning
- **Weekly**: Automated ZAP baseline scan
- **Monthly**: Manual penetration testing
- **Quarterly**: Full security audit
- **Annual**: Third-party security assessment

## Tools & Resources

- **OWASP ZAP**: https://www.zaproxy.org/
- **Burp Suite**: https://portswigger.net/burp
- **SQLMap**: http://sqlmap.org/
- **Nikto**: https://github.com/sullo/nikto
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **CWE Top 25**: https://cwe.mitre.org/top25/

## Compliance Standards

- **GDPR**: General Data Protection Regulation
- **PCI DSS**: Payment Card Industry Data Security Standard
- **SOC 2**: Service Organization Control 2
- **ISO 27001**: Information Security Management
