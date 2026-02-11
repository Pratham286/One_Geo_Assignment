import express from "express";
import { analyseFile, deleteFile, getAllFiles, getFile, uploadFile } from "../controllers/dataControllers.js";

const router = express.Router();

router.post("/upload", uploadFile);
router.get("/getfile/:id", getFile);
router.get("/getallfiles", getAllFiles);
router.delete("/delele/:id", deleteFile);
router.get("/analysefile/:id", analyseFile)

export default router;
