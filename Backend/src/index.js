import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import app from "./app.js";
import las from "las-js";
import { Las } from "las-js";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config({
  path: "../.env",
});

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server started at port ${PORT}!`);
});
