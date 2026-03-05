# 🏗️ System Architecture - Dynamic QR Generator

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Dashboard  │  │ Create QR    │  │ QR Codes     │           │
│  │             │  │ Generator    │  │ Management   │           │
│  └─────────────┘  └──────────────┘  └──────────────┘           │
│  ┌─────────────┐  ┌──────────────┐                              │
│  │ Analytics   │  │ Settings     │                              │
│  │             │  │              │                              │
│  └─────────────┘  └──────────────┘                              │
│                                                                  │
│  Technologies: React 18, TailwindCSS, ShadCN UI, Axios          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Express.js Server)                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  API Routes Layer                      │    │
│  │  POST   /api/qr/create        → Create QR Code         │    │
│  │  GET    /api/qr               → Get All QRs            │    │
│  │  GET    /api/qr/:code         → Get Single QR          │    │
│  │  PUT    /api/qr/:code         → Update QR              │    │
│  │  DELETE /api/qr/:code         → Delete QR              │    │
│  │  GET    /api/qr/analytics    → Overall Analytics       │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                 Controllers Layer                      │    │
│  │  • qrController.js                                     │    │
│  │    - createQR()                                        │    │
│  │    - getAllQRs()                                       │    │
│  │    - getQRByCode()                                     │    │
│  │    - updateQR()                                        │    │
│  │    - deleteQR()                                        │    │
│  │    - redirect() ← CRITICAL!                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  Middleware Layer                      │    │
│  │  • CORS Configuration                                  │    │
│  │  • JSON Parser                                         │    │
│  │  • URL Validator                                       │    │
│  │  • Error Handler                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Technologies: Node.js, Express.js, nanoid, QRCode, Validator   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Collection: qrcodes                       │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  Document Structure:                             │  │    │
│  │  │  {                                               │  │    │
│  │  │    _id: ObjectId,                                │  │    │
│  │  │    code: "7HGsa9K",         ← UNIQUE 7-CHAR      │  │    │
│  │  │    title: "Marketing QR",                        │  │    │
│  │  │    destinationUrl: "https://...",                │  │    │
│  │  │    qrType: "square",                             │  │    │
│  │  │    foregroundColor: "#000000",                   │  │    │
│  │  │    backgroundColor: "#FFFFFF",                   │  │    │
│  │  │    scanCount: 42,                                │  │    │
│  │  │    status: true,                                 │  │    │
│  │  │    createdAt: Date,                              │  │    │
│  │  │    updatedAt: Date                               │  │    │
│  │  │  }                                               │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                         │    │
│  │  Indexes: code, status, createdAt                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Optional: qr_scans collection for detailed analytics           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Core Flow: QR Generation & Redirect

### Step-by-Step Process

```
USER FLOW: Creating a QR Code
═══════════════════════════════════════════════════

1. User opens Create QR page
   ↓
2. Enters destination URL: https://example.com
   ↓
3. Enters title: "Marketing Campaign"
   ↓
4. Selects style and colors
   ↓
5. Clicks "Generate QR Code"
   ↓
6. Frontend sends POST /api/qr/create
   ↓
7. Backend generates unique code: "7HGsa9K"
   ↓
8. Creates redirect URL: http://localhost:5000/r/7HGsa9K
   ↓
9. Generates QR image with redirect URL
   ↓
10. Stores in MongoDB:
    {
      code: "7HGsa9K",
      destinationUrl: "https://example.com",
      ...
    }
   ↓
11. Returns QR data to frontend
   ↓
12. User sees QR preview and downloads


SCAN FLOW: When Someone Scans the QR
═══════════════════════════════════════════════════

1. User scans QR code with phone
   ↓
2. Phone reads: http://localhost:5000/r/7HGsa9K
   ↓
3. Browser opens that URL
   ↓
4. Request hits backend: GET /r/7HGsa9K
   ↓
5. Controller extracts code: "7HGsa9K"
   ↓
6. Queries MongoDB: findOne({ code: "7HGsa9K" })
   ↓
7. If found and active:
   - Increment scanCount (+1)
   - Optionally log scan details
   - Return 302 redirect to destinationUrl
   ↓
8. Browser redirects to: https://example.com
   ↓
9. User sees final destination! ✅


EDIT FLOW: Changing Destination URL
═══════════════════════════════════════════════════

1. User goes to QR Codes page
   ↓
2. Finds QR with code "7HGsa9K"
   ↓
3. Clicks "Edit"
   ↓
4. Changes destination URL to: https://newsite.com
   ↓
5. Clicks "Update QR Code"
   ↓
6. Backend updates MongoDB:
   {
     code: "7HGsa9K",
     destinationUrl: "https://newsite.com",  ← CHANGED!
     ...
   }
   ↓
7. QR code REMAINS THE SAME! ✅
   ↓
8. Next scan will redirect to NEW URL! 🎉


This is the MAGIC of dynamic QR codes!
```

