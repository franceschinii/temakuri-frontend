import { APIRequestContext } from '@playwright/test';

export interface CreateRoomOpts {
  mode?: 'TRADITIONAL' | 'MERCADO' | 'RODIZIO' | 'DEGUSTACAO';
  maxPlayers?: number;
  botCount?: number;
  isRanked?: boolean;
  isPrivate?: boolean;
}

export async function createRoomWithBots(
  request: APIRequestContext,
  token: string,
  opts: CreateRoomOpts = {},
): Promise<{ code: string; room: any }> {
  const maxPlayers = opts.maxPlayers ?? 4;
  const botCount = opts.botCount ?? maxPlayers - 1;
  const createRes = await request.post('http://localhost:3001/api/v1/rooms', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      mode: opts.mode ?? 'TRADITIONAL',
      maxPlayers,
      isPrivate: opts.isPrivate ?? false,
      isRanked: opts.isRanked ?? false,
      handBias: 0,
      initialTokens: 2,
    },
  });
  if (!createRes.ok()) {
    throw new Error(`createRoom failed (${createRes.status()}): ${await createRes.text()}`);
  }
  const room = await createRes.json();
  for (let i = 0; i < botCount; i++) {
    const botRes = await request.post(`http://localhost:3001/api/v1/rooms/${room.code}/bots`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!botRes.ok()) {
      throw new Error(`addBot failed (${botRes.status()}): ${await botRes.text()}`);
    }
  }
  return { code: room.code, room };
}
