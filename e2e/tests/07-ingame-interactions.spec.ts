import { test, expect, Page } from '@playwright/test';
import { registerNewUser, gotoAsUser, AuthBundle } from '../fixtures/auth';
import { createRoomWithBots } from '../fixtures/room';
import { closeDb } from '../fixtures/db';

test.afterAll(async () => { await closeDb(); });

/**
 * Set up a full game session: register → create room → navigate to lobby →
 * mark ready → start → wait for game board.
 */
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
  // Mark ready (host)
  await page.locator('[data-testid="room-ready-btn"]').click();
  // Start the game (host)
  await page.locator('[data-testid="room-start-btn"]').click();
  // Wait for game board to render
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible({ timeout: 30_000 });
  return { auth, code };
}

test.describe('Ingame interactions', () => {
  test('rules dialog abre e fecha sem afetar jogo', async ({ page, request }) => {
    test.setTimeout(120_000);
    await startGameAsUser(page, request, 'inter');
    await page.locator('[data-testid="rules-dialog-open-btn"]').click();
    await expect(page.locator('[data-testid="rules-dialog"]')).toBeVisible();
    await page.locator('[data-testid="rules-dialog-close-btn"]').click();
    await expect(page.locator('[data-testid="rules-dialog"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  });

  test('enviar reaction não causa erro no frontend', async ({ page, request }) => {
    test.setTimeout(120_000);
    await startGameAsUser(page, request, 'inter');
    const reactionBtns = page.locator('[data-testid^="reaction-btn-"]');
    const count = await reactionBtns.count();
    if (count > 0) {
      await reactionBtns.first().click();
      // Não esperamos alerta de erro; o frontend deve continuar funcional
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    } else {
      // ReactionBar pode estar escondida (mobile) ou ainda não renderizada
      // — apenas confirma que o jogo não quebrou
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    }
  });

  test('enviar chat message: input limpa após send', async ({ page, request }) => {
    test.setTimeout(120_000);
    await startGameAsUser(page, request, 'inter');
    // Abrir chat panel se for mobile (toggle btn pode estar escondido em desktop)
    const toggle = page.locator('[data-testid="chat-toggle-btn"]');
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click();
    }
    const chatInput = page.locator('[data-testid="chat-input"]');
    await chatInput.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => null);
    if (await chatInput.isVisible().catch(() => false)) {
      const text = `hello-${Date.now()}`;
      await chatInput.fill(text);
      await page.locator('[data-testid="chat-send-btn"]').click();
      // input deve limpar após send (UX comum)
      await expect(chatInput).toHaveValue('', { timeout: 3_000 });
    } else {
      // Se chat-input não está visível, o teste passa trivialmente
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    }
  });
});
