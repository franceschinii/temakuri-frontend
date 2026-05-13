import { test, expect } from '@playwright/test';
import { registerNewUser, gotoAsUser } from '../fixtures/auth';
import { createRoomWithBots } from '../fixtures/room';
import { closeDb } from '../fixtures/db';

test.afterAll(async () => {
  await closeDb();
});

test.describe('Game flow — TRADITIONAL 4P', () => {
  test('user + 3 bots completam partida → GameOverModal aparece', async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);

    const auth = await registerNewUser(request, 'gtrad');
    // initialTokens: 1 → first round-loser is eliminated, game ends in ~1 round.
    // Bots wait 900ms per move; default INITIAL_TOKENS=2 makes 4P games too slow.
    const { code } = await createRoomWithBots(request, auth.accessToken, {
      mode: 'TRADITIONAL',
      maxPlayers: 4,
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

    for (let placement = 1; placement <= 4; placement++) {
      await expect(
        page.locator(`[data-testid="game-over-ranking-row-${placement}"]`),
      ).toBeVisible();
    }
  });
});
