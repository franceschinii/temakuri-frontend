import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
  test('register form: happy path → redirect to /lobby', async ({ page }) => {
    await page.goto('/auth/register');
    const ts = Date.now();
    const username = `pw-auth-${ts}`.slice(0, 20);
    await page.locator('[data-testid="register-username-input"]').fill(username);
    await page.locator('[data-testid="register-email-input"]').fill(`${username}@example.com`);
    await page.locator('[data-testid="register-password-input"]').fill('secret123');
    await page.locator('[data-testid="register-submit"]').click();
    await expect(page).toHaveURL(/\/lobby/, { timeout: 10_000 });
    await expect(page.locator('[data-testid="access-bar-username"]')).toContainText(username);
  });

  test('register form: email inválido mostra erro', async ({ page }) => {
    await page.goto('/auth/register');
    await page.locator('[data-testid="register-username-input"]').fill('testuser');
    await page.locator('[data-testid="register-password-input"]').fill('secret123');
    // Bypass native browser email validation to let zod run
    await page.locator('form').evaluate((form: HTMLFormElement) => { form.noValidate = true; });
    await page.locator('[data-testid="register-email-input"]').fill('not-an-email');
    await page.locator('[data-testid="register-submit"]').click();
    await expect(page.locator('[data-testid="register-error-email"]')).toBeVisible();
  });

  test('register form: password muito curto mostra erro', async ({ page }) => {
    await page.goto('/auth/register');
    const ts = Date.now();
    await page.locator('[data-testid="register-username-input"]').fill(`pw-auth-${ts}`.slice(0, 20));
    await page.locator('[data-testid="register-email-input"]').fill(`u${ts}@example.com`);
    await page.locator('[data-testid="register-password-input"]').fill('123');
    await page.locator('[data-testid="register-submit"]').click();
    await expect(page.locator('[data-testid="register-error-password"]')).toBeVisible();
  });

  test('login form: happy path (após register via API)', async ({ page, request }) => {
    const ts = Date.now();
    const username = `pw-auth-${ts}`.slice(0, 20);
    const email = `${username}@example.com`;
    const password = 'secret123';
    const res = await request.post('http://localhost:3001/api/v1/auth/register', {
      data: { username, email, password },
    });
    expect(res.ok()).toBeTruthy();
    await page.goto('/auth/login');
    await page.locator('[data-testid="login-email-input"]').fill(email);
    await page.locator('[data-testid="login-password-input"]').fill(password);
    await page.locator('[data-testid="login-submit"]').click();
    await expect(page).toHaveURL(/\/lobby/, { timeout: 10_000 });
    await expect(page.locator('[data-testid="access-bar-username"]')).toContainText(username);
  });
});
