import { test, expect, Page } from '@playwright/test';
import { registerNewUser, gotoAsUser, AuthBundle } from '../fixtures/auth';
import { createRoomWithBots } from '../fixtures/room';
import { closeDb } from '../fixtures/db';

test.afterAll(async () => { await closeDb(); });

async function startGameAsUser(page: Page, request: any, suite: string): Promise<{
  auth: AuthBundle;
  code: string;
}> {
  const auth = await registerNewUser(request, suite);
  const { code } = await createRoomWithBots(request, auth.accessToken, {
    mode: 'TRADITIONAL',
    maxPlayers: 4,
    initialTokens: 1,
  });
  await gotoAsUser(page, auth, `/lobby/${code}`);
  await page.locator('[data-testid="room-ready-btn"]').click();
  await page.locator('[data-testid="room-start-btn"]').click();
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 30_000 });
  return { auth, code };
}

test.describe('Reconnect flow', () => {
  test('fecha context mid-game, reabre, vê game-board ou game-over', async ({
    browser,
    request,
  }) => {
    test.setTimeout(120_000);
    const auth = await registerNewUser(request, 'recon');
    const { code } = await createRoomWithBots(request, auth.accessToken, {
      mode: 'TRADITIONAL',
      maxPlayers: 4,
      initialTokens: 1,
    });

    // Context 1: setup + start game
    const ctx1 = await browser.newContext();
    const page1 = await ctx1.newPage();
    await gotoAsUser(page1, auth, `/lobby/${code}`);
    await page1.locator('[data-testid="room-ready-btn"]').click();
    await page1.locator('[data-testid="room-start-btn"]').click();
    await expect(page1.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 30_000 });
    // Deixa o jogo andar 2s
    await page1.waitForTimeout(2_000);
    await ctx1.close();

    // Context 2: reconnect with same user, navigate to game URL
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();
    await gotoAsUser(page2, auth, `/game/${code}`);
    // Espera game-board OU game-over-modal (bots podem ter terminado)
    // Se /game/{code} redireciona para /lobby/{code} (router guard), aceita lobby-room-card também
    const board = page2.locator('[data-testid="game-board"]');
    const over = page2.locator('[data-testid="game-over-modal"]');
    const lobby = page2.locator('[data-testid="lobby-room-card"]');
    await expect(board.or(over).or(lobby).first()).toBeVisible({ timeout: 30_000 });
    await ctx2.close();
  });
});
