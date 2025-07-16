import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "lulo.db"
  }
});

// For production with Neon:
// export default defineConfig({
//   dialect: "postgresql",
//   schema: "./shared/schema.ts",
//   out: "./drizzle",
//   dbCredentials: {
//     url: process.env.DATABASE_URL!,
//   },
// });
