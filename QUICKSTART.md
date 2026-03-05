# 🚀 Quick Start Guide - Dynamic QR Generator

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js 16+ installed ([Download](https://nodejs.org/))
- [ ] MongoDB installed and running OR MongoDB Atlas account
- [ ] Code editor (VS Code recommended)

## Step-by-Step Setup

### Option 1: Automated Start (Windows)

Simply double-click `start.bat` file! This will:
1. Start the backend server on port 5000
2. Start the frontend server on port 5173
3. Open both in separate terminal windows

Then go to: http://localhost:5173

---

### Option 2: Manual Start

#### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

#### Step 2: Configure Environment

**Backend (.env)** - Already configured!
```env
MONGODB_URI=mongodb://localhost:27017/qr_generator
PORT=5000
NODE_ENV=development
DOMAIN=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)** - Already configured!
```env
VITE_API_URL=http://localhost:5000/api
VITE_DOMAIN=http://localhost:5000
```

#### Step 3: Start MongoDB

**Windows:**
```bash
mongod
```

If MongoDB is not installed, download from: https://www.mongodb.com/try/download/community

OR use MongoDB Atlas (cloud):
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update MONGODB_URI in backend/.env

#### Step 4: Start Backend

Open terminal:
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
╔═══════════════════════════════════════════════╗
║   🚀 QR Generator Server is running!          ║
║                                               ║
║   Backend: http://localhost:5000              ║
║   API:     http://localhost:5000/api/qr       ║
╚═══════════════════════════════════════════════╝
```

#### Step 5: Start Frontend

Open another terminal:
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### Step 6: Open Application

Open browser: **http://localhost:5173**

---

## First Time Usage

### Creating Your First QR Code

1. **Navigate to "Create QR"** using the sidebar
2. **Enter details:**
   - Title: "My First QR"
   - Destination URL: https://example.com
   - Choose a style (e.g., Square)
   - Pick colors
3. **Click "Generate QR Code"**
4. **Your QR is created!** You'll see:
   - QR preview image
   - Short URL (e.g., http://localhost:5000/r/abc123)
   - Download buttons

### Testing Your QR Code

**Option 1: Click the short URL**
- Click the copy button next to the short URL
- Paste in browser
- You'll be redirected to your destination URL

**Option 2: Use phone camera**
- Download the QR as PNG
- Send to phone
- Scan with camera
- It will redirect!

### Editing Destination (The Magic of Dynamic QRs!)

1. Go to **"QR Codes"** page
2. Find your QR code
3. Click **"Edit"**
4. Change the destination URL to something else
5. Click **"Update QR Code"**
6. ✅ The SAME QR code now points to NEW URL!

This is the power of dynamic QR codes!

---

## Features Overview

### Dashboard (`/`)
- View total QR codes created
- See total scans across all QRs
- Quick access to recent QR codes

### Create QR (`/create`)
- Generate new dynamic QR codes
- Customize appearance
- Choose from 6 styles
- Set custom colors
- Preview in real-time

### QR Codes (`/qrcodes`)
- View all your QR codes
- Search by title or URL
- Edit destinations
- Download PNG/SVG
- Delete unwanted QRs
- Pagination for large lists

### Analytics (`/analytics`)
- Total scans overview
- Top performing QRs
- Recent activity
- Scan statistics

### Settings (`/settings`)
- App information
- API documentation
- Configuration details

---

## Troubleshooting

### ❌ "MongoDB connection error"

**Solution:**
1. Ensure MongoDB is running: `mongod`
2. Check MONGODB_URI in backend/.env
3. Default: `mongodb://localhost:27017/qr_generator`

### ❌ "Port 5000 already in use"

**Solution:**
1. Close any other apps using port 5000
2. Or change PORT in backend/.env to 5001
3. Update FRONTEND_URL accordingly

### ❌ "Cannot connect to backend"

**Solution:**
1. Ensure backend is running on port 5000
2. Check VITE_API_URL in frontend/.env
3. Should be: `http://localhost:5000/api`

### ❌ Frontend shows but no QR codes load

**Solution:**
1. Check if backend is running
2. Open browser console (F12)
3. Look for API errors
4. Ensure MongoDB has data

---

## Production Deployment (https://qrer.er)

### Backend Setup

1. Get production MongoDB (MongoDB Atlas recommended)
2. Update backend/.env:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/qr_generator
NODE_ENV=production
DOMAIN=https://qrer.er
```

3. Deploy backend to hosting (Heroku, DigitalOcean, AWS, etc.)

### Frontend Setup

1. Update frontend/.env:
```env
VITE_API_URL=https://qrer.er/api
VITE_DOMAIN=https://qrer.er
```

2. Build:
```bash
cd frontend
npm run build
```

3. Deploy `dist/` folder to hosting (Vercel, Netlify, or same server)

### Important Production Notes

⚠️ **Domain Configuration:**
- QR codes will contain: `https://qrer.er/r/{code}`
- Make sure domain is accessible
- HTTPS is recommended

⚠️ **Security:**
- Enable CORS only for your domain
- Use environment variables for secrets
- Validate all URLs
- Rate limit API endpoints

---

## Database Structure

### Collection: qrcodes

```javascript
{
  _id: ObjectId("..."),
  code: "abc123",                    // 7-char unique ID
  title: "Marketing Campaign",        // Your label
  destinationUrl: "https://...",      // Target URL
  qrType: "square",                   // Style
  foregroundColor: "#000000",         // QR color
  backgroundColor: "#FFFFFF",         // Background
  scanCount: 42,                      // Total scans
  status: true,                       // Active/inactive
  createdAt: ISODate("2024-..."),     // Creation date
  updatedAt: ISODate("2024-...")      // Last update
}
```

---

## API Reference

Test with Postman or curl:

### Create QR
```bash
curl -X POST http://localhost:5000/api/qr/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test QR",
    "destinationUrl": "https://example.com",
    "qrType": "square"
  }'
```

### Get All QRs
```bash
curl http://localhost:5000/api/qr
```

### Update QR
```bash
curl -X PUT http://localhost:5000/api/qr/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "destinationUrl": "https://newurl.com"
  }'
```

### Delete QR
```bash
curl -X DELETE http://localhost:5000/api/qr/abc123
```

### Redirect (Scan Simulation)
```bash
curl http://localhost:5000/r/abc123
# Returns 302 redirect to destination URL
```

---

## Project Statistics

After installation:
- **Backend packages:** ~150
- **Frontend packages:** ~225
- **Total files created:** 25+
- **Lines of code:** 2000+

---

## Next Steps

1. ✅ Test creating multiple QR codes
2. ✅ Try different styles and colors
3. ✅ Edit destination URLs
4. ✅ Download QR codes
5. ✅ Check analytics
6. ✅ Deploy to production

---

## Support & Resources

- **Documentation:** See README.md
- **Architecture:** See plan file
- **MongoDB:** https://docs.mongodb.com/
- **React:** https://react.dev/
- **Express:** https://expressjs.com/

---

**Happy QR Coding! 🎉**
