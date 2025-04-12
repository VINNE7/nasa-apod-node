import { Request, Response } from "express";
import getApod from "./apod.service.js";
import mailerService from "./mailer.service.js";
import jobRepository from "../db/job.repository.js";

const sendApod = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).send("Email is required");
    return;
  }

  res.status(200).json({ message: "request accepted" });

  setImmediate(async () => {
    console.log("[setImmediate] Running background task");
    try {
      await jobRepository.createJob(email);
      const apod = await getApod();
      const pendingJobs = await jobRepository.getPendingJobs(10);

      const results = await Promise.allSettled(
        pendingJobs.map(async (job) => {
          try {
            const claimed = await jobRepository.tryClaimJob(job.id);
            if (!claimed) return;

            // when using a free tier smtp server, you will probably hit emails/second limit with this code
            await mailerService.sendApodEmail(job.email, apod);

            await jobRepository.deleteJob(job.id);
          } catch (error) {
            await jobRepository.markJobFailed(job.id, String(error));
          }
        }),
      );

      console.log("Processed batch:", results);
    } catch (error) {
      console.error("Failed to handle job processing:", error);
    }
  });
};

export default { sendApod };
