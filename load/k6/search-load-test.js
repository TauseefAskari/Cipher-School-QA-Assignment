// k6 Load Simulation Script — CipherSchools QA Assignment
// Target: Product Search API endpoint
// Simulates 20 virtual users with ramp-up, hold, ramp-down stages

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

// Read base URL from environment — never hardcode production URLs
const BASE_URL = __ENV.BASE_URL || "https://with-bugs.practicesoftwaretesting.com";

// Custom metric: track error rate separately for threshold evaluation
const errorRate = new Rate("error_rate");

// ── Load profile ──────────────────────────────────────────────
// Ramp to 20 VUs over 10s → hold 30s → ramp down over 10s = 50s total
export const options = {
  stages: [
    { duration: "10s", target: 20 }, // Ramp up to 20 virtual users
    { duration: "30s", target: 20 }, // Hold at 20 VUs
    { duration: "10s", target: 0  }, // Ramp down to 0
  ],
  thresholds: {
    // 95% of all requests must complete in under 2 seconds
    http_req_duration: ["p(95)<2000"],
    // Error rate must stay below 1%
    error_rate: ["rate<0.01"],
  },
};

// ── Virtual user behaviour ────────────────────────────────────
export default function () {
  const searchTerm = "Pliers"; // Realistic search keyword

  // Hit the product search API endpoint
  const res = http.get(
    `${BASE_URL}/api/v1/products/search?q=${encodeURIComponent(searchTerm)}&page=1`,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      tags: { name: "SearchAPI" }, // Tag for Prometheus metric grouping
    }
  );

  // ── Assertions (checks) ──────────────────────────────────────
  const passed = check(res, {
    "status is 200":              (r) => r.status === 200,
    "response time < 2000ms":     (r) => r.timings.duration < 2000,
    "response body is not empty": (r) => r.body && r.body.length > 0,
    "response contains data key": (r) => {
      try {
        const json = JSON.parse(r.body);
        return json.data !== undefined || Array.isArray(json);
      } catch {
        return false;
      }
    },
  });

  // Record errors for the custom threshold metric
  errorRate.add(!passed);

  // Simulate realistic think time between requests (0.5–1.5s)
  sleep(Math.random() * 1 + 0.5);
}
