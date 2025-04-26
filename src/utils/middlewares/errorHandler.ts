import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import statusCodes from "../statusCode/statusCodes.js";
import { errorMessages } from "../errors/errorMessages.js";
import { ZodError } from "zod";

const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _nextFunction: NextFunction,
) => {
  if (err instanceof ZodError) {
    // translating zod error messages into a more readable errorMessage
    const reason = err.errors
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    res.status(statusCodes.BAD_REQUEST).json({
      error: errorMessages.BAD_REQUEST(reason),
      stack: err.stack,
    });
  }

  console.error(err);
  res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
    error: "Internal Server Error",
    stack: err instanceof Error ? err.stack : undefined,
  });
};

export default errorHandler;
