import { eq } from "drizzle-orm";
import { db } from "./db.js";
import { apodCache } from "./schema.js";
import { NasaApodResponse } from "../apod/apod.types.js";

export const getCachedApod = async (date: string) => {
  const [cached] = await db
    .select()
    .from(apodCache)
    .where(eq(apodCache.date, date));
  return cached;
};

export const cacheApod = async (data: NasaApodResponse) => {
  await db.insert(apodCache).values(data).onConflictDoNothing();
};
