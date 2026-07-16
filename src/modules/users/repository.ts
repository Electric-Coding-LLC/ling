import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { userIdentities, users } from "@/db/schema";
import type { CurrentIdentity } from "@/src/platform/current-identity";

export type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getOrCreateUser(identity: CurrentIdentity): Promise<User> {
  const existing = await findUser(identity);
  if (existing) return existing;

  const db = await getDb();
  const now = new Date();
  const user: User = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.batch([
      db.insert(users).values(user),
      db.insert(userIdentities).values({
        provider: identity.provider,
        providerKey: identity.providerKey,
        userId: user.id,
        email: identity.email,
        displayName: identity.displayName,
        createdAt: now,
        updatedAt: now,
      }),
    ]);
    return user;
  } catch (error) {
    const concurrent = await findUser(identity);
    if (concurrent) return concurrent;
    throw error;
  }
}

async function findUser(identity: CurrentIdentity): Promise<User | null> {
  const db = await getDb();
  const [row] = await db
    .select({
      id: users.id,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(userIdentities)
    .innerJoin(users, eq(userIdentities.userId, users.id))
    .where(
      and(
        eq(userIdentities.provider, identity.provider),
        eq(userIdentities.providerKey, identity.providerKey),
      ),
    )
    .limit(1);

  return row ?? null;
}
