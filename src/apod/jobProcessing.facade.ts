import jobRepository from "../db/job.repository.js";
import getApod from "./apod.service.js";
import mailerService from "./mailer.service.js";

const triggerJobBatch = (email: string) => {
  setImmediate(async () => {
    console.log("[setImmediate] Running background task");
    try {
      await jobRepository.createJob(email);
      const apod = await getApod();
      const pendingJobs = await jobRepository.getPendingJobs(10);
      const claimedResults = await Promise.allSettled(
        pendingJobs.map((job) => jobRepository.tryClaimJob(job.id)),
      );

      const unprocessingJobs = pendingJobs.filter(
        (_, index) =>
          claimedResults[index].status === "fulfilled" &&
          claimedResults[index].value === true,
      );
      const sentEmailResults = await Promise.allSettled(
        unprocessingJobs.map((job) =>
          mailerService.sendApodEmail(job.email, apod),
        ),
      );
      const sentEmails = unprocessingJobs.filter(
        (_, index) =>
          sentEmailResults[index].status === "fulfilled" &&
          sentEmailResults[index].value === true,
      );

      const deletedJobsResult = await Promise.allSettled(
        sentEmails.map((job) => jobRepository.deleteJob(job.id)),
      );

      console.log(deletedJobsResult);
    } catch (error) {
      console.error("Failed to handle job processing:", error);
    }
  });
};

export default triggerJobBatch;
