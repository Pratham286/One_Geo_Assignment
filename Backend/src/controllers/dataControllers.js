import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";
import dotenv from "dotenv";
import { Las } from "las-js";
dotenv.config({ path: "../.env" });
import { LasData } from "../models/lasData.js";
import { WellData } from "../models/wellData.js";

export const uploadFile = async (req, res) => {
    let uploadKey = null;
    let lasDoc = null;
    
    try {
        // Validate file
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: "No file uploaded" 
            });
        }
        
        console.log('📁 File received:', req.file.originalname);
        
        // Prepare S3 upload
        const data = req.file.buffer;
        uploadKey = `las-files/${Date.now()}-${req.file.originalname}`;
        
        const uploadParams = {
            Bucket: process.env.S3_bucket_name,
            Key: uploadKey,
            Body: data,
            ContentType: "text/plain",
        };
        
        // Upload to S3
        console.log('☁️  Uploading to S3...');
        await s3.send(new PutObjectCommand(uploadParams));
        console.log("✅ File uploaded to S3");
        
        const bucket = process.env.S3_bucket_name;
        const region = process.env.AWS_REGION || 'us-east-1';
        const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${uploadKey}`;
        
        // Parse LAS file
        console.log('📊 Parsing LAS file...');
        const lasFile = new Las(data.toString("utf-8"), { loadFile: false });
        
        const well = await lasFile.wellParams();
        const curves = await lasFile.curveParams();
        const dataSet = await lasFile.data();
        const version = await lasFile.version();
        
        // Extract well info
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
            step: parseFloat(well.STEP?.value) || 1,
            depthUnit: well.STRT?.unit ?? "F",
            nullValue: parseFloat(well.NULL?.value) || -9999.0,
        };
        
        // Extract curves
        const curvesArray = Object.entries(curves).map(([name, meta], index) => ({
            name,
            unit: meta.unit ?? "UNKN",
            description: meta.description ?? "",
            trackNumber: index,
        }));
        
        // Find depth and time columns
        const curveNames = Object.keys(curves);
        const depthColIdx = curveNames.findIndex(
            (n) => n.toLowerCase() === "dept" || n.toLowerCase() === "depth"
        );
        const timeColIdx = curveNames.findIndex(
            (n) => n.toLowerCase() === "time" || n.toLowerCase() === "sec"
        );
        
        if (depthColIdx === -1) {
            throw new Error('Depth column not found in LAS file');
        }
        
        // Extract data rows
        const dataRows = dataSet.map((row) => {
            const values = {};
            
            for (let i = 0; i < curveNames.length; i++) {
                if (i === depthColIdx || i === timeColIdx) continue;
                
                const value = row[i];
                // Skip null values
                if (value !== null && value !== undefined && value !== wellInfo.nullValue) {
                    values[curveNames[i]] = value;
                }
            }
            
            return {
                depth: row[depthColIdx],
                time: timeColIdx > -1 ? (row[timeColIdx] ?? null) : null,
                values,
            };
        });
        
        console.log(`✅ Parsed ${dataRows.length} data points, ${curvesArray.length} curves`);
        
        // Create LasData document
        console.log('💾 Saving to MongoDB...');
        lasDoc = await LasData.create({
            filename: uploadKey.split("/").pop(),
            originalName: req.file.originalname,
            s3Key: uploadKey,
            s3Url: s3Url,
            fileSize: req.file.size,
            versionInfo: {
                version: version?.VERS?.value ?? "2.00",
                wrap: version?.WRAP?.value ?? "NO"
            },
            wellInfo,
            curves: curvesArray,
            status: "processing",
        });
        console.log("✅ LasData saved, id:", lasDoc._id);
        
        // Bulk insert WellData
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
        
        // Update status to ready
        await LasData.findByIdAndUpdate(lasDoc._id, {
            status: "ready",
            "stats.totalDataPoints": totalInserted,
            "stats.depthRange.min": wellInfo.startDepth,
            "stats.depthRange.max": wellInfo.stopDepth,
        });
        console.log("✅ LasData marked as ready");
        
        // Return success
        return res.status(200).json({
            success: true,
            message: "File uploaded and processed successfully",
            data: {
                fileId: lasDoc._id,
                filename: req.file.originalname,
                wellName: wellInfo.wellName,
                company: wellInfo.company,
                field: wellInfo.field,
                depthRange: {
                    start: wellInfo.startDepth,
                    end: wellInfo.stopDepth,
                    unit: wellInfo.depthUnit
                },
                totalCurves: curvesArray.length,
                totalDataPoints: totalInserted
            }
        });
        
    } catch (error) {
        console.error("❌ Upload Error:", error);
        
        // Cleanup on error
        if (uploadKey) {
            try {
                console.log('🧹 Cleaning up S3...');
                await s3.send(new DeleteObjectCommand({
                    Bucket: process.env.S3_bucket_name,
                    Key: uploadKey
                }));
            } catch (s3Error) {
                console.error('Failed to delete from S3:', s3Error);
            }
        }
        
        if (lasDoc) {
            try {
                console.log('🧹 Cleaning up MongoDB...');
        await LasData.findByIdAndDelete(lasDoc._id);
        await WellData.deleteMany({ fileId: lasDoc._id });
    } catch (dbError) {
        console.error('Failed to cleanup database:', dbError);
    }
}

return res.status(500).json({
    success: false,
    error: "Upload failed",
    message: error.message
});
}
};
export const getFile = async (req, res) => {};
export const getAllFiles = async (req, res) => {};
export const deleteFile = async (req, res) => {};
export const analyseFile = async (req, res) => {};