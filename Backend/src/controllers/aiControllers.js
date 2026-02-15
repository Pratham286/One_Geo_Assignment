import { GoogleGenAI } from "@google/genai";
import { LasData } from "../models/lasData.js";
import { WellData } from "../models/wellData.js";

function prepareDataForAI(wellData, curves) {
  const summary = {
    totalPoints: wellData.length,
    depthRange: {
      min: wellData[0]?.depth,
      max: wellData[wellData.length - 1]?.depth
    },
    statistics: {}
  };

  curves.forEach(curveName => {
    const values = wellData
      .map(point => point.values[curveName])
      .filter(v => v !== undefined && v !== null);

    if (values.length > 0) {
      summary.statistics[curveName] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        samples: values.length
      };
    }
  });

  // Sample data (first 10, middle 10, last 10 points)
  const sampleData = [
    ...wellData.slice(0, 10),
    ...wellData.slice(Math.floor(wellData.length / 2) - 5, Math.floor(wellData.length / 2) + 5),
    ...wellData.slice(-10)
  ];

  return { summary, sampleData };
}

function createAnalysisPrompt(file, startDepth, endDepth, curves, dataForAI) {
  const { summary, sampleData } = dataForAI;

  return `You are an expert petroleum geologist and well-log analyst. Analyze the following well-log data and provide a comprehensive interpretation.

**Well Information:**
- Well Name: ${file.wellInfo.wellName}
- Company: ${file.wellInfo.company}
- Field: ${file.wellInfo.field}
- Location: ${file.wellInfo.location}

**Depth Range:**
- Start: ${startDepth} ${file.wellInfo.depthUnit}
- End: ${endDepth} ${file.wellInfo.depthUnit}
- Total Depth: ${endDepth - startDepth} ${file.wellInfo.depthUnit}

**Analyzed Curves:**
${curves.join(', ')}

**Data Statistics:**
${JSON.stringify(summary.statistics, null, 2)}

**Sample Data Points:**
${JSON.stringify(sampleData.map(point => ({
  depth: point.depth,
  values: Object.fromEntries(
    curves.map(c => [c, point.values[c]]).filter(([_, v]) => v !== undefined)
  )
})), null, 2)}

**Please provide:**

1. **Gas Show Assessment** (if hydrocarbon curves present):
   - Identify zones with significant gas shows
   - Evaluate gas composition (dry vs wet gas)
   - Note any anomalies or spikes

2. **Lithology Interpretation** (if available from curves):
   - Likely rock types in this interval
   - Porosity assessment
   - Permeability indicators

3. **Key Observations:**
   - Trends in the data
   - Depth intervals of interest
   - Any unusual patterns

4. **Recommendations:**
   - Zones worthy of further investigation
   - Additional tests or analyses needed
   - Potential hydrocarbon zones

Keep the analysis professional, specific, and actionable. Use depth values and actual measurements from the data.`;
}
export const AnalyseFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDepth, endDepth, curves } = req.body;

    console.log("Analyzing file:", id);

    const file = await LasData.findById(id);
    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    // Set depth range 
    const depthStart = startDepth || file.wellInfo.startDepth;
    const depthEnd = endDepth || file.wellInfo.stopDepth;

    const analyzeCurves =
      curves && curves.length > 0
        ? curves
        : file.curves.slice(0, 5).map((c) => c.name); 

    console.log(`Analyzing curves: ${analyzeCurves.join(", ")}`);
    console.log(
      `Depth range: ${depthStart} - ${depthEnd} ${file.wellInfo.depthUnit}`,
    );

    const wellData = await WellData.find({
      fileId: id,
      depth: { $gte: depthStart, $lte: depthEnd },
    })
      .select("depth values")
      .sort({ depth: 1 })
      .limit(500)
      .lean();

    if (wellData.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No data found in specified depth range",
      });
    }

    console.log(`Found ${wellData.length} data points`);

    const dataForAI = prepareDataForAI(wellData, analyzeCurves);

    // AI prompt
    const prompt = createAnalysisPrompt(
      file,
      depthStart,
      depthEnd,
      analyzeCurves,
      dataForAI,
    );

    console.log("Calling Gemini API...");
    const ai = new GoogleGenAI({ apiKey: process.env.Gemini_API_Key });
    
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
    });
    
    const interpretation = result.text;

    console.log("AI analysis complete");
    console.log("Interpretation:", interpretation);

    return res.status(200).json({
      success: true,
      data: {
        fileId: id,
        wellName: file.wellInfo.wellName,
        depthRange: {
          start: depthStart,
          end: depthEnd,
          unit: file.wellInfo.depthUnit,
        },
        analyzedCurves: analyzeCurves,
        dataPointsAnalyzed: wellData.length,
        interpretation: interpretation,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
