// Tool: Playwright (Node.js)
// Flow: Login → Search → Open Product → Add to Basket → Assert Basket Count
// Author: QA Intern Submission — CipherSchools Practical Assignment

import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../config/.env") });

const BASE_URL    = process.env.BASE_URL     || "https://with-bugs.practicesoftwaretesting.com";
const TEST_EMAIL  = process.env.TEST_EMAIL   || "customer@practicesoftwaretesting.com";
const TEST_PASS   = process.env.TEST_PASSWORD|| "welcome01";
const SEARCH_TERM = process.env.SEARCH_TERM  || "Pliers";

test.setTimeout(120000); // 2 minutes

test("Learner Journey — Login, Search, Add to Basket", async ({ page }) => {

  // ── STEP 1: Login ───────────────────────────────────────────
  console.log("Step 1: Logging in...");
  await page.goto(`${BASE_URL}/#/auth/login`);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);

  await page.locator('input[data-test="email"]').fill(TEST_EMAIL);
  await page.locator('input[data-test="password"]').fill(TEST_PASS);
  await page.locator('[data-test="login-submit"]').click();
  await page.waitForTimeout(3000);

  // Assert login worked — URL should change away from login page
  await expect(page).not.toHaveURL(/auth\/login/, { timeout: 15000 });
  console.log("Step 1 complete: Logged in successfully");

  // ── STEP 2: Search ──────────────────────────────────────────
  console.log("Step 2: Searching for product...");
  await page.goto(`${BASE_URL}`);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);

  await page.locator('input[data-test="search-query"]').fill(SEARCH_TERM);
  await page.locator('[data-test="search-submit"]').click();
  await page.waitForTimeout(2000);

  // Assert results appeared
  const firstProduct = page.locator('[data-test="product-name"]').first();
  await expect(firstProduct).toBeVisible({ timeout: 15000 });
  console.log("Step 2 complete: Search results shown");

  // ── STEP 3: Open product detail page ───────────────────────
  console.log("Step 3: Opening product detail page...");
  await firstProduct.click();
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);

  // Assert detail page loaded
  await expect(page.locator('[data-test="add-to-cart"]')).toBeVisible({ timeout: 15000 });
  console.log("Step 3 complete: Product detail page opened");

  // ── STEP 4: Add to basket and assert count ──────────────────
  console.log("Step 4: Adding to basket...");

  // Get cart count before adding
  let countBefore = 0;
  try {
    const badge = page.locator('[data-test="cart-quantity"]');
    const text  = await badge.innerText({ timeout: 3000 });
    countBefore = parseInt(text, 10) || 0;
  } catch {
    countBefore = 0;
  }
  console.log(`Cart count before: ${countBefore}`);

  await page.locator('[data-test="add-to-cart"]').click();
  await page.waitForTimeout(2000);

  // ── CRITICAL ASSERTION ──────────────────────────────────────
  // This WILL FAIL if the cart/enrollment flow is broken
  await expect(page.locator('[data-test="cart-quantity"]')).toHaveText(
    String(countBefore + 1),
    { timeout: 15000 }
  );
  // ───────────────────────────────────────────────────────────

  console.log(`Cart count after: ${countBefore + 1}`);
  console.log("Step 4 complete: Cart count incremented correctly!");
});
