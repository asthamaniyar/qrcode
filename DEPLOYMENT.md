# 🚀 Production Deployment Guide for qrer.errorinfotech.in

This guide covers deploying the Dynamic QR Generator to production on the domain https://qrer.errorinfotech.in

## Architecture Overview

```
User scans QR → https://qrer.errorinfotech.in/r/abc123
                    ↓
            Backend (Express)
                    ↓
            MongoDB Lookup
                    ↓
            Redirect to destinationUrl
```

## Prerequisites

- Domain: qrer.errorinfotech.in configured with hosting
- MongoDB Atlas account or MongoDB server
- Node.js hosting platform
- SSL certificate (usually provided by hosting)

## Step 1: Database Setup (MongoDB Atlas)

### Create MongoDB Cluster

1. Go to https://cloud.mongodb.com/
2. Sign up/Login
3. Create new cluster (free tier M0 available)
4. Choose region closest to your users
5. Click "Create"

### Configure Database Access

1. Go to "Database Access" in left menu
2. Click "Add New Database User"
3. Create username and password
4. Set permissions to "Read and write to any database"
5. Click "Add User"

### Configure Network Access

1. Go to "Network Access" in left menu
2. Click "Add IP Address"
3. For development, select "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add your server's IP
5. Click "Confirm"

### Get Connection String

1. Go to "Clusters" and click "Connect"
2. Select "Connect your application"
3. Copy connection string, e.g.:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
4. Replace `<password>` with actual password
5. Add database name: `qr_generator`

Final string looks like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/qr_generator?retryWrites=true&w=majority
```

---

## Step 2: Backend Configuration

### Update backend/.env

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/qr_generator?retryWrites=true&w=majority
PORT=5003
NODE_ENV=production
DOMAIN=https://qrer.errorinfotech.in
FRONTEND_URL=https://qrer.errorinfotech.in
```

### Security Enhancements

Update `backend/server.js` to add CORS restrictions:

```javascript
const corsOptions = {
  origin: ['https://qrer.errorinfotech.in', 'http://localhost:5173'],
  credentials: true
};
app.use(cors(corsOptions));
```

### Install Production Dependencies

```bash
cd backend
npm install --production
```

---

## Step 3: Frontend Configuration

### Update frontend/.env

```env
VITE_API_URL=https://qrer.errorinfotech.in/api
VITE_DOMAIN=https://qrer.errorinfotech.in
```

### Build Frontend

```bash
cd frontend
npm run build
```

This creates optimized production files in `frontend/dist/`

---

## Step 4: Hosting Options

### Option A: Full-Stack Hosting (Recommended for simplicity)

**Platforms:** Railway, Render, Heroku, DigitalOcean App Platform

#### Deploy to Railway.app

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables from backend/.env
6. Deploy!

Railway automatically detects Express apps.

#### Deploy to Render.com

1. Go to https://render.com/
2. Create new "Web Service"
3. Connect repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variables
7. Deploy

### Option B: Separate Frontend & Backend

#### Frontend: Vercel/Netlify

**Vercel:**
1. Push code to GitHub
2. Go to https://vercel.com/
3. Import repository
4. Set root directory to `frontend`
5. Add environment variables
6. Deploy

**Build Command:** `npm run build`
**Output Directory:** `dist`

#### Backend: Railway/Render

Follow steps above for backend-only deployment.

### Option C: VPS/Dedicated Server

**DigitalOcean Droplet, AWS EC2, etc.**

1. SSH into server:
```bash
ssh user@your-server-ip
```

