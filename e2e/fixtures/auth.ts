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
