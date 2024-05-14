import { type Config } from "drizzle-kit";

import { env } from "@/env";

export default {
  // @ts-expect-error types
  dialect: "sqlite",
  schema: "./src/server/db/schema.ts",
  driver: "better-sqlite",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["hw1_*"],
} satisfies Config;
