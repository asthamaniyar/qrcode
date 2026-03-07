# 🚀 HOSTINGER DEPLOYMENT GUIDE - QR Code Generator

## ⚠️ CRITICAL: Fix Network Error on Hostinger

Your live site: **http://qrer.errorinfotech.in/**

---

## 📋 STEP-BY-STEP HOSTINGER DEPLOYMENT

### **PHASE 1: PREPARE FILES LOCALLY**

#### **Step 1: Build Frontend**

```bash
cd frontend
npm install
npm run build
```

This creates `frontend/dist/` folder with production files.

#### **Step 2: Prepare Backend for Production**

```bash
cd backend
npm install --production
```

---

### **PHASE 2: CREATE .env.production FILE**

Create a new file `backend/.env.production`:

```env
MONGODB_URI=mongodb+srv://astha:23IT376.@cluster0.9w9ydzp.mongodb.net/qr_generator?retryWrites=true&w=majority
PORT=5003
NODE_ENV=production
DOMAIN=http://qrer.errorinfotech.in
FRONTEND_URL=http://qrer.errorinfotech.in
```

---

### **PHASE 3: UPDATE BACKEND SERVER.JS FOR HOSTINGER**

Update `backend/server.js` to use port from environment or default:

```javascript
const PORT = process.env.PORT || 5003;
```

Also add HTTPS redirect if you enable SSL later:

```javascript
// Add this after CORS configuration
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

### **PHASE 4: UPLOAD TO HOSTINGER VIA FTP**

#### **4.1 Get FTP Credentials from Hostinger:**

1. Login to Hostinger hPanel
2. Go to **Hosting** → Select your domain
3. Find **FTP Accounts** section
4. Note down:
   - FTP Username
   - FTP Password (or create new)
   - FTP Hostname (usually ftp.qrer.errorinfotech.in)

#### **4.2 Connect via FileZilla or FTP Client:**

1. Download FileZilla: https://filezilla-project.org/
2. Enter FTP credentials:
   - Host: `ftp.qrer.errorinfotech.in`
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

3. Connect to server

#### **4.3 Upload Files:**

**In FileZilla:**
- Local site (left): Your computer files
- Remote site (right): Hostinger server (`public_html`)

**Upload Structure:**

```
public_html/
├── backend/
│   ├── node_modules/          ← Upload this
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js              ← Upload this
│   ├── package.json           ← Upload this
│   └── .env.production        ← Upload this
├── frontend/
│   └── dist/                  ← Rename to just 'dist' or upload contents
│       ├── index.html
│       ├── assets/
│       └── ...
└── .htaccess                  ← Create this
```

**Steps:**

1. **Upload Backend:**
   - Create folder: `public_html/backend`
   - Upload ALL backend files EXCEPT `.env` (use `.env.production` instead)
   - Upload `node_modules` folder (yes, all of it)

2. **Upload Frontend:**
   - Option A: Upload `frontend/dist` contents to `public_html/`
   - Option B: Upload `frontend/dist` folder to `public_html/frontend`

3. **Create .htaccess file** in `public_html/`:

```apache
# Enable Rewrite Engine
RewriteEngine On

# Redirect API calls to Node.js app
RewriteRule ^api/(.*)$ http://localhost:5003/api/$1 [P,L]

# Redirect QR redirects to Node.js app
RewriteRule ^r/(.*)$ http://localhost:5003/r/$1 [P,L]

# Serve frontend for all other requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]

# Enable CORS for API
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

---

### **PHASE 5: SETUP NODE.JS APPLICATION IN HOSTINGER**

#### **5.1 Access hPanel:**

1. Login to Hostinger
2. Go to **Hosting** → Select domain
3. Look for **Node.js** section (may be under "Advanced")

#### **5.2 Configure Node.js:**

1. Click **Node.js Selector** or similar
2. Create new application:
   - **Application Root**: `/home/uXXXXX/public_html/backend`
   - **Application URL**: `qrer.errorinfotech.in`
   - **Application Startup File**: `server.js`
   - **Node.js Version**: 16.x or higher
   - **Working Directory**: `/home/uXXXXX/public_html/backend`

3. Set environment variables in hPanel:
   ```
   MONGODB_URI = mongodb+srv://astha:23IT376.@cluster0.9w9ydzp.mongodb.net/qr_generator?retryWrites=true&w=majority
   PORT = 5003
   NODE_ENV = production
   DOMAIN = http://qrer.errorinfotech.in
   FRONTEND_URL = http://qrer.errorinfotech.in
   ```

