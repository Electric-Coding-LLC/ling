import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const userIdentities = sqliteTable(
  "user_identities",
  {
    provider: text("provider").notNull(),
    providerKey: text("provider_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    displayName: text("display_name"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerKey] }),
    index("user_identities_user_id_idx").on(table.userId),
  ],
);

export const stationIntroductions = sqliteTable(
  "station_introductions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stationId: text("station_id").notNull(),
    introducedAt: integer("introduced_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.stationId] })],
);

export const hiraganaKnowledge = sqliteTable(
  "hiragana_knowledge",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kana: text("kana").notNull(),
    knownAt: integer("known_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.kana] })],
);

export const katakanaKnowledge = sqliteTable(
  "katakana_knowledge",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kana: text("kana").notNull(),
    knownAt: integer("known_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.kana] })],
);

export const kanaExtensionKnowledge = sqliteTable(
  "kana_extension_knowledge",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    patternId: text("pattern_id").notNull(),
    knownAt: integer("known_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.patternId] })],
);
