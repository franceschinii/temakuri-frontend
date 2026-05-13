import { APIRequestContext, Page } from '@playwright/test';

export interface AuthBundle {
  username: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export async function registerNewUser(
  request: APIRequestContext,
  suite: string,
): Promise<AuthBundle> {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 100000);
  const username = `pw-${suite}-${ts}-${rand}`.slice(0, 20);
  const email = `${username}@example.com`;
  const password = 'secret123';
  const res = await request.post('http://localhost:3001/api/v1/auth/register', {
    data: { username, email, password },
  });
  if (!res.ok()) {
    throw new Error(`registerNewUser failed (${res.status()}): ${await res.text()}`);
  }
  const body = await res.json();
  return {
    username,
    email,
    password,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    userId: body.user.id,
  };
}

export async function setAuthInStorage(page: Page, auth: AuthBundle): Promise<void> {
  await page.addInitScript((auth) => {
    const state = {
      state: {
        user: { id: auth.userId, username: auth.username, email: auth.email },
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
      },
      version: 0,
    };
    window.localStorage.setItem('temakuri-auth', JSON.stringify(state));
  }, auth as any);
}

/**
 * Navigates to `path` as an authenticated user.
 *
 * Pattern (mirrors `02-lobby.spec.ts`): the Zustand-persist `main.tsx`
 * `refreshUser()` call races with `addInitScript`-based auth injection, so
 * instead we load `/` first to establish the origin, write `localStorage`
 * via `page.evaluate`, then navigate to the target path. `extraUserProps`
 * is merged into the user object — useful for `unlockedModes`, `level`, etc.
 */
export async function gotoAsUser(
  page: Page,
  auth: AuthBundle,
  path: string,
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
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}
