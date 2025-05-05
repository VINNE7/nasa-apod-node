import { describe, it, beforeEach, vi, expect } from "vitest";
import * as mailer from "./mailer.service.js";
import * as apodService from "./apod.service.js";
import { jobRepository } from "../db/job.repository.js";
import getApod from "./apod.service.js";
import type { Job } from "../db/schema.js";
import type { NasaApodResponse } from "./apod.types.js";
import triggerJobBatch from "./jobProcessing.facade.js";

describe("triggerJobBatch", () => {
  const mockJobs: Job[] = [
    { id: 1, email: "a@example.com", error: null, isProcessing: false },
    { id: 2, email: "b@example.com", error: null, isProcessing: false },
  ];

  const apodData: NasaApodResponse = {
    title: "Test Title",
    url: "http://example.com/img.jpg",
    explanation: "Just a test",
    date: "2025-04-30",
    media_type: "image",
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(jobRepository, "createJob").mockImplementation(
      async (email: string): Promise<Job> => {
        return {
          id: 42,
          email,
          error: null,
          isProcessing: false,
        };
      },
    );

    vi.spyOn(jobRepository, "getPendingJobs").mockResolvedValue(mockJobs);

    vi.spyOn(jobRepository, "tryClaimJob").mockImplementation(
      async (job: Job) => job,
    );

    vi.spyOn(jobRepository, "resetJobProcessing").mockResolvedValue(undefined);
    vi.spyOn(jobRepository, "deleteJob").mockResolvedValue(undefined);

    vi.spyOn(apodService, "default").mockResolvedValue(apodData);

    vi.spyOn(mailer.mailerService, "sendApodEmail").mockResolvedValue(
      undefined,
    );

    vi.spyOn(globalThis, "setImmediate").mockImplementation((cb) => {
      cb();
      return { ref() {}, unref() {} } as NodeJS.Immediate;
    });
  });

  it("processes a batch end-to-end", async () => {
    triggerJobBatch("trigger@example.com");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(jobRepository.createJob).toHaveBeenCalledWith("trigger@example.com");
    expect(getApod).toHaveBeenCalled();
    expect(jobRepository.getPendingJobs).toHaveBeenCalledWith(10);

    for (const job of mockJobs) {
      expect(jobRepository.tryClaimJob).toHaveBeenCalledWith(job);
      expect(mailer.mailerService.sendApodEmail).toHaveBeenCalledWith(
        job.email,
        apodData,
      );
      expect(jobRepository.deleteJob).toHaveBeenCalledWith(job.id);
    }
    expect(jobRepository.resetJobProcessing).not.toHaveBeenCalled();
  });
});
