import express from "express";
import { router as index } from "../api/index";
import { router as trip } from "../api/trip";
import { router as upload } from "../api/upload"
import cors from "cors";
import bodyParser from "body-parser";

export const app = express();

app.use(bodyParser.text());
app.use(bodyParser.json());

app.use(
    cors({
      origin: "*",
    })
  );

app.use("/ind", index);
app.use("/trip", trip);
app.use("/upload", upload);
app.use("/uploads", express.static("uploads"));