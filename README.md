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
