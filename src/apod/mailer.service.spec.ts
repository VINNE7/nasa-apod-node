// src/apod/mailer.service.spec.ts
import { describe, it, vi, beforeEach, expect } from "vitest";
import * as mailer from "./mailer.service.js";
import nodemailer, { SentMessageInfo, Transporter } from "nodemailer";

describe("sendApodEmail", () => {
  const mockSendMail = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();

    const fakeTransporter = {
      sendMail: mockSendMail,
    };

    vi.spyOn(nodemailer, "createTransport").mockReturnValue(
      fakeTransporter as unknown as Transporter<SentMessageInfo>,
    );
  });

  it("sends email with correct values", async () => {
    const data = {
      title: "Galaxy Photo",
      explanation: "Nice image",
      date: "2025-04-29",
      url: "http://example.com/image.jpg",
      media_type: "photo",
    };

    await mailer.mailerService.sendApodEmail("user@example.com", data);

    expect(mockSendMail).toHaveBeenCalledWith({
      from: process.env.SMTP_FROM || "nasa-apod@yourdomain.com",
      to: "user@example.com",
      subject: `NASA APOD: ${data.title}`,
      html: expect.any(String),
    });
  });
});
