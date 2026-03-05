const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const validator = require('validator');
const QR = require('../models/QRCode');

// Generate unique code
const generateUniqueCode = () => nanoid(7);

// Validate URL
const isValidUrl = (url) => {
  try {
    return validator.isURL(url, { 
      protocols: ['http', 'https'],
      require_protocol: true,
      require_host: true
    });
  } catch (error) {
    return false;
  }
};

// @desc    Create new QR Code
// @route   POST /api/qr/create
exports.createQR = async (req, res) => {
  try {
    const { title, destinationUrl, qrType = 'square', foregroundColor = '#000000', backgroundColor = '#FFFFFF', logo, frameText } = req.body;

    // Validate input
    if (!title || !destinationUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title and destination URL are required'
      });
    }

    // Validate URL
    if (!isValidUrl(destinationUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination URL format. Must be a valid HTTP/HTTPS URL'
      });
    }

    // Generate unique code
    let code = generateUniqueCode();
    
    // Check for uniqueness
    let existing = await QR.findOne({ code });
    while (existing) {
      code = generateUniqueCode();
      existing = await QR.findOne({ code });
    }

    // Create redirect URL
    const domain = process.env.DOMAIN || 'http://localhost:5000';
    const redirectUrl = `${domain}/r/${code}`;

    // Generate QR code as data URL
    const qrImageData = await QRCode.toDataURL(redirectUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      }
    });

    // Create document
    const qrDoc = await QR.create({
      code,
      title,
      destinationUrl,
      qrType,
      foregroundColor,
      backgroundColor,
      logo: logo || null,
      frameText: frameText || ''
    });

    res.status(201).json({
      success: true,
      message: 'QR Code created successfully',
      data: {
        id: qrDoc._id,
        code: qrDoc.code,
        title: qrDoc.title,
        destinationUrl: qrDoc.destinationUrl,
        redirectUrl,
        qrType: qrDoc.qrType,
        qrImage: qrImageData,
        createdAt: qrDoc.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating QR code:', error);
    
    // Handle specific errors
    let errorMessage = 'Failed to create QR code';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid data provided';
      statusCode = 400;
    } else if (error.code === 11000) {
      errorMessage = 'A QR code with this code already exists';
      statusCode = 409;
    } else if (error.message.includes('QRCode')) {
      errorMessage = 'Error generating QR code image. Please check your input values.';
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all QR Codes
// @route   GET /api/qr
exports.getAllQRs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { destinationUrl: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const qrcodes = await QR.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await QR.countDocuments(query);

    res.json({
      success: true,
      data: qrcodes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR codes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single QR Code
// @route   GET /api/qr/:code
exports.getQRByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const qr = await QR.findOne({ code });

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: 'QR Code not found'
      });
    }

    const domain = process.env.DOMAIN || 'http://localhost:5000';
    const redirectUrl = `${domain}/r/${code}`;

    res.json({
      success: true,
      data: {
        ...qr.toObject(),
        redirectUrl
      }
    });

  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update QR Code
// @route   PUT /api/qr/:code
exports.updateQR = async (req, res) => {
  try {
    const { code } = req.params;
    const { title, destinationUrl, qrType, foregroundColor, backgroundColor, status, frameText } = req.body;

    // Check if QR exists
    let qr = await QR.findOne({ code });
    
    if (!qr) {
      return res.status(404).json({
        success: false,
        message: 'QR Code not found'
      });
    }

    // Validate URL if provided
    if (destinationUrl && !isValidUrl(destinationUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination URL format'
      });
    }

    // Build update object
    const updates = {};
    if (title) updates.title = title;
    if (destinationUrl) updates.destinationUrl = destinationUrl;
    if (qrType) updates.qrType = qrType;
    if (foregroundColor) updates.foregroundColor = foregroundColor;
    if (backgroundColor) updates.backgroundColor = backgroundColor;
    if (status !== undefined) updates.status = status;
    if (frameText !== undefined) updates.frameText = frameText;

    // Update document
    qr = await QR.findOneAndUpdate(
      { code },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'QR Code updated successfully',
      data: qr
    });

  } catch (error) {
    console.error('Error updating QR code:', error);
    
    let errorMessage = 'Failed to update QR code';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Invalid data provided';
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete QR Code
// @route   DELETE /api/qr/:code
exports.deleteQR = async (req, res) => {
  try {
    const { code } = req.params;

    const qr = await QR.findOneAndDelete({ code });

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: 'QR Code not found'
      });
    }

    res.json({
      success: true,
      message: 'QR Code deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Redirect endpoint
// @route   GET /r/:code
exports.redirect = async (req, res) => {
  try {
    const { code } = req.params;

    // Find active QR code
    const qr = await QR.findOne({ code, status: true });

    if (!qr) {
      // QR not found or inactive - show error page
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>QR Code Not Found</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 40px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
            h1 { font-size: 48px; margin-bottom: 20px; }
            p { font-size: 20px; opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ QR Code Not Found</h1>
            <p>This QR code is invalid or has been deactivated.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Increment scan count
    qr.scanCount += 1;
    await qr.save();

    // Redirect to destination URL
    res.redirect(302, qr.destinationUrl);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Internal Server Error');
  }
};

// @desc    Get analytics for QR Code
// @route   GET /api/qr/:code/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { code } = req.params;

    const qr = await QR.findOne({ code });

    if (!qr) {
      return res.status(404).json({
        success: false,
        message: 'QR Code not found'
      });
    }

    res.json({
      success: true,
      data: {
        code: qr.code,
        totalScans: qr.scanCount,
        createdAt: qr.createdAt,
        updatedAt: qr.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get overall analytics
// @route   GET /api/qr/analytics/overview
exports.getOverallAnalytics = async (req, res) => {
  try {
    const totalQRs = await QR.countDocuments();
    const activeQRs = await QR.countDocuments({ status: true });
    
    const totalScansResult = await QR.aggregate([
      { $group: { _id: null, total: { $sum: '$scanCount' } } }
    ]);
    const totalScans = totalScansResult[0]?.total || 0;

    const recentQRs = await QR.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalQRCodes: totalQRs,
        activeQRCodes: activeQRs,
        totalScans: totalScans,
        recentQRCodes: recentQRs
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
