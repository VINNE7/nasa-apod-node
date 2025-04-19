import dotenv from "dotenv";

import express from "express";
import apodRoutes from "./apod/apod.routes.js";
dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;
console.log("[ENV] NASA_API_URL =", process.env.NASA_API_URL);
app.use(express.json());

apodRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
