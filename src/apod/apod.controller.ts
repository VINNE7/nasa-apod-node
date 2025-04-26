import { Request, Response } from "express";
import triggerJobBatch from "./jobProcessing.facade.js";
import statusCodes from "../utils/statusCode/statusCodes.js";
import validateBody from "../utils/zod/validateBody.js";
import getApodSchema from "./apod.dto.js";

const sendApod = async (req: Request, res: Response) => {
  const { email } = validateBody(req).with(getApodSchema);

  res.status(statusCodes.OK).json({ message: "request accepted" });

  triggerJobBatch(email);
};

export default { sendApod };
