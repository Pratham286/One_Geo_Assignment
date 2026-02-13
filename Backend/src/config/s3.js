import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

export const s3 = new S3Client({
  region: process.env.S3_region,
  credentials: {
    accessKeyId: process.env.S3_access_key,
    secretAccessKey: process.env.S3_secret_key,
  },
});