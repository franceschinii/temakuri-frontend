import { Pool } from 'pg';

const pool = new Pool({
  connectionString:
    process.env.E2E_DATABASE_URL ??
    'postgresql://temakuri:fee9641985b45ce0f29938412e3e1ab86f565afb3e6fc1e5@localhost:5432/temakuri',
});

export async function unlockMode(userId: string, mode: string): Promise<void> {
  const res = await pool.query(
    'SELECT "unlockedModes" FROM "UserInventory" WHERE "userId" = $1',
    [userId],
  );
  if (res.rows.length === 0) {
    await pool.query(
      `INSERT INTO "UserInventory" ("id", "userId", "unlockedAvatars", "unlockedModes")
       VALUES (gen_random_uuid()::text, $1, ARRAY[0,1,2,3]::INTEGER[], ARRAY['TRADITIONAL',$2]::TEXT[])`,
      [userId, mode],
    );
  } else {
    const modes: string[] = res.rows[0].unlockedModes ?? [];
    if (!modes.includes(mode)) modes.push(mode);
    await pool.query(
      'UPDATE "UserInventory" SET "unlockedModes" = $1 WHERE "userId" = $2',
      [modes, userId],
    );
  }
}

export async function setLevel(userId: string, level: number): Promise<void> {
  await pool.query('UPDATE "User" SET level = $1 WHERE id = $2', [level, userId]);
}

export async function setCoins(userId: string, coins: number): Promise<void> {
  await pool.query('UPDATE "User" SET coins = $1 WHERE id = $2', [coins, userId]);
}

export async function closeDb(): Promise<void> {
  await pool.end();
}
