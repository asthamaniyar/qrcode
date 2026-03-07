# 🚀 DEPLOYMENT INSTRUCTIONS FOR LIVE SITE

## ⚠️ IMPORTANT: Network Error Fix for Production

Your live site is at: **http://qrer.errorinfotech.in/**

---

## 🔧 STEP-BY-STEP DEPLOYMENT GUIDE

### **Step 1: Deploy Backend to Vercel**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Import your backend repository**
3. **Set Environment Variables in Vercel:**

   Click on Project Settings → Environment Variables → Add:

   ```
   MONGODB_URI = mongodb+srv://astha:23IT376.@cluster0.9w9ydzp.mongodb.net/qr_generator?retryWrites=true&w=majority
   PORT = 5003
   NODE_ENV = production
   DOMAIN = http://qrer.errorinfotech.in
   FRONTEND_URL = http://qrer.errorinfotech.in
   ```

4. **Deploy the backend**

---

### **Step 2: Deploy Frontend to Vercel**

1. **Go to Vercel Dashboard**
2. **Import your frontend repository** (or use same repo with different root)
3. **Build Settings:**
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set Environment Variables:**

   ```
   VITE_API_URL = http://qrer.errorinfotech.in/api
   VITE_DOMAIN = http://qrer.errorinfotech.in
   ```

5. **Deploy the frontend**

---

### **Step 3: Configure Custom Domain in Vercel**

1. **Go to Vercel Project Settings**
2. **Click "Domains"**
3. **Add your domain**: `qrer.errorinfotech.in`
4. **Update DNS Records** at your domain registrar:

   **For Root Domain (@):**
   ```
   Type: A Record
   Name: @
   Value: 76.76.21.21
   TTL: Auto
   ```

   **For WWW Subdomain:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: Auto
   ```

5. **Wait for DNS propagation** (can take up to 48 hours, usually faster)

---

### **Step 4: Verify Deployment**

After deployment is complete:

1. **Test Backend API:**
   ```
   Visit: http://qrer.errorinfotech.in/api/qr/analytics/overview
   Should return JSON response
   ```

2. **Test Frontend:**
   ```
   Visit: http://qrer.errorinfotech.in/
   Should load without network errors
   ```

3. **Test QR Code Creation:**
   - Create a new QR code from the dashboard
   - Verify it appears in the list
   - Test the redirect functionality

---

## 🔍 TROUBLESHOOTING NETWORK ERRORS

### **If you still see "Network Error":**

1. **Check Browser Console (F12):**
   - Look for specific error messages
   - Check if API calls are failing
   - Note the exact URL being called

2. **Verify Backend is Running:**
   - Check Vercel deployment logs
   - Ensure no deployment errors
   - Test API endpoint directly

3. **Check CORS Configuration:**
   - Backend must allow requests from your domain
   - Verify CORS settings in `server.js`

4. **Verify Environment Variables:**
   - Make sure all variables are set in Vercel dashboard
   - Check for typos in URLs
   - Ensure HTTP vs HTTPS consistency

---

## 📋 ENVIRONMENT VARIABLES SUMMARY

### **Backend (Vercel):**
```env
MONGODB_URI=mongodb+srv://astha:23IT376.@cluster0.9w9ydzp.mongodb.net/qr_generator?retryWrites=true&w=majority
PORT=5003
NODE_ENV=production
DOMAIN=http://qrer.errorinfotech.in
FRONTEND_URL=http://qrer.errorinfotech.in
```

### **Frontend (Vercel):**
```env
VITE_API_URL=http://qrer.errorinfotech.in/api
VITE_DOMAIN=http://qrer.errorinfotech.in
```

---

## 🎯 QUICK CHECKLIST

- [ ] Backend deployed to Vercel
- [ ] Backend environment variables set
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set
- [ ] Custom domain added in Vercel
- [ ] DNS records updated
- [ ] SSL certificate provisioned (automatic with Vercel)
- [ ] API endpoint responds correctly
- [ ] Frontend loads without errors
- [ ] QR codes can be created and managed

---

## 💡 IMPORTANT NOTES

1. **`.env` files are for LOCAL DEVELOPMENT ONLY**
   - They don't get deployed to Vercel
   - You MUST set environment variables in Vercel dashboard

2. **HTTP vs HTTPS:**
   - Your site uses HTTP (not HTTPS)
   - All URLs must use `http://` not `https://`
   - Vercel will automatically provision SSL if you want HTTPS later

3. **CORS Configuration:**
   - Backend must explicitly allow your domain
   - Updated in `backend/server.js`

4. **MongoDB Atlas:**
   - Ensure IP access list allows Vercel servers (use 0.0.0.0/0 for testing)
   - Or add Vercel's IP ranges

---

## 🆘 STILL HAVING ISSUES?

If network errors persist after following these steps:

1. **Open browser DevTools (F12)**
2. **Go to Console tab**
3. **Copy the exact error message**
4. **Check Network tab for failed requests**
5. **Note the request URL and response status**

This information will help diagnose the specific issue!

---

## 📞 SUPPORT RESOURCES

- Vercel Docs: https://vercel.com/docs
- Vercel Node.js Functions: https://vercel.com/docs/functions/serverless-functions/runtimes/node-js
- MongoDB Atlas Setup: https://www.mongodb.com/docs/atlas/getting-started/
