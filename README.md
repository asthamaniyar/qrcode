# Dynamic QR Code Generator Platform

A complete SaaS platform for generating and managing dynamic QR codes. Similar to Hovercode.

## Features

✅ **Unlimited Dynamic QR Codes** - Create as many QR codes as you need
✅ **Editable Destinations** - Change destination URLs without regenerating QR codes
✅ **QR Management** - Full CRUD operations for all your QR codes
✅ **Analytics** - Track scans and monitor performance
✅ **Customization** - Multiple QR styles, colors, and branding options
✅ **Download Options** - Export QR codes in PNG or SVG format
✅ **Modern Dashboard** - Clean, professional UI built with React and TailwindCSS

## Core Architecture

The QR code **NEVER** contains the destination URL directly. Instead:

1. User enters destination URL (e.g., `https://example.com`)
2. System generates unique code (e.g., `7HGsa9K`)
3. QR code stores: `https://qrer.er/r/7HGsa9K`
4. When scanned, system redirects to the stored destination URL

This allows editing the destination URL anytime without changing the QR code!

## Tech Stack

### Frontend
- React.js 18
- Vite
- TailwindCSS
- ShadCN UI Components
- React Router
- Axios
- Recharts (Analytics)
- QRCode (Generation)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- nanoid (Unique IDs)
- QRCode (Generation)
- Validator (URL validation)

## Project Structure

```
qr/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   └── qrController.js    # QR logic & redirect handler
│   ├── models/
│   │   └── QRCode.js          # MongoDB schema
│   ├── routes/
│   │   └── qrRoutes.js        # API routes
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # Navigation
│   │   │   ├── QRCard.jsx          # QR display card
│   │   │   ├── StatsCard.jsx       # Stats component
│   │   │   └── ui.jsx              # UI components
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main dashboard
│   │   │   ├── CreateQR.jsx        # QR generator
│   │   │   ├── QRCodes.jsx         # QR management
│   │   │   ├── Analytics.jsx       # Analytics page
│   │   │   └── Settings.jsx        # Settings page
│   │   ├── services/
│   │   │   └── api.js              # API client
│   │   ├── lib/
│   │   │   └── utils.js            # Utility functions
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # TailwindCSS
│   ├── .env                        # Environment variables
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── index.html
│
└── database/
    └── schema.sql                  # Database schema (reference)
```

## Installation & Setup

### Prerequisites

- Node.js 16+ installed
- MongoDB running locally or MongoDB Atlas account
- Git (optional)

### Step 1: Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/qr_generator
PORT=5000
NODE_ENV=development
DOMAIN=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_DOMAIN=http://localhost:5000
```

### Step 3: Start MongoDB

Make sure MongoDB is running:

**Windows:**
```bash
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

Or use MongoDB Atlas cloud database.

### Step 4: Run the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Backend will run on: http://localhost:5000

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:5173

### Step 5: Access the Application

Open your browser and go to: **http://localhost:5173**

## Usage Guide

### Creating a QR Code

1. Click **"Create QR"** in the sidebar
2. Enter a title for your QR code
3. Enter the destination URL
4. Choose a QR style (Square, Rounded, Dots, Circle, Frame)
5. Customize colors (foreground/background)
6. Click **"Generate QR Code"**
7. Your QR code is created with a unique redirect URL

### Editing Destination URL

1. Go to **"QR Codes"** page
2. Click **"Edit"** on any QR code
3. Update the destination URL
4. Click **"Update QR Code"**
5. The QR code remains the same, only the destination changes!

### Downloading QR Codes

- Click **PNG** or **SVG** button on any QR card
- QR code downloads to your device
- Ready for print or digital use

### Viewing Analytics

1. Go to **"Analytics"** page
2. View total scans, active QRs, and performance metrics
3. See top performing QR codes
4. Track recent activity

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/qr/create` | Create new QR code |
| GET | `/api/qr` | Get all QR codes |
| GET | `/api/qr/:code` | Get single QR details |
| PUT | `/api/qr/:code` | Update QR code |
| DELETE | `/api/qr/:code` | Delete QR code |
| GET | `/r/:code` | Redirect endpoint |

## Database Schema

### QRCode Collection

```javascript
{
  _id: ObjectId,
  code: String (unique),           // Unique 7-char code
  title: String,                    // QR title
  destinationUrl: String,           // Target URL
  qrType: String,                   // square/rounded/dots/etc
  foregroundColor: String,          // Hex color
  backgroundColor: String,          // Hex color
  scanCount: Number,                // Total scans
  status: Boolean,                  // Active/inactive
  createdAt: Date,
  updatedAt: Date
}
```

## Production Deployment

### For https://qrer.er domain:

1. Update backend `.env`:
```env
MONGODB_URI=your_production_mongodb_uri
PORT=5000
NODE_ENV=production
DOMAIN=https://qrer.er
```

2. Update frontend `.env`:
```env
VITE_API_URL=https://qrer.er/api
VITE_DOMAIN=https://qrer.er
```

3. Build frontend:
```bash
cd frontend
npm run build
```

4. Deploy to your hosting provider
5. Ensure MongoDB is accessible from production server

## Key Features Explained

### 🔒 Security
- URL validation prevents malicious redirects
- Input sanitization
- CORS protection
- No localhost/127.0.0.1 in production QRs

### 📊 Analytics
- Scan count tracking
- Recent activity monitoring
- Top performers identification
- Date-based filtering

### 🎨 Customization
- 6 QR styles (Square, Rounded, Dots, Circle, Frame, Scan Me)
- Custom foreground/background colors
- Frame text option
- Logo support (future enhancement)

### ⚡ Performance
- MongoDB indexing for fast lookups
- Efficient redirect system
- Optimized QR generation
- Responsive UI

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify database permissions

### Port Already in Use
- Change PORT in backend/.env
- Update FRONTEND_URL accordingly
- Restart both servers

### QR Not Redirecting
- Check DOMAIN environment variable
- Verify redirect endpoint `/r/:code` exists
- Test with sample QR code

## Support

For issues or questions:
- Check the code comments
- Review environment variables
- Test API endpoints with Postman
- Check browser console for errors

## License

MIT License - Free to use and modify

---

**Built with ❤️ using React, Node.js, Express, and MongoDB**
