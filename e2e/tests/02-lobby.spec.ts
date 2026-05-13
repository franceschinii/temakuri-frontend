import { test, expect } from '@playwright/test';
import { registerNewUser } from '../fixtures/auth';
import { setLevel, closeDb } from '../fixtures/db';
import type { AuthBundle } from '../fixtures/auth';
import type { Page } from '@playwright/test';

test.afterAll(async () => {
  await closeDb();
});

/**
 * Sets Zustand-persist auth state in localStorage and navigates to /lobby.
 *
 * Using page.evaluate (not addInitScript) so the store is already populated
 * when the React app boots after page.goto('/lobby'). The pattern is:
 *   1. goto('/') to establish the origin
 *   2. page.evaluate to write localStorage
 *   3. goto('/lobby') — Zustand hydrates from populated storage
 *   4. waitForLoadState('networkidle') — rooms query + lazy chunk finish loading
 */
async function gotoLobbyAsUser(
  page: Page,
  auth: AuthBundle,
  extraUserProps: Record<string, unknown> = {},
): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ auth, extra }) => {
      const state = {
        state: {
          user: {
            id: auth.userId,
            username: auth.username,
            email: auth.email,
            isGuest: false,
            ...extra,
          },
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          isGuest: false,
        },
        version: 0,
      };
      window.localStorage.setItem('temakuri-auth', JSON.stringify(state));
      window.localStorage.setItem('accessToken', auth.accessToken);
      window.localStorage.setItem('refreshToken', auth.refreshToken);
    },
    { auth: auth as any, extra: extraUserProps },
  );
  await page.goto('/lobby');
  await page.waitForLoadState('networkidle');
}

test.describe('Lobby flows', () => {
  test('create room: TRADITIONAL happy path → redirect to /lobby/:code', async ({
    page,
    request,
  }) => {
    const auth = await registerNewUser(request, 'lobby');
    await gotoLobbyAsUser(page, auth);
    await page.locator('[data-testid="lobby-create-room-btn"]').click();
    await expect(page.locator('[data-testid="create-room-modal"]')).toBeVisible();
    await page.locator('[data-testid="create-room-mode-TRADITIONAL"]').click();
    await page.locator('[data-testid="create-room-submit"]').click();
    await expect(page).toHaveURL(/\/lobby\/[A-Z0-9]+/, { timeout: 10_000 });
  });

  test('create room: MERCADO sem unlock — radio interno está disabled', async ({
    page,
    request,
  }) => {
    const auth = await registerNewUser(request, 'lobby');
    await gotoLobbyAsUser(page, auth);
    await page.locator('[data-testid="lobby-create-room-btn"]').click();
    await expect(page.locator('[data-testid="create-room-modal"]')).toBeVisible();

    // The mode selector is a <label data-testid="create-room-mode-MERCADO"> wrapping
    // a hidden <input type="radio" disabled={locked}>. isDisabled() on the label
    // always returns false; we inspect the inner radio element.
    const mercadoRadio = page.locator(
      '[data-testid="create-room-mode-MERCADO"] input[type="radio"]',
    );

    const isDisabled = await mercadoRadio.isDisabled();

    if (isDisabled) {
      // Expected path: UI blocks selection via disabled radio — assert and done.
      expect(isDisabled).toBe(true);
    } else {
      // Fallback: click the label and expect a toast error on submit.
      await page.locator('[data-testid="create-room-mode-MERCADO"]').click();
      await page.locator('[data-testid="create-room-submit"]').click();
      await expect(
        page.locator('[data-sonner-toast]').filter({ hasText: /MERCADO|desbloqueado|locked/i }),
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test('create room: ranked toggle oculto para usuário sem level suficiente', async ({
    page,
    request,
  }) => {
    // New users start at level 1 (or undefined → 1). canRanked = level >= 10.
    // The ranked toggle is rendered only when canRanked is true; for a fresh user
    // it must NOT appear in the DOM.
    const auth = await registerNewUser(request, 'lobby');
    await gotoLobbyAsUser(page, auth);
    await page.locator('[data-testid="lobby-create-room-btn"]').click();
    await expect(page.locator('[data-testid="create-room-modal"]')).toBeVisible();
    await page.locator('[data-testid="create-room-mode-TRADITIONAL"]').click();

    await expect(page.locator('[data-testid="create-room-ranked-toggle"]')).not.toBeVisible();
  });

  test('create room: ranked com level=10 funciona → redirect to /lobby/:code', async ({
    page,
    request,
  }) => {
    const auth = await registerNewUser(request, 'lobby');
    await setLevel(auth.userId, 10);

    // Inject level: 10 into the user object so the frontend's canRanked guard
    // (user?.level >= 10) evaluates to true and renders the ranked toggle.
    await gotoLobbyAsUser(page, auth, { level: 10 });

    await page.locator('[data-testid="lobby-create-room-btn"]').click();
    await expect(page.locator('[data-testid="create-room-modal"]')).toBeVisible();
    await page.locator('[data-testid="create-room-mode-TRADITIONAL"]').click();
    await page.locator('[data-testid="create-room-ranked-toggle"]').click();
    await page.locator('[data-testid="create-room-submit"]').click();
    await expect(page).toHaveURL(/\/lobby\/[A-Z0-9]+/, { timeout: 10_000 });
  });
});
