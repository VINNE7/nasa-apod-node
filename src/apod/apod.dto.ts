import { z } from "zod";

const getApodSchema = z.object({
  email: z.string().min(1, "email is required").email("Invalid email format"),
});

export default getApodSchema;
