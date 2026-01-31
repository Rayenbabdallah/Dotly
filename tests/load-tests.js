import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * K6 Load Testing Script for Dotly API
 * 
 * Tests system performance under various load conditions:
 * - Simulates 1000+ concurrent users
 * - Tests critical API endpoints
 * - Measures response times, throughput, error rates
 * 
 * Run: k6 run load-tests.js
 * Run with custom VUs: k6 run --vus 500 --duration 5m load-tests.js
 */

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 500 },   // Ramp up to 500 users
    { duration: '5m', target: 1000 },  // Ramp up to 1000 users
    { duration: '3m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.05'],   // Error rate should be below 5%
    errors: ['rate<0.05'],             // Custom error rate below 5%
  },
};

// Base URL - Update this to your API URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Test data
const testUsers = [
  { email: 'loadtest1@test.com', password: 'Test@123' },
  { email: 'loadtest2@test.com', password: 'Test@123' },
  { email: 'loadtest3@test.com', password: 'Test@123' },
];

function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

function login() {
  const user = getRandomUser();
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify(user),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const success = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login returns token': (r) => r.json('token') !== undefined,
  });

  errorRate.add(!success);

  if (success) {
    return loginRes.json('token');
  }
  return null;
}

function testCustomerEndpoints(token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test: Get customer wallet
  const walletRes = http.get(`${BASE_URL}/api/customer/wallet/1`, { headers });
  check(walletRes, {
    'wallet status is 200': (r) => r.status === 200,
    'wallet response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(0.5);

  // Test: Get customer transactions
  const transactionsRes = http.get(
    `${BASE_URL}/api/customer/transactions/1`,
    { headers }
  );
  check(transactionsRes, {
    'transactions status is 200': (r) => r.status === 200,
    'transactions response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(0.5);

  // Test: Get available deals
  const dealsRes = http.get(`${BASE_URL}/api/deals/1`, { headers });
  check(dealsRes, {
    'deals status is 200': (r) => r.status === 200,
    'deals response time < 400ms': (r) => r.timings.duration < 400,
  });
}

function testAnalyticsEndpoints(token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test: Get customer LTV
  const ltvRes = http.get(`${BASE_URL}/api/analytics/customer-ltv/1`, { headers });
  check(ltvRes, {
    'ltv status is 200': (r) => r.status === 200,
    'ltv response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5);

  // Test: Get visit frequency
  const frequencyRes = http.get(
    `${BASE_URL}/api/analytics/visit-frequency/1`,
    { headers }
  );
  check(frequencyRes, {
    'frequency status is 200': (r) => r.status === 200,
    'frequency response time < 600ms': (r) => r.timings.duration < 600,
  });
}

function testTransactionProcessing(token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test: Process transaction
  const transaction = {
    customerId: 1,
    amount: 50.00,
    notes: 'Load test transaction',
  };

  const transactionRes = http.post(
    `${BASE_URL}/api/visit/process`,
    JSON.stringify(transaction),
    { headers }
  );

  const success = check(transactionRes, {
    'transaction status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'transaction response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  errorRate.add(!success);
}

export default function () {
  // Login
  const token = login();
  if (!token) {
    errorRate.add(1);
    sleep(1);
    return;
  }

  sleep(1);

  // Run different test scenarios based on random distribution
  const scenario = Math.random();

  if (scenario < 0.4) {
    // 40% - Customer browsing scenario
    testCustomerEndpoints(token);
  } else if (scenario < 0.7) {
    // 30% - Analytics viewing scenario
    testAnalyticsEndpoints(token);
  } else {
    // 30% - Transaction processing scenario
    testTransactionProcessing(token);
  }

  sleep(Math.random() * 3 + 1); // Random sleep 1-4 seconds
}

export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options?.indent || '';
  const enableColors = options?.enableColors || false;

  let summary = '\n';
  summary += `${indent}Load Test Summary\n`;
  summary += `${indent}================\n\n`;
  summary += `${indent}Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%\n`;
  summary += `${indent}Average Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}99th Percentile: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  summary += `${indent}Max Response Time: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;

  return summary;
}
