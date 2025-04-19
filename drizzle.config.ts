import { defineConfig } from "drizzle-kit";

const dbFileName = process.env.DB_FILE_NAME;
if (!dbFileName) {
  throw new Error("DB_FILE_NAME is not defined");
}
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbFileName,
  },
});
