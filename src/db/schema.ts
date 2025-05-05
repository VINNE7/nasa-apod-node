import { InferSelectModel } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer as boolean,
  integer,
} from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  email: text("email").notNull(),
  error: text("error"),
  id: integer().primaryKey({ autoIncrement: true }),
  isProcessing: boolean("is_processing", { mode: "boolean" })
    .default(false)
    .notNull(),
});

export const apodCache = sqliteTable("apod_cache", {
  date: text("date").primaryKey().notNull(), // yyyy-mm-dd
  title: text("title").notNull(),
  url: text("url").notNull(),
  explanation: text("explanation").notNull(),
  media_type: text("media_type").notNull(),
});

export type Job = InferSelectModel<typeof jobs>;
export type ApodCache = InferSelectModel<typeof apodCache>;
