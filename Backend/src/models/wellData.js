// import mongoose from 'mongoose';

// const WellDataSchema = new mongoose.Schema({
//   // Reference to Las  File
//   fileId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'LasData',
//     required: true,
//     index: true
//   },
  
//   // All curve data
//   // Using Map for flexible curve storage
//   data: [{
//     depth: { 
//       type: Number,
//       required: true
//     },
//     time: { 
//       type: Number  // SEC
//     },
//     values: {
//       type: Map,
//       of: Number
//       // Will store: HC1, HC2, HC3, ..., TOTAL_GAS, etc.
//       // Example: { HC1: 279.03, HC2: 127.26, TOTAL_GAS: 24.25, ... }
//     }
//   }],
  
//   // For optimization
//   depthRange: {
//     min: { 
//       type: Number,
//       required: true
//     },
//     max: { 
//       type: Number,
//       required: true
//     }
//   }
  
// }, {
//   timestamps: true
// });

// // Compound index for depth range queries
// WellDataSchema.index({ fileId: 1, 'data.depth': 1 });

// // export default mongoose.model('WellData', WellDataSchema);
// export const WellData = mongoose.model('WellData', WellDataSchema);

import mongoose from 'mongoose';

const WellDataSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LasData',
    required: true,
    index: true
  },

  depth: {
    type: Number,
    required: true
  },

  time: {
    type: Number,
    default: null
  },

  values: {
    type: Map,
    of: Number
  }

}, {
  timestamps: false  // saves space — don't need createdAt on every row
});

// Compound index — makes depth range queries fast
WellDataSchema.index({ fileId: 1, depth: 1 });

export const WellData = mongoose.model('WellData', WellDataSchema);