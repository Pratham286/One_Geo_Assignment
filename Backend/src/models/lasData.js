import mongoose from 'mongoose';

const LasDataSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: true,
    unique: true
  },
  s3Url: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  
  // Version Information (~V section)
  versionInfo: {
    version: { 
      type: String,
      default: '2.00'
    },
    wrap: { 
      type: String,
      default: 'NO'
    }
  },
  
  // Well Information (~W section)
  wellInfo: {
    wellName: { 
      type: String,
      default: 'WELL1'
    },
    company: { 
      type: String,
      default: 'CLIENT COMPANY'
    },
    field: { 
      type: String,
      default: 'FIELD'
    },
    location: { 
      type: String,
      default: '31.260966, -103.165250'
    },
    province: String,
    county: String,
    state: String,
    country: { 
      type: String,
      default: 'USA'
    },
    serviceCompany: { 
      type: String,
      default: 'SERVICE COMPANY'
    },
    dateAnalyzed: { 
      type: String,
      default: '06/13/2025'
    },
    uwi: String,
    api: String,
    
    // Depth information
    startDepth: { 
      type: Number,
      required: true
    },
    stopDepth: { 
      type: Number,
      required: true
    },
    step: { 
      type: Number,
      required: true
    },
    depthUnit: { 
      type: String,
      default: 'F' // Feet
    },
    nullValue: { 
      type: Number,
      default: -9999.00
    }
  },
  
  // Curve Information (~C section)
  // 106 curves in your file
  curves: [{
    name: { 
      type: String,
      required: true
    },
    unit: { 
      type: String,
      default: 'UNKN'
    },
    description: { 
      type: String
    },
    trackNumber: { 
      type: Number
    }
  }],
  
  // Metadata
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'error'],
    default: 'uploading'
  },
  errorMessage: {
    type: String
  },
  
  // Statistics (for quick access)
  stats: {
    totalDataPoints: { 
      type: Number
    },
    depthRange: {
      min: { type: Number },
      max: { type: Number }
    }
  }
  
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for faster queries
LasDataSchema.index({ 'wellInfo.wellName': 1 });
LasDataSchema.index({ uploadDate: -1 });
LasDataSchema.index({ status: 1 });

// export default mongoose.model('File', FileSchema);
export const LasData = mongoose.model('LasData', LasDataSchema);