import express from 'express';
import { AnalyseFile } from '../controllers/aiControllers.js';

const router = express.Router();

router.post('/generate/:id', AnalyseFile)

export default router;