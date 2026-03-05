// Tool: Playwright (Node.js)
// Flow: Register → Login → Search → Open Product → Add to Basket → Assert Basket Count
// Author: QA Intern Submission — CipherSchools Practical Assignment

import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../config/.env") });

const BASE_URL    = process.env.BASE_URL || "https://with-bugs.practicesoftwaretesting.com";
const SEARCH_TERM = process.env.SEARCH_TERM || "Pliers";

function uniqueEmail() {
  return `testlearner_${Date.now()}@mailinator.com`;
}

// Single end-to-end test — all steps in one flow so state is shared
test("Learner Journey — Register, Login, Search, Add to Basket", async ({ page }) => {
  const email    = uniqueEmail();
  const password = "Test@12345";

  // ── STEP 1: Register ────────────────────────────────────────
  console.log("Step 1: Registering new user...");
  await page.goto(`${BASE_URL}/#/auth/register`);
  await page.waitForLoadState("networkidle");

  await page.locator('input[data-test="first-name"]').fill("Test");
  await page.locator('input[data-test="last-name"]').fill("Learner");
  await page.locator('input[data-test="dob"]').fill("1995-06-15");
  await page.locator('input[data-test="address"]').fill("10 MG Road");
  await page.locator('input[data-test="postcode"]').fill("110001");
  await page.locator('input[data-test="city"]').fill("Delhi");
  await page.locator('select[data-test="country"]').selectOption("India");
  await page.locator('select[data-test="state"]').selectOption({ index: 1 });
  await page.locator('input[data-test="phone"]').fill("9876543210");
  await page.locator('input[data-test="email"]').fill(email);
  await page.locator('input[data-test="password"]').fill(password);

  await page.locator('[data-test="register-submit"]').click();
  await page.waitForLoadState("networkidle");
  console.log("Step 1 complete: Registration done");

  // ── STEP 2: Login ───────────────────────────────────────────
  console.log("Step 2: Logging in...");
  await page.goto(`${BASE_URL}/#/auth/login`);
  await page.waitForLoadState("networkidle");

  await page.locator('input[data-test="email"]').fill(email);
  await page.locator('input[data-test="password"]').fill(password);
  await page.locator('[data-test="login-submit"]').click();
  await page.waitForLoadState("networkidle");

  await expect(page.locator('[data-test="nav-menu"]')).toBeVisible({ timeout: 10000 });
  console.log("Step 2 complete: Logged in");

  // ── STEP 3: Search ──────────────────────────────────────────
  console.log("Step 3: Searching for product...");
  await page.goto(`${BASE_URL}`);
  await page.waitForLoadState("networkidle");

  await page.locator('input[data-test="search-query"]').fill(SEARCH_TERM);
  await page.locator('[data-test="search-submit"]').click();
  await page.waitForLoadState("networkidle");

  const firstProduct = page.locator('[data-test="product-name"]').first();
  await expect(firstProduct).toBeVisible({ timeout: 10000 });
  await firstProduct.click();
  await page.waitForLoadState("networkidle");
  console.log("Step 3 complete: Product detail page opened");

  // ── STEP 4: Add to basket and assert count ──────────────────
  console.log("Step 4: Adding to basket...");

  let countBefore = 0;
  try {
    const badge = page.locator('[data-test="cart-quantity"]');
    const text  = await badge.innerText({ timeout: 3000 });
    countBefore = parseInt(text, 10) || 0;
  } catch {
    countBefore = 0;
  }

  await page.locator('[data-test="add-to-cart"]').click();

  // ── CRITICAL ASSERTION ──────────────────────────────────────
  await expect(page.locator('[data-test="cart-quantity"]')).toHaveText(
    String(countBefore + 1),
    { timeout: 10000 }
  );
  // ───────────────────────────────────────────────────────────

  console.log("Step 4 complete: Item added. Cart count incremented correctly.");
});
