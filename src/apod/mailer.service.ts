import nodemailer from "nodemailer";
import { NasaApodResponse } from "./apod.types.js";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  };

  return nodemailer.createTransport(config);
};

const formatApodEmail = (data: NasaApodResponse): string => {
  const isImage = data.media_type === "image";
  const mediaContent = isImage
    ? `<img src="${data.url}" alt="${data.title}" style="max-width: 100%; height: auto; margin: 20px 0;">`
    : `<a href="${data.url}" target="_blank">Watch the video here</a>`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c3e50; text-align: center;">${data.title}</h1>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${mediaContent}
      </div>
      <div style="color: #34495e; line-height: 1.6;">
        <p><strong>Date:</strong> ${data.date}</p>
        <p>${data.explanation}</p>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 0.9em;">
        <p>NASA Astronomy Picture of the Day</p>
      </div>
    </div>
  `;
};

const sendApodEmail = async (
  to: string,
  data: NasaApodResponse,
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || "nasa-apod@yourdomain.com",
    to,
    subject: `NASA APOD: ${data.title}`,
    html: formatApodEmail(data),
  };

  console.log("[Mailer] Sending email to", to);
  await transporter.sendMail(mailOptions);
};

export const mailerService = { sendApodEmail };
