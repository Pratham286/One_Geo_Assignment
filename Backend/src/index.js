import express from 'express';
import dotenv from 'dotenv'
import { connectDB } from './config/db.js';
import app from './app.js';
import las from 'las-js'
import {Las} from 'las-js'
import fs from "fs";

dotenv.config({
    path : '../.env'
});


const data = fs.readFileSync("./sample.las", { encoding: 'utf8' });
// console.log("File size:", data.length);

connectDB();

// const reader = new las.Reader(data);
// const header = reader.header;

// const myLas = new Las(data, {loadFile : false})

// const num = await myLas.column('Time')
// console.log(num);

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`Backend server started at port ${PORT}!`);
})