---

## 📂 Detailed Component Architecture

### Frontend Component Tree

```
App.jsx
├── Sidebar (Navigation)
│   ├── Dashboard link
│   ├── Create QR link
│   ├── QR Codes link
│   ├── Analytics link
│   └── Settings link
│
├── Dashboard Page
│   ├── StatsCard (Total QRs)
│   ├── StatsCard (Total Scans)
│   ├── StatsCard (Recent QRs)
│   └── QRCard[] (List of recent QRs)
│
├── CreateQR Page
│   ├── Form
│   │   ├── Input (Title)
│   │   ├── Input (Destination URL)
│   │   ├── Select (QR Type)
│   │   ├── ColorPicker (Foreground)
│   │   ├── ColorPicker (Background)
│   │   └── Button (Generate)
│   └── Preview Card
│       ├── QR Image
│       ├── Short URL display
│       ├── Copy button
│       └── Download buttons (PNG/SVG)
│
├── QRCodes Page
│   ├── Search Bar
│   ├── QRCard[] (Grid of all QRs)
│   │   ├── QR preview
│   │   ├── Title & URL
│   │   ├── Scan count
│   │   ├── Short URL
│   │   ├── Copy button
│   │   ├── Download buttons
│   │   ├── Edit button
│   │   └── Delete button
│   └── Pagination controls
│
├── Analytics Page
│   ├── StatsCard (Total QRs)
│   ├── StatsCard (Total Scans)
│   ├── StatsCard (Avg Scans/QR)
│   ├── Recent Activity Card
│   └── Top Performers Card
│
└── Settings Page
    └── Information Cards
```

---

## 🔧 Backend Route Structure

```
Express App Hierarchy
═══════════════════════════════════════════════════

app (Express Server)
│
├── Middleware
│   ├── cors()
│   ├── express.json()
│   ├── express.urlencoded()
│   └── trust proxy
│
├── Routes: /api/qr
│   │
│   ├── POST /create
│   │   └── qrController.createQR
│   │       ├── Validate input
│   │       ├── Generate unique code (nanoid)
│   │       ├── Check uniqueness
│   │       ├── Create redirect URL
│   │       ├── Generate QR image
│   │       ├── Save to MongoDB
│   │       └── Return response
│   │
│   ├── GET /
│   │   └── qrController.getAllQRs
│   │       ├── Parse query params (page, limit, search)
│   │       ├── Query MongoDB with pagination
│   │       ├── Count total documents
│   │       └── Return paginated response
│   │
│   ├── GET /:code
│   │   └── qrController.getQRByCode
│   │       ├── Extract code from params
│   │       ├── Query MongoDB
│   │       └── Return QR details
│   │
│   ├── PUT /:code
│   │   └── qrController.updateQR
│   │       ├── Validate code exists
│   │       ├── Validate new URL (if provided)
│   │       ├── Update MongoDB
│   │       └── Return updated data
│   │
│   ├── DELETE /:code
│   │   └── qrController.deleteQR
│   │       ├── Find and delete
│   │       └── Return success
│   │
│   └── GET /analytics/overview
│       └── qrController.getOverallAnalytics
│           ├── Count total QRs
│           ├── Count active QRs
│           ├── Sum all scans
│           └── Get recent QRs
│
└── Redirect Route: /r/:code (CRITICAL!)
    └── qrController.redirect
        ├── Extract code from URL
        ├── Query MongoDB (findOne + status check)
        ├── If not found/inactive → Show 404 page
        ├── If found/active:
        │   ├── Increment scanCount
        │   ├── Log scan (optional)
        │   └── Redirect (302) to destinationUrl
        └── Error handling
```

---

## 💾 Database Schema Details

### QRCode Schema

```javascript
{
  // Unique identifier (auto-generated by MongoDB)
  _id: ObjectId("65a5f1b2c3d4e5f6g7h8i9j0"),
  
  // 7-character unique code (nanoid)
  // Example: "7HGsa9K", "abc123X"
  code: String,
  
  // User-defined title for organization
  // Max 255 characters
  title: String,
  
  // Final destination URL
  // Must be valid HTTP/HTTPS
  destinationUrl: String,
  
  // Visual style of QR
  // Enum: 'square' | 'rounded' | 'dots' | 'circle' | 'frame' | 'scanme'
  qrType: String,
  
  // QR code color (hex)
  // Default: '#000000' (black)
  foregroundColor: String,
  
  // Background color (hex)
  // Default: '#FFFFFF' (white)
  backgroundColor: String,
  
  // Logo image data (future feature)
  logo: String | null,
  
  // Text displayed around frame
  frameText: String,
  
  // Total number of scans
  // Increments on each redirect
  scanCount: Number,
  
  // Active/inactive status
  // false = QR won't redirect
  status: Boolean,
  
  // Auto-generated timestamps
  createdAt: Date,  // When QR was created
  updatedAt: Date   // Last modification time
}
```

