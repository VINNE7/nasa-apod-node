export class BaseException extends Error {
  public readonly name: string;
  public readonly statusCode: number;
  public readonly context?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    context?: unknown,
    name = "BaseException",
  ) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}
