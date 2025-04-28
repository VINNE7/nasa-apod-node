import { and, eq } from "drizzle-orm";
import { db } from "./db.js";
import { Job, jobs } from "./schema.js";

const createJob = async (email: string) => {
  console.log("Inserting job into DB...");
  const [job] = await db.insert(jobs).values({ email }).returning();
  return job;
};

const getPendingJobs = async (limit: number = 10) => {
  return await db
    .select()
    .from(jobs)
    .where(eq(jobs.isProcessing, false))
    .limit(limit);
};

export const tryClaimJob = async (job: Job): Promise<Job | null> => {
  // maybe it would be better to claim multiple jobs at once and use a transaction for rollbacks
  // but sqlite has single-writer limitations, it would work, but i opted for claiming just one job
  // because error handling will be per job as well
  const result = await db
    .update(jobs)
    .set({ isProcessing: true })
    .where(and(eq(jobs.id, job.id), eq(jobs.isProcessing, false)))
    .returning();

  return result.length ? job : null;
};

const deleteJob = async (id: number) => {
  await db.delete(jobs).where(eq(jobs.id, id));
};

const resetJobProcessing = async (id: number) => {
  await db.update(jobs).set({ isProcessing: false }).where(eq(jobs.id, id));
};

export const jobRepository = {
  createJob,
  deleteJob,
  getPendingJobs,
  tryClaimJob,
  resetJobProcessing,
};