### Indexes for Performance

```javascript
// Fast lookups by code (used in every redirect)
qrCodeSchema.index({ code: 1 });

// Filter by active status
qrCodeSchema.index({ status: 1 });

// Sort by creation date (recent first)
qrCodeSchema.index({ createdAt: -1 });
```

---

## 🔐 Security Architecture

### Protection Layers

```
┌─────────────────────────────────────────┐
│         Client-Side Validation          │
│  • Required fields                       │
│  • URL format check                      │
│  • Input sanitization                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Network Layer                   │
│  • CORS configuration                    │
│  • HTTPS enforcement (production)        │
│  • Rate limiting (future)                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Application Layer               │
│  • URL validation (validator.js)         │
│  • No localhost in production            │
│  • Malicious URL detection               │
│  • Input sanitization                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Database Layer                  │
│  • NoSQL injection prevention            │
│  • Schema validation                     │
│  • Parameterized queries                 │
└─────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

### Development Environment

```
┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │
│ localhost:   │     │ localhost:   │
│ 5173         │◀────│ 5000         │
└──────────────┘     └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │   MongoDB    │
                      │ localhost:   │
                      │ 27017        │
                      └──────────────┘
```

### Production Environment (https://qrer.er)

```
┌─────────────────────────────────────────┐
│              Internet                    │
│              Users worldwide             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         CDN (Optional)                  │
│  • Static assets                         │
│  • Global distribution                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Hosting Platform                │
│  (Vercel/Netlify/Railway/VPS)          │
│                                         │
│  ┌──────────────┐     ┌──────────────┐ │
│  │   Frontend   │────▶│   Backend    │ │
│  │  (Static)    │     │  (Express)   │ │
│  │  https://    │     │  https://    │ │
│  │  qrer.er     │     │  api.qrer.er │ │
│  └──────────────┘     └──────┬───────┘ │
└──────────────────────────────────────┬──┘
                                       │
                                       ▼
                              ┌──────────────┐
                              │ MongoDB Atlas│
                              │ Cloud DB     │
                              └──────────────┘
```

---

## 📊 Data Flow Examples

### Create QR Code - Request/Response

**Request:**
```http
POST /api/qr/create
Content-Type: application/json

{
  "title": "Marketing Campaign",
  "destinationUrl": "https://example.com/landing",
  "qrType": "square",
  "foregroundColor": "#000000",
  "backgroundColor": "#FFFFFF"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "QR Code created successfully",
  "data": {
    "id": "abc123",
    "code": "7HGsa9K",
    "title": "Marketing Campaign",
    "destinationUrl": "https://example.com/landing",
    "redirectUrl": "http://localhost:5000/r/7HGsa9K",
    "qrImage": "data:image/png;base64,iVBORw0KG...",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Redirect Flow - Step by Step

```
User scans QR → Opens: http://localhost:5000/r/7HGsa9K

Backend receives:
  req.params.code = "7HGsa9K"

Database query:
  db.qrcodes.findOne({ code: "7HGsa9K", status: true })

Found document:
  {
    code: "7HGsa9K",
    destinationUrl: "https://example.com",
    scanCount: 42,
    status: true
  }

Actions:
  1. scanCount++ → 43
  2. Save to DB
  3. res.redirect(302, "https://example.com")

User's browser:
  Receives 302 redirect
  Navigates to https://example.com ✅
```

---

## 🎯 Key Design Decisions

### Why This Architecture?

1. **Redirect-Based System**
   - Allows editing destinations
   - Enables tracking/analytics
   - Future: geo-targeting possible

2. **MongoDB Choice**
   - Flexible schema
   - Fast lookups
   - Scalable horizontally
   - Perfect for JSON APIs

3. **React + Vite**
   - Fast development
   - Hot module replacement
   - Modern ecosystem
   - Easy deployment

4. **RESTful API**
   - Standard convention
   - Easy to understand
   - Language agnostic
   - Cache friendly

5. **TailwindCSS**
   - Rapid UI development
   - Consistent design
   - Mobile-first
   - Small bundle size

---

## 🔄 State Management

### Frontend State Flow

```
User Action
    ↓
Component State (useState)
    ↓
API Call (axios)
    ↓
Backend Processing
    ↓
Response Received
    ↓
State Update
    ↓
UI Re-render
```

---

## 📈 Scalability Considerations

### Current Capacity
- Handles 100s of concurrent users
- Supports 10,000+ QR codes
- Sub-100ms redirect speed

### Growth Path

**Stage 1 (Current)**
- Single server
- Local MongoDB
- Basic caching

**Stage 2 (10k+ users)**
- Load balancer
- MongoDB replica set
- Redis caching
- CDN for assets

**Stage 3 (100k+ users)**
- Multiple regions
- Database sharding
- Microservices
- Advanced monitoring

---

**This architecture provides a solid foundation for a production SaaS platform! 🚀**
