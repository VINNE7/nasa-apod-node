import { Job } from "./../db/schema.js";
import { jobRepository } from "../db/job.repository.js";
import getApod from "./apod.service.js";
import { mailerService } from "./mailer.service.js";
import { NasaApodResponse } from "./apod.types.js";
import { BaseException } from "../utils/exceptions/baseException.js";
import statusCodes from "../utils/statusCode/statusCodes.js";

const claimJobs = async (pendingJobs: Job[]) => {
  const results = await Promise.allSettled(
    pendingJobs.map((job) => jobRepository.tryClaimJob(job)),
  );

  const claimedJobs: Job[] = [];
  // i've opted for this approach as it makes more readable than a flatMap, but its just an opinion
  for (const result of results) {
    if (result.status === "fulfilled" && result.value !== null) {
      claimedJobs.push(result.value);
    }
  }

  // On a real system, it would be great to know if there is any failure on claiming jobs
  // if it simply fails, it will be processed by another request later, but a log catched
  // by any logging tool like open search could give some insights about potential db errors

  results.forEach((res, i) => {
    if (res.status === "rejected") {
      console.warn(
        `[claimJobs] Failed to claim job ${pendingJobs[i].id}:`,
        res.reason,
      );
    }
  });

  return claimedJobs;
};
const sendEmails = async (claimedJobs: Job[], apod: NasaApodResponse) => {
  const results = await Promise.allSettled(
    claimedJobs.map((job) => mailerService.sendApodEmail(job.email, apod)),
  );

  const successfullySent: Job[] = [];
  // using a resetPromises is good because it wont stop other jobs of being pushed to sent
  const resetPromises: Promise<void>[] = [];

  for (const [i, result] of results.entries()) {
    const job = claimedJobs[i];

    if (result.status === "fulfilled") {
      successfullySent.push(job);

      continue;
    }

    // jobs that wasn't sent should be marked with isProcessing: false, so they can be processed by another request
    console.warn(`[sendEmails] Failed for ${job.email}:`, result.reason);
    resetPromises.push(jobRepository.resetJobProcessing(job.id));
  }
  const resetResults = await Promise.allSettled(resetPromises);

  resetResults.forEach((res, i) => {
    if (res.status === "rejected") {
      // if any job fails when try to reset its processing flag, it should be logged and dealt with
      // maybe a retry system, or a table of reset_failures
      const failedJob = claimedJobs[i];
      console.error(
        `[sendEmails] Failed to reset job ${failedJob.email} (ID: ${failedJob.id}):`,
        res.reason,
      );
    }
  });
  return successfullySent;
};

const deleteJobs = async (processedJobs: Job[]) => {
  return await Promise.allSettled(
    processedJobs.map((job) => jobRepository.deleteJob(job.id)),
  );
};

const triggerJobBatch = (email: string) => {
  setImmediate(async () => {
    console.log("[setImmediate] Running background task");
    try {
      await jobRepository.createJob(email);
      const apod = await getApod();
      const pendingJobs = await jobRepository.getPendingJobs(10);

      const claimedJobs = await claimJobs(pendingJobs);

      const sentEmails = await sendEmails(claimedJobs, apod);

      const deletedResults = await deleteJobs(sentEmails);

      console.log(
        `[JobBatch] ${deletedResults.length} jobs completed and deleted.`,
      );
    } catch (error) {
      // The setImmediate doesn't run on normal HTTP lifecycle, so a middleware handler wouldn't be of much use for this
      // So, i have only one custom exception, that is Nasa API's exception, i'll log it but ideally, a table, file, or another solution
      // would be ideal so developers can check the background processing errors

      // translating unhandled exceptions to BaseException
      const errorCause =
        error instanceof BaseException
          ? {
              name: error.name,
              message: error.message,
              context: error.context,
            }
          : new BaseException(
              "Unhandled error in job batch",
              statusCodes.INTERNAL_SERVER_ERROR,
              {
                cause: error,
                emailContext: email,
              },
            );

      console.error(
        `[${errorCause.name}] ${errorCause.message}`,
        errorCause.context,
      );
    }
  });
};

export default triggerJobBatch;
