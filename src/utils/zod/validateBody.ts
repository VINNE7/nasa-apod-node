import { Request } from "express";
import { z, ZodSchema } from "zod";
const validateBody = <T>(req: Request) => ({
  with: <U extends ZodSchema<T>>(schema: U): z.infer<U> =>
    schema.parse(req.body ?? {}),
});

export default validateBody;
