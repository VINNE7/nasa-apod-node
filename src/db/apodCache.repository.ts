import { eq } from "drizzle-orm";
import { db } from "./db.js";
import { ApodCache, apodCache } from "./schema.js";
import { NasaApodResponse } from "../apod/apod.types.js";

export const getCachedApod = async (date: string) => {
  const rows = await db
    .select()
    .from(apodCache)
    .where(eq(apodCache.date, date));

  return rows.at(0) ?? null;
};

export const cacheApod = async (data: NasaApodResponse) => {
  await db.insert(apodCache).values(data).onConflictDoNothing();
};
