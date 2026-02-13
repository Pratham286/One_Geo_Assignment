import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import
import { s3 } from "../config/s3.js";
import fs from "fs";
import dotenv from "dotenv";
import { Las } from "las-js";
dotenv.config({
  path: "../.env",
});
import { LasData } from "../models/lasData.js";
import { WellData } from "../models/wellData.js";

export const uploadFile = async (req, res) => {
  try {
    const data = fs.readFileSync("./sample.las");
    const uploadKey = `las-files/${Date.now()}-sample.las`;

    const uploadParams = {
      Bucket: process.env.S3_bucket_name,
      Key: uploadKey,
      Body: data,
      ContentType: "text/plain",
    };
    // await s3.send(new PutObjectCommand(uploadParams));
    const bucket = process.env.S3_bucket_name;
    const s3key = `s3://${bucket}/${uploadKey}`;

    // mongoDB
    const lasFile = new Las(data.toString("utf-8"), { loadFile: false });

    const well = await lasFile.wellParams(); // { WELL: {value, unit, desc}, STRT: {...}, ... }
    const curves = await lasFile.curveParams(); // { GR: {unit, desc}, RHOB: {...}, ... }
    const dataSet = await lasFile.data(); // { DEPT: [100, 101, ...], GR: [45.2, 46.1, ...], ... }
    const version = await lasFile.version(); // { VERS: {value, ...}, WRAP: {...} }

    // console.log(dataSet);

    const wellInfo = {
      wellName: well.WELL?.value ?? "UNKNOWN",
      company: well.COMP?.value ?? null,
      field: well.FLD?.value ?? null,
      location: well.LOC?.value ?? null,
      province: well.PROV?.value ?? null,
      county: well.CNTY?.value ?? null,
      state: well.STAT?.value ?? null,
      country: well.CTRY?.value ?? null,
      serviceCompany: well.SRVC?.value ?? null,
      dateAnalyzed: well.DATE?.value ?? null,
      uwi: well.UWI?.value ?? null,
      api: well.API?.value ?? null,
      startDepth: parseFloat(well.STRT?.value) || 0,
      stopDepth: parseFloat(well.STOP?.value) || 0,
      step: parseFloat(well.STEP?.value) || 0,
      depthUnit: well.STRT?.unit ?? "F",
      nullValue: parseFloat(well.NULL?.value) || -9999.0,
    };

    const curvesArray = Object.entries(curves).map(([name, meta]) => ({
      name,
      unit: meta.unit ?? "UNKN",
      description: meta.description ?? "",
      trackNumber: null,
    }));

    const curveNames = Object.keys(curves);
    // console.log("Curve names:", curveNames);
    // First check: ['Depth', 'Time', 'HC1', 'HC2', ...]

    // Case-insensitive search to handle DEPT / DEPTH / Depth etc.
    const depthColIdx = curveNames.findIndex(
      (n) => n.toLowerCase() === "dept" || n.toLowerCase() === "depth",
    );
    const timeColIdx = curveNames.findIndex(
      (n) => n.toLowerCase() === "time" || n.toLowerCase() === "sec",
    );

    const dataRows = dataSet.map((row) => {
      const values = {};

      for (let i = 0; i < curveNames.length; i++) {
        if (i === depthColIdx || i === timeColIdx) continue;
        values[curveNames[i]] = row[i] ?? null;
      }

      return {
        depth: row[depthColIdx],
        time: timeColIdx > -1 ? (row[timeColIdx] ?? null) : null,
        values,
      };
    });
    console.log(dataRows.length);
    console.log(dataRows[0]);
    // console.log("First row:", dataRows[0]);

    const lasDoc = await LasData.create({
      filename: uploadKey.split("/").pop(),
      originalName: "randomName",
      s3Key: uploadKey,
      s3Url: `s3://${process.env.S3_bucket_name}/${uploadKey}`,
      fileSize: data.length,
      versionInfo: {
        version: version ?? "2.00",
        wrap: version?.WRAP?.value ?? "NO",
      },
      wellInfo,
      curves: curvesArray,
      status: "processing",
    });
    console.log("✅ LasData saved, id:", lasDoc._id);

    const BATCH_SIZE = 5000;
    let totalInserted = 0;

    for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
      const batch = dataRows.slice(i, i + BATCH_SIZE).map((row) => ({
        fileId: lasDoc._id,
        depth: row.depth,
        time: row.time,
        values: row.values,
      }));

      const result = await WellData.insertMany(batch, { ordered: false });
      totalInserted += result.length;
    }
    console.log(`✅ WellData inserted: ${totalInserted} rows`);

    await LasData.findByIdAndUpdate(lasDoc._id, {
      status: "ready",
      "stats.totalDataPoints": totalInserted,
      "stats.depthRange.min": wellInfo.startDepth,
      "stats.depthRange.max": wellInfo.stopDepth,
    });
    console.log("✅ LasData marked as ready");

    return res.status(200).json({
      message: "File uploaded and processed successfully",
      fileId: lasDoc._id,
      wellName: wellInfo.wellName,
      curves: curvesArray.map((c) => c.name),
      totalDataPoints: totalInserted,
      depthRange: {
        min: wellInfo.startDepth,
        max: wellInfo.stopDepth,
      },
    });
  } catch (error) {
    console.error("Error in uploading file", error);
    return res.status(500).json({ error: "Upload failed" });
  }
};
// export const uploadFile = async (req, res) => {
//   try {
//     const data = fs.readFileSync("./sample.las");
//     const uploadKey = "randomthing";

