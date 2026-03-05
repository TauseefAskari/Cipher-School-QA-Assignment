# CipherSchools — QA Engineer Intern Practical Assignment

This repository contains **Deliverable 4** of the CipherSchools QA internship assignment:
- `/e2e` — Playwright end-to-end automation (Node.js)
- `/load/k6` — k6 load simulation script
- `/load/jmeter` — JMeter API test plan (`.jmx`)
- `/config` — Environment configuration template

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | v18+ | https://nodejs.org |
| k6 | Latest | https://k6.io/docs/get-started/installation |
| JMeter | 5.6+ | https://jmeter.apache.org/download_jmeter.cgi |

---

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/cipherschools-qa-assignment.git
cd cipherschools-qa-assignment
```

### 2. Configure environment
```bash
cp config/.env.example config/.env
# The defaults in .env.example are correct for the practice app — no edits needed
```

### 3. Install Node dependencies
```bash
npm install
npm run install:browsers
```

---

## Running the E2E Tests (Playwright)

```bash
# Run all tests headlessly (CI mode)
npm run test:e2e

# Run with browser visible (useful for debugging)
npm run test:e2e:headed
```

**What it tests:**
1. Registers a new user account with a unique email
2. Logs in with the newly created credentials
3. Searches for a product by keyword and opens its detail page
4. Adds the product to the basket
5. **Asserts that the basket item count increments correctly** — this assertion will fail if the enrollment flow is broken

Test reports are saved to `playwright-report/index.html`.

---

## Running the Load Tests

### k6 — Load Simulation

```bash
# Install k6 first (see Prerequisites)
k6 run --env BASE_URL=https://with-bugs.practicesoftwaretesting.com load/k6/search-load-test.js
```

**Load profile:** Ramps to 20 virtual users over 10s → holds 30s → ramps down over 10s.

**Thresholds:**
- 95th percentile response time < 2000ms
- Error rate < 1%

The script will print `PASS` or `FAIL` per threshold at the end of the run. Take a screenshot of this summary output for submission.

### JMeter — API Test Plan

```bash
# GUI mode (recommended for first run and screenshots)
jmeter -t load/jmeter/search-api-test.jmx

# Non-GUI mode (for CI)
jmeter -n -t load/jmeter/search-api-test.jmx \
  -JBASE_HOST=with-bugs.practicesoftwaretesting.com \
  -l load/jmeter/results/results.jtl \
  -e -o load/jmeter/results/report
```

**What the plan tests:** GET `/api/v1/products/search?q=Pliers&page=1` with 10 concurrent users for 60 seconds.

**Assertions included:**
1. HTTP status code = 200
2. Response time < 2000ms
3. Response body contains `"data"` key

Open `load/jmeter/results/report/index.html` to see the HTML dashboard. Take a screenshot of the Summary Report for submission.

---

## Prometheus Metrics (k6 + xk6-prometheus)

To output k6 metrics to Prometheus:

### 1. Install xk6 and build a custom k6 binary
```bash
go install go.k6.io/xk6/cmd/xk6@latest
xk6 build --with github.com/grafana/xk6-prometheus
```

### 2. Run with Prometheus output
```bash
./k6 run \
  --out prometheus=namespace=k6 \
  --env BASE_URL=https://with-bugs.practicesoftwaretesting.com \
  load/k6/search-load-test.js
```

### 3. View metrics in Prometheus UI
Open `http://localhost:9090` and query:
```
k6_http_req_duration
```

Take a screenshot of the metric graph for submission.

> **Note on staging environments:** In a real project, all load tests would target a dedicated staging environment, never production. The `BASE_URL` environment variable in this repo enforces this separation — the URL is never hardcoded in any script.

---

## Repo Structure

```
cipherschools-qa-assignment/
├── e2e/
│   └── learner-journey.spec.js     # Playwright E2E script
├── load/
│   ├── k6/
│   │   └── search-load-test.js     # k6 load simulation
│   └── jmeter/
│       └── search-api-test.jmx     # JMeter test plan
├── config/
│   └── .env.example                # Environment config template
├── playwright.config.js
├── package.json
└── README.md
```
