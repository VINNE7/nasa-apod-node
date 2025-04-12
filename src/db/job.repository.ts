import { and, eq } from "drizzle-orm";
import { db } from "./db.js";
import { jobs } from "./schema.js";

const createJob = async (email: string) => {
  console.log("Inserting job into DB...");
  const [job] = await db.insert(jobs).values({ email }).returning();
  return job;
};

const getPendingJobs = async (limit: number = 10) => {
  return db
    .select()
    .from(jobs)
    .where(eq(jobs.isProcessing, false))
    .limit(limit);
};

export const tryClaimJob = async (jobId: number): Promise<boolean> => {
  const result = await db
    .update(jobs)
    .set({ isProcessing: true })
    .where(and(eq(jobs.id, jobId), eq(jobs.isProcessing, false)))
    .run();

  return result.changes > 0;
};

const deleteJob = async (id: number) => {
  await db.delete(jobs).where(eq(jobs.id, id));
};

const markJobFailed = async (id: number, error: string) => {
  await db.update(jobs).set({ error }).where(eq(jobs.id, id));
};

export default {
  createJob,
  deleteJob,
  getPendingJobs,
  markJobFailed,
  tryClaimJob,
};