//     const uploadParams = {
//       Bucket: process.env.S3_bucket_name,
//       Key: uploadKey,
//       Body: data,
//       ContentType: "text/plain",
//     };
//     // console.log(uploadParams)
//     // console.log(s3);
//     // await s3.send(new PutObjectCommand(uploadParams));
//     const bucket = process.env.S3_bucket_name;
//     const s3key = `s3://${bucket}/${uploadKey}`;

//     // mongoDB
//     const lasFile = new Las(data.toString("utf-8"), { loadFile: false });

//     const well = await lasFile.wellParams(); // { WELL: {value, unit, desc}, STRT: {...}, ... }
//     const curves = await lasFile.curveParams(); // { GR: {unit, desc}, RHOB: {...}, ... }
//     const dataSet = await lasFile.data(); // { DEPT: [100, 101, ...], GR: [45.2, 46.1, ...], ... }
//     const version = await lasFile.version(); // { VERS: {value, ...}, WRAP: {...} }

//     const wellInfo = {
//       wellName: well.WELL?.value ?? "UNKNOWN",
//       company: well.COMP?.value ?? null,
//       field: well.FLD?.value ?? null,
//       location: well.LOC?.value ?? null,
//       province: well.PROV?.value ?? null,
//       county: well.CNTY?.value ?? null,
//       state: well.STAT?.value ?? null,
//       country: well.CTRY?.value ?? null,
//       serviceCompany: well.SRVC?.value ?? null,
//       dateAnalyzed: well.DATE?.value ?? null,
//       uwi: well.UWI?.value ?? null,
//       api: well.API?.value ?? null,
//       startDepth: parseFloat(well.STRT?.value) || 0,
//       stopDepth: parseFloat(well.STOP?.value) || 0,
//       step: parseFloat(well.STEP?.value) || 0,
//       depthUnit: well.STRT?.unit ?? "F",
//       nullValue: parseFloat(well.NULL?.value) || -9999.0,
//     };

//     const curvesArray = Object.entries(curves).map(([name, meta]) => ({
//       name,
//       unit: meta.unit ?? "UNKN",
//       description: meta.description ?? "",
//       trackNumber: null,
//     }));

//     // const depthArray  = data.DEPT ?? data.DEPTH ?? [];
//     // const timeArray   = data.TIME ?? data.SEC   ?? [];
//     // const curveNames  = Object.keys(data).filter(k => k !== 'DEPT' && k !== 'DEPTH' && k !== 'TIME' && k !== 'SEC');

//     // const depthArray = [];
//     // const timeArray = [];
//     // const curveNames = [];

//     // for (let j = 0; j < curvesArray.length; j++) {
//     //   for (let i = 0; i < dataSet.length; i++) {
//     //     if(j == 0)
//     //     {
//     //         depthArray.push(dataSet[i][j]);
//     //     }
//     //     else if(j == 1)
//     //     {
//     //         timeArray.push(dataSet[i][j]);
//     //     }
//     //     else
//     //     {
//     //         curveNames.push(curvesArray[j].name);
//     //     }
//     //   }
//     // }

//     const curveNames = Object.keys(curves);
//     console.log("Curve names:", curveNames);
//     // First check: ['Depth', 'Time', 'HC1', 'HC2', ...]

//     // Case-insensitive search to handle DEPT / DEPTH / Depth etc.
//     const depthColIdx = curveNames.findIndex(
//       (n) => n.toLowerCase() === "dept" || n.toLowerCase() === "depth",
//     );
//     const timeColIdx = curveNames.findIndex(
//       (n) => n.toLowerCase() === "time" || n.toLowerCase() === "sec",
//     );

//     const dataRows = dataSet.map((row) => {
//       const values = {};

//       for (let i = 0; i < curveNames.length; i++) {
//         if (i === depthColIdx || i === timeColIdx) continue;
//         values[curveNames[i]] = row[i] ?? null;
//       }

//       return {
//         depth: row[depthColIdx],
//         time: timeColIdx > -1 ? (row[timeColIdx] ?? null) : null,
//         values,
//       };
//     });

//     console.log("First row:", dataRows[0]);
//     // Expected: { depth: 8665, time: 3832663832.41, values: { HC1: 279.03, ... } }

//     // console.log("✅ File uploaded successfully");
//     // console.log(curvesArray);

//     const lasDoc = await LasData.create({
//       filename:    uploadKey.split('/').pop(),
//       originalName : "randomName",
//       s3Key:       uploadKey,
//       s3Url:       `s3://${process.env.S3_bucket_name}/${uploadKey}`,
//       fileSize:    data.length,
//       versionInfo: {
//         version: version ?? '2.00',
//         wrap:    'NO',
//       },
//       wellInfo,
//       curves: curvesArray,
//       status: 'processing',
//     });
//     console.log('✅ LasData saved, id:', lasDoc._id);

//     return res.status(200).json({ message: "File uploaded successfully" });
//   } catch (error) {
//     console.error("Error in uploading file", error);
//     return res.status(500).json({ error: "Upload failed" });
//   }
// };

export const getFile = async (req, res) => {};
export const getAllFiles = async (req, res) => {};
export const deleteFile = async (req, res) => {};
export const analyseFile = async (req, res) => {};
