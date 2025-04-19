import { Request, Response } from "express";
import triggerJobBatch from "./jobProcessing.facade.js";

const sendApod = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).send("Email is required");
    return;
  }

  res.status(200).json({ message: "request accepted" });

  triggerJobBatch(email);
};

export default { sendApod };
