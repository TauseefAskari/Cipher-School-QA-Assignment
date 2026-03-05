// playwright.config.js — Playwright test configuration
import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("config/.env") });

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL,
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],
});
