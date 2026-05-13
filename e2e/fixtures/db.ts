import { Pool } from 'pg';

// Lazy-init pool so that calling closeDb() in a previous file's afterAll does
// not break subsequent test files within the same Playwright process. Each
// closeDb() ends the current pool; the next query call rebuilds it.
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString:
        process.env.E2E_DATABASE_URL ??
        'postgresql://temakuri:fee9641985b45ce0f29938412e3e1ab86f565afb3e6fc1e5@localhost:5432/temakuri',
    });
  }
  return pool;
}

export async function unlockMode(userId: string, mode: string): Promise<void> {
  const p = getPool();
  const res = await p.query(
    'SELECT "unlockedModes" FROM "UserInventory" WHERE "userId" = $1',
    [userId],
  );
  if (res.rows.length === 0) {
    await p.query(
      `INSERT INTO "UserInventory" ("id", "userId", "unlockedAvatars", "unlockedModes")
       VALUES (gen_random_uuid()::text, $1, ARRAY[0,1,2,3]::INTEGER[], ARRAY['TRADITIONAL',$2]::TEXT[])`,
      [userId, mode],
    );
  } else {
    const modes: string[] = res.rows[0].unlockedModes ?? [];
    if (!modes.includes(mode)) modes.push(mode);
    await p.query(
      'UPDATE "UserInventory" SET "unlockedModes" = $1 WHERE "userId" = $2',
      [modes, userId],
    );
  }
}

export async function setLevel(userId: string, level: number): Promise<void> {
  await getPool().query('UPDATE "User" SET level = $1 WHERE id = $2', [level, userId]);
}

export async function setCoins(userId: string, coins: number): Promise<void> {
  await getPool().query('UPDATE "User" SET coins = $1 WHERE id = $2', [coins, userId]);
}

export async function closeDb(): Promise<void> {
  if (!pool) return;
  const p = pool;
  pool = null;
  await p.end();
}
