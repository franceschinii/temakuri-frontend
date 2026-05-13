import { test, expect } from '@playwright/test';
import { registerNewUser, gotoAsUser } from '../fixtures/auth';
import { createRoomWithBots } from '../fixtures/room';
import { unlockMode, closeDb } from '../fixtures/db';

test.afterAll(async () => {
  await closeDb();
});

test.describe('Game flow — MERCADO 4P', () => {
  test('user + 3 bots em MERCADO → market_row visível + GameOverModal', async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);

    const auth = await registerNewUser(request, 'gmerc');
    await unlockMode(auth.userId, 'MERCADO');

    const { code } = await createRoomWithBots(request, auth.accessToken, {
      mode: 'MERCADO',
      maxPlayers: 4,
      initialTokens: 1,
    });

    // Game must be started by host via lobby (lobby:start_game WS event).
    // Backend requires all human players ready, including the host themselves.
    await gotoAsUser(page, auth, `/lobby/${code}`, {
      unlockedModes: ['TRADITIONAL', 'MERCADO'],
    });
    await page.locator('[data-testid="room-ready-btn"]').click();
    await page.locator('[data-testid="room-start-btn"]').click();

    await expect(page).toHaveURL(new RegExp(`/game/${code}`), {
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({
      timeout: 20_000,
    });

    await expect(page.locator('[data-testid="market-row"]')).toBeVisible({
      timeout: 20_000,
    });

    await expect(page.locator('[data-testid="game-over-modal"]')).toBeVisible({
      timeout: 150_000,
    });
  });
});
