const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 255
  },
  destinationUrl: {
    type: String,
    required: [true, 'Destination URL is required'],
    trim: true
  },
  qrType: {
    type: String,
    enum: ['square', 'rounded', 'dots', 'circle', 'frame', 'scanme'],
    default: 'square'
  },
  foregroundColor: {
    type: String,
    default: '#000000'
  },
  backgroundColor: {
    type: String,
    default: '#FFFFFF'
  },
  logo: {
    type: String,
    default: null
  },
  frameText: {
    type: String,
    default: ''
  },
  scanCount: {
    type: Number,
    default: 0
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster lookups (code index already defined in schema)
qrCodeSchema.index({ status: 1 });
qrCodeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QRCode', qrCodeSchema);
