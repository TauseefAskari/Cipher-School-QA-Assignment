// Tool: Playwright (Node.js)
// Flow: Register → Login → Search → Open Product → Add to Basket → Assert Basket Count
// Author: QA Intern Submission — CipherSchools Practical Assignment

import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment config — base URL and credentials are never hardcoded
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../config/.env") });

const BASE_URL   = process.env.BASE_URL;
const SEARCH_TERM = process.env.SEARCH_TERM || "Pliers";

// Generate a unique email each run so registration always works
function uniqueEmail() {
  const ts = Date.now();
  return `testlearner_${ts}@mailinator.com`;
}

test.describe("Learner Journey — End-to-End", () => {
  let registeredEmail;
  const password = "Test@12345";

  // ─────────────────────────────────────────────────────────────
  // STEP 1 — Register a brand-new user account
  // ─────────────────────────────────────────────────────────────
  test("1. Register a new user account", async ({ page }) => {
    registeredEmail = uniqueEmail();

    await page.goto(`${BASE_URL}/auth/register`);

    // Fill registration form with realistic data
    await page.getByLabel("First name").fill("Test");
    await page.getByLabel("Last name").fill("Learner");
    await page.getByLabel("Date of Birth").fill("1995-06-15");
    await page.getByLabel("Address").fill("10 MG Road");
    await page.getByLabel("City").fill("Delhi");
    await page.getByLabel("State").fill("DL");
    await page.getByLabel("Country").selectOption("India");
    await page.getByLabel("Phone").fill("9876543210");
    await page.getByLabel("Email").fill(registeredEmail);
    await page.getByLabel("Password").fill(password);

    await page.getByRole("button", { name: /register/i }).click();

    // Assert redirect away from registration page — account created
    await expect(page).not.toHaveURL(/register/, { timeout: 10_000 });
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 2 — Log in with the newly created credentials
  // ─────────────────────────────────────────────────────────────
  test("2. Log in with registered credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);

    await page.getByLabel("Email").fill(registeredEmail);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /sign in|log in/i }).click();

    // Assert authenticated state — user name or account link appears
    await expect(
      page.getByRole("link", { name: /account|profile|my account/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 3 — Search for a course/product by keyword
  // ─────────────────────────────────────────────────────────────
  test("3. Search for a product by keyword and open detail page", async ({ page }) => {
    await page.goto(BASE_URL);

    // Smart wait: fill and submit search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill(SEARCH_TERM);
    await searchInput.press("Enter");

    // Wait for at least one result card to appear
    const firstResult = page.locator("[data-test='product-name']").first();
    await expect(firstResult).toBeVisible({ timeout: 10_000 });

    // Click into the first matching product
    await firstResult.click();

    // Assert we're on a detail page — the product name heading should be visible
    await expect(page.locator("[data-test='product-name']")).toBeVisible({
      timeout: 10_000,
    });
  });

  // ─────────────────────────────────────────────────────────────
  // STEP 4 — Add the course to the enrollment basket
  //           CRITICAL ASSERTION: basket count must increment
  // ─────────────────────────────────────────────────────────────
  test("4. Add product to basket and assert item count increments", async ({ page }) => {
    await page.goto(BASE_URL);

    // Search and open first result
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill(SEARCH_TERM);
    await searchInput.press("Enter");
    await page.locator("[data-test='product-name']").first().click();

    // Capture basket count BEFORE adding item
    const cartBadge = page.locator("[data-test='cart-quantity']");

    let countBefore = 0;
    try {
      const text = await cartBadge.innerText({ timeout: 3_000 });
      countBefore = parseInt(text, 10) || 0;
    } catch {
      // Badge may not exist yet (empty cart) — treat as 0
    }

    // Add to cart — use aria-label or data-test attribute (no brittle XPath)
    await page.getByRole("button", { name: /add to cart/i }).click();

    // ── CRITICAL ASSERTION ────────────────────────────────────
    // This assertion WILL FAIL if the enrollment/cart flow is broken.
    // We wait explicitly for the badge to show the incremented value.
    await expect(cartBadge).toHaveText(String(countBefore + 1), {
      timeout: 10_000,
    });
    // ─────────────────────────────────────────────────────────
  });
});
