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
    const domain = process.env.DOMAIN || 'http://localhost:5003';
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
    const { page = 1, limit = 20, search = '', includeImage = 'false' } = req.query;
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

    // Generate QR images if requested (for dashboard/cards)
    const qrcodesWithImages = includeImage === 'true' ? 
      await Promise.all(qrcodes.map(async (qr) => {
        try {
          const domain = process.env.DOMAIN || 'http://localhost:5003';
          const redirectUrl = `${domain}/r/${qr.code}`;
          const qrImageData = await QRCode.toDataURL(redirectUrl, {
            width: 300,
            margin: 2,
            color: {
              dark: qr.foregroundColor || '#000000',
              light: qr.backgroundColor || '#FFFFFF'
            }
          });
          return {
            ...qr.toObject(),
            qrImage: qrImageData
          };
        } catch (error) {
          console.error(`Error generating QR image for ${qr.code}:`, error);
          return qr.toObject();
        }
      })) : qrcodes.map(qr => qr.toObject());

    const total = await QR.countDocuments(query);

    res.json({
      success: true,
      data: qrcodesWithImages,
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

    const domain = process.env.DOMAIN || 'http://localhost:5003';
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

    // Create intermediate page with auto-redirect and session storage
    const domain = process.env.DOMAIN || 'http://localhost:5003';
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redirecting...</title>
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
          h1 { font-size: 32px; margin-bottom: 20px; }
          p { font-size: 18px; opacity: 0.9; }
          .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .manual-link {
            margin-top: 20px;
            padding: 12px 24px;
            background: rgba(255,255,255,0.2);
            border: none;
            border-radius: 8px;
            color: white;
            text-decoration: none;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
          }
          .manual-link:hover {
            background: rgba(255,255,255,0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Redirecting...</h1>
          <p>Taking you to ${qr.title}</p>
          <div class="spinner"></div>
          <a href="${qr.destinationUrl}" class="manual-link">Click here if not redirected</a>
        </div>
        
        <script>
          // Use localStorage to remember QR redirects permanently
          const qrStorageKey = 'qr_redirect_${code}';
          const storedData = localStorage.getItem(qrStorageKey);
          const currentTime = Date.now();
          
          // Check if URL was updated since last visit
          if (storedData) {
            const parsed = JSON.parse(storedData);
            
            // If destination URL changed, use new URL immediately
            if (parsed.url !== '${qr.destinationUrl}') {
              console.log('QR destination updated! Redirecting to new URL...');
              // Update storage with new URL
              localStorage.setItem(qrStorageKey, JSON.stringify({
                code: '${code}',
                lastVisit: currentTime,
                url: '${qr.destinationUrl}',
                visitCount: (parsed.visitCount || 1) + 1
              }));
              window.location.href = '${qr.destinationUrl}';
            } else {
              // Same URL - instant redirect without page load
              console.log('Same QR, same URL - instant redirect');
              window.location.href = '${qr.destinationUrl}';
            }
          } else {
            // First time visit - store and redirect
            console.log('First visit - storing redirect info');
            localStorage.setItem(qrStorageKey, JSON.stringify({
              code: '${code}',
              firstVisit: currentTime,
              lastVisit: currentTime,
              url: '${qr.destinationUrl}',
              visitCount: 1
            }));
            window.location.href = '${qr.destinationUrl}';
          }
          
          // Fallback redirect after 1.5 seconds
          setTimeout(function() {
            window.location.href = '${qr.destinationUrl}';
          }, 1500);
        </script>
      </body>
      </html>
    `);

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
