import express from "express";
import { analyseFile, deleteFile, getAllFiles, getFile, getRangeInfo, uploadFile } from "../controllers/dataControllers.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", upload.single('file'),uploadFile);
// router.get("/upload", uploadFile);
router.get("/getfile/:id", getFile);
router.get("/getallfiles", getAllFiles);
router.delete("/delete/:id", deleteFile);
router.get("/analysefile/:id", analyseFile);
router.get("/rangeinfo/:id", getRangeInfo);

export default router;
