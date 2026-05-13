import { test, expect } from '@playwright/test';
import { registerNewUser, gotoAsUser } from '../fixtures/auth';
import { createRoomWithBots } from '../fixtures/room';
import { closeDb } from '../fixtures/db';

test.afterAll(async () => {
  await closeDb();
});

test.describe('Game flow — Duelo (TRADITIONAL 2P)', () => {
  test('user + 1 bot em 2P → 2 rankings no GameOverModal', async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);

    const auth = await registerNewUser(request, 'gduel');
    const { code } = await createRoomWithBots(request, auth.accessToken, {
      mode: 'TRADITIONAL',
      maxPlayers: 2,
      initialTokens: 1,
    });

    // Game must be started by host via lobby (lobby:start_game WS event).
    // Backend requires all human players ready, including the host themselves.
    await gotoAsUser(page, auth, `/lobby/${code}`);
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

    await expect(
      page.locator('[data-testid="game-over-ranking-row-1"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="game-over-ranking-row-2"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="game-over-ranking-row-3"]'),
    ).not.toBeVisible();
  });
});
