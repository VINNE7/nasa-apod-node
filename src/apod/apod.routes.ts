import { Application } from "express";
import apodController from "./apod.controller.js";

const apodRoutes = (app: Application) => {
  app.post("/nasa/request-apod", apodController.sendApod);
};

export default apodRoutes;
