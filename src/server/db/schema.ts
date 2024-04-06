// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { UserRole } from "@/lib/utils";
import * as lite from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = lite.sqliteTableCreator((name) => `hw1_${name}`);

export const userTable = createTable("user", {
  id: lite.text("id").notNull().primaryKey(),
  username: lite.text("username").notNull().unique(),
  password: lite.text("password").notNull(),
  role: lite.text("role").notNull().$type<UserRole>().default("player"),
});

export const sessionTable = createTable("session", {
  id: lite.text("id").notNull().primaryKey(),
  userId: lite
    .text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: lite.integer("expires_at").notNull(),
});
