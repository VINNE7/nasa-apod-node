import { BaseException } from "./baseException.js";

export class NasaApiException extends BaseException {
  constructor(message: string, context?: unknown) {
    super(message, 502, context, "NasaApiException");
  }
}
