import express from 'express';
import dotenv from 'dotenv'
import { connectDB } from './config/db.js';

dotenv.config({
    path : '../.env'
});
const app = express();

connectDB();

// console.log(process.env.PORT);
const PORT = process.env.PORT || 5000;

app.use("/", (req, res) => {
    return res.send("Hello World");
})

app.listen(PORT, () => {
    console.log(`Backend server started at port ${PORT}!`);
})