4. Click **Create** or **Save**

#### **5.3 Install Dependencies via SSH/Terminal:**

If Hostinger provides SSH access:

1. Open **Terminal** or **SSH Access** in hPanel
2. Navigate to backend folder:
   ```bash
   cd public_html/backend
   ```
3. Install dependencies:
   ```bash
   npm install --production
   ```
4. Start application:
   ```bash
   node server.js
   ```

Or use PM2 if available:
```bash
pm2 start server.js --name qr-backend
pm2 save
```

---

### **PHASE 6: TEST YOUR LIVE SITE**

#### **6.1 Test Backend API:**

Open browser and visit:
```
http://qrer.errorinfotech.in/api/qr/analytics/overview
```

Should return JSON like:
```json
{
  "success": true,
  "data": { ... }
}
```

#### **6.2 Test Frontend:**

Visit:
```
http://qrer.errorinfotech.in/
```

Should load without network errors.

#### **6.3 Test QR Creation:**

1. Go to dashboard
2. Create a test QR code
3. Verify it works

---

## 🔧 TROUBLESHOOTING NETWORK ERROR

### **If you still see "Network Error":**

#### **Check 1: Is Backend Running?**

In Hostinger hPanel:
1. Go to Node.js section
2. Check if application status is "Running"
3. If not, click "Start"

#### **Check 2: Test API Directly**

Visit these URLs:
- `http://qrer.errorinfotech.in/api/qr` - Should return list
- `http://qrer.errorinfotech.in/api/qr/analytics/overview` - Should return JSON

If these show errors, backend is not running properly.

#### **Check 3: Browser Console**

1. Press **F12** on your live site
2. Go to **Console** tab
3. Look for red errors
4. Check **Network** tab for failed API calls

#### **Check 4: Verify URLs in Code**

All frontend API calls should go to:
```
http://qrer.errorinfotech.in/api
```

NOT localhost or any other domain.

#### **Check 5: Check .htaccess**

Make sure `.htaccess` file is uploaded correctly to `public_html/`.

#### **Check 6: View Server Logs**

In Hostinger hPanel:
1. Go to **Logs** section
2. Check **Error Log**
3. Look for Node.js errors

---

## 📝 IMPORTANT NOTES FOR HOSTINGER

### **Port Configuration:**

- Hostinger may assign a different port
- Check your Node.js application settings in hPanel
- Update PORT in `.env.production` to match

### **Process Management:**

Hostinger may restart Node.js apps automatically. To keep it running:

1. Use **PM2** if available:
   ```bash
   pm2 start server.js
   pm2 save
   ```

2. Or use Hostinger's built-in Node.js manager

### **Database Connection:**

MongoDB Atlas connection string must allow connections from Hostinger IPs:
1. Go to MongoDB Atlas
2. Network Access
3. Add IP: `0.0.0.0/0` (allow from anywhere) OR add Hostinger's IP range

### **File Permissions:**

Ensure proper permissions:
- Folders: 755
- Files: 644
- `node_modules`: 755

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Frontend built (`npm run build`)
- [ ] Backend prepared (`npm install --production`)
- [ ] `.env.production` created with correct values
- [ ] Files uploaded to Hostinger via FTP
- [ ] `.htaccess` created and uploaded
- [ ] Node.js app configured in hPanel
- [ ] Environment variables set in hPanel
- [ ] Application started in hPanel
- [ ] API endpoint responds: `/api/qr/analytics/overview`
- [ ] Frontend loads without errors
- [ ] Can create QR codes
- [ ] QR redirects work

---

## 🆘 STILL GETTING NETWORK ERROR?

### **Quick Diagnostic Steps:**

1. **Open browser DevTools (F12)**
2. **Go to Network tab**
3. **Refresh page**
4. **Look for failed requests (red)**
5. **Click on failed request**
6. **Check:**
   - Request URL (should be `http://qrer.errorinfotech.in/api/...`)
   - Status code (404, 500, etc.)
   - Response body

**Tell me:**
- What's the exact error message in console?
- What status code do you see?
- What's the request URL?

This will help pinpoint the exact issue!

---

## 💡 ALTERNATIVE: USE SUBDOMAIN FOR BACKEND

If Hostinger doesn't support Node.js well, consider:

**Option A:** Run backend on a subdomain like `api.qrer.errorinfotech.in`

**Option B:** Use a different service for backend (Railway, Render) while keeping frontend on Hostinger

Let me know if you need help with either approach!

---

**Good luck with Hostinger deployment! 🚀**
