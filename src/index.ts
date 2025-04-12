import express from "express";
import dotenv from "dotenv";
import apodRoutes from "./apod/apod.routes.js";
dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

apodRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
