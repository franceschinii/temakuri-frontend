import { test, expect } from '@playwright/test';
import { registerNewUser, gotoAsUser } from '../fixtures/auth';
import { createRoomWithBots } from '../fixtures/room';
import { unlockMode, closeDb } from '../fixtures/db';

test.afterAll(async () => {
  await closeDb();
});

test.describe('Game flow — RODIZIO 4P', () => {
  test('user + 3 bots em RODIZIO → GameOverModal aparece', async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);

    const auth = await registerNewUser(request, 'grod');
    await unlockMode(auth.userId, 'RODIZIO');

    const { code } = await createRoomWithBots(request, auth.accessToken, {
      mode: 'RODIZIO',
      maxPlayers: 4,
      initialTokens: 1,
    });

    // Game must be started by host via lobby (lobby:start_game WS event).
    // Backend requires all human players ready, including the host themselves.
    await gotoAsUser(page, auth, `/lobby/${code}`, {
      unlockedModes: ['TRADITIONAL', 'RODIZIO'],
    });
    await page.locator('[data-testid="room-ready-btn"]').click();
    await page.locator('[data-testid="room-start-btn"]').click();

    await expect(page).toHaveURL(new RegExp(`/game/${code}`), {
      timeout: 15_000,
    });
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({
      timeout: 20_000,
    });

    await expect(page.locator('[data-testid="game-over-modal"]')).toBeVisible({
      timeout: 150_000,
    });

    for (let placement = 1; placement <= 4; placement++) {
      await expect(
        page.locator(`[data-testid="game-over-ranking-row-${placement}"]`),
      ).toBeVisible();
    }
  });
});