2. Install Node.js and MongoDB:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y mongodb
```

3. Clone repository:
```bash
git clone https://github.com/yourusername/qr-generator.git
cd qr-generator
```

4. Install dependencies:
```bash
cd backend
npm install --production
cd ../frontend
npm install
npm run build
```

5. Set up PM2 (process manager):
```bash
sudo npm install -g pm2
cd backend
pm2 start server.js --name qr-backend
pm2 save
pm2 startup
```

6. Configure Nginx as reverse proxy:
```nginx
server {
    listen 80;
    server_name qrer.errorinfotech.in;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /r {
        proxy_pass http://localhost:5000;
    }

    location / {
        root /var/www/qr-generator/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

7. Enable HTTPS with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d qrer.errorinfotech.in
```

---

## Step 5: Environment Variables for Production

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/qr_generator
PORT=5003
NODE_ENV=production
DOMAIN=https://qrer.errorinfotech.in
FRONTEND_URL=https://qrer.errorinfotech.in
```

### Frontend (.env)
```env
VITE_API_URL=https://qrer.errorinfotech.in/api
VITE_DOMAIN=https://qrer.errorinfotech.in
```

---

## Step 6: DNS Configuration

Point your domain to hosting:

**If using Vercel/Netlify:**
- Add records they provide (usually CNAME or A records)

**If using VPS:**
```
Type: A
Name: @
Value: your-server-ip
TTL: Auto

Type: CNAME
Name: www
Value: qrer.errorinfotech.in
```

Wait 24-48 hours for DNS propagation.

---

## Step 7: Testing Production

### Before Going Live

1. **Test QR Generation:**
   - Create test QR code
   - Verify it contains: `https://qrer.errorinfotech.in/r/{code}`
   - NOT localhost or IP

2. **Test Redirect:**
   - Scan QR or visit: `https://qrer.errorinfotech.in/r/{test-code}`
   - Should redirect to destination URL
   - Check scan count increases

3. **Test All Features:**
   - ✅ Create QR
   - ✅ Edit destination
   - ✅ Download PNG/SVG
   - ✅ View analytics
   - ✅ Delete QR

4. **Check Console Errors:**
   - Open browser DevTools
   - Look for API call failures
   - Fix CORS issues if any

5. **Performance Check:**
   - Page load speed
   - API response time
   - MongoDB query speed

---

## Step 8: Monitoring & Maintenance

### Set Up Monitoring

**Option 1: Uptime Robot (Free)**
- https://uptimerobot.com/
- Monitor your endpoints
- Get alerts when down

**Option 2: LogRocket**
- Frontend error tracking
- User session replay

**Option 3: Sentry**
- Error tracking for both frontend and backend

### Database Backups

**MongoDB Atlas:**
1. Go to Clusters → Backups
2. Enable automated backups
3. Set retention period
4. Test restore procedure

### Regular Maintenance

- [ ] Monitor database size
- [ ] Check error logs weekly
- [ ] Update dependencies monthly
- [ ] Review analytics performance
- [ ] Clean up inactive QR codes (optional)

---

## Step 9: Scaling Considerations

### When You Grow

**Database Optimization:**
- Add indexes on frequently queried fields
- Use MongoDB aggregation for analytics
- Implement caching with Redis

**Application Optimization:**
- Enable gzip compression
- Add CDN for static assets
- Implement rate limiting
- Use clustering in Express

**Infrastructure:**
- Load balancer for multiple servers
- Database replication
- Geographic distribution
- Auto-scaling groups

---

## Common Production Issues

### Issue 1: CORS Errors

**Symptom:** Frontend can't connect to backend

**Solution:**
```javascript
// backend/server.js
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://qrer.errorinfotech.in'] 
    : ['http://localhost:5173']
}));
```

### Issue 2: Mixed Content Errors

**Symptom:** Browser blocks HTTP requests on HTTPS site

**Solution:**
- Ensure ALL URLs use HTTPS
- Update all environment variables to https://
- Force HTTPS redirect in Express:

```javascript
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

### Issue 3: MongoDB Connection Timeout

**Symptom:** Can't connect to MongoDB Atlas

**Solution:**
- Whitelist server IP in MongoDB Atlas
- Check connection string format
- Verify password doesn't contain special characters (URL encode if needed)

### Issue 4: 404 on Routes

**Symptom:** Pages show 404 on refresh

**Solution:**
Configure server to serve index.html for all routes:

```javascript
// Already in server.js
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}
```

---

## Production Checklist

Before announcing launch:

- [ ] MongoDB Atlas configured and backed up
- [ ] Backend deployed and accessible
- [ ] Frontend built and deployed
- [ ] Domain DNS configured correctly
- [ ] HTTPS/SSL certificate active
- [ ] Environment variables set correctly
- [ ] QR codes generate with correct domain
- [ ] Redirect system tested
- [ ] All CRUD operations work
- [ ] Analytics tracking properly
- [ ] No console errors
- [ ] Mobile responsive tested
- [ ] Performance acceptable (<3s load time)
- [ ] Monitoring set up
- [ ] Backup strategy confirmed
- [ ] Documentation updated

---

## Cost Estimates

**Monthly Operating Costs (Starting):**

- MongoDB Atlas (M0 Free): $0/month
- Hosting (Railway/Render Basic): $5-10/month
- Domain (qrer.errorinfotech.in): ~$12/year
- **Total: ~$5-10/month**

At scale (10,000+ QR codes):
- MongoDB Atlas (M10): $57/month
- Hosting (Standard): $25/month
- **Total: ~$82/month**

---

## Support Resources

- **MongoDB Docs:** https://docs.mongodb.com/
- **Express Deployment:** https://expressjs.com/en/advanced/best-practice-performance.html
- **Node.js Production:** https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
- **Let's Encrypt:** https://letsencrypt.org/

---

**Ready to launch! 🚀**

For technical support during deployment, check the troubleshooting section or review application logs.
