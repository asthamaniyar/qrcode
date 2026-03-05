# API Documentation - Dynamic QR Generator

Complete API reference for the QR Generator platform.

Base URL (Development): `http://localhost:5000/api`
Base URL (Production): `https://qrer.er/api`

---

## Table of Contents

1. [Create QR Code](#create-qr-code)
2. [Get All QR Codes](#get-all-qr-codes)
3. [Get Single QR Code](#get-single-qr-code)
4. [Update QR Code](#update-qr-code)
5. [Delete QR Code](#delete-qr-code)
6. [Get Analytics](#get-analytics)
7. [Redirect Endpoint](#redirect-endpoint)

---

## Authentication

Currently, the API doesn't require authentication. For production use, consider adding:
- JWT tokens
- API keys
- OAuth 2.0

---

## Endpoints

### Create QR Code

Creates a new dynamic QR code with unique redirect URL.

**Endpoint:** `POST /api/qr/create`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Marketing Campaign 2024",
  "destinationUrl": "https://example.com/landing-page",
  "qrType": "square",
  "foregroundColor": "#000000",
  "backgroundColor": "#FFFFFF",
  "frameText": "Scan Me!"
}
```

**Required Fields:**
- `title` (string): Descriptive name for your QR code
- `destinationUrl` (string): Target URL (must be valid HTTP/HTTPS)

**Optional Fields:**
- `qrType` (string): One of: `square`, `rounded`, `dots`, `circle`, `frame`, `scanme`
- `foregroundColor` (string): Hex color (default: `#000000`)
- `backgroundColor` (string): Hex color (default: `#FFFFFF`)
- `frameText` (string): Text for frame style QRs

**Response (201 Created):**
```json
{
  "success": true,
  "message": "QR Code created successfully",
  "data": {
    "id": "abc123xyz",
    "code": "7HGsa9K",
    "title": "Marketing Campaign 2024",
    "destinationUrl": "https://example.com/landing-page",
    "redirectUrl": "http://localhost:5000/r/7HGsa9K",
    "qrType": "square",
    "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid destination URL format. Must be valid HTTP/HTTPS URL"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/qr/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test QR",
    "destinationUrl": "https://example.com"
  }'
```

---

### Get All QR Codes

Retrieves paginated list of all QR codes.

**Endpoint:** `GET /api/qr`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search by title or destination URL

**Example Request:**
```
GET /api/qr?page=1&limit=10&search=marketing
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a5f1b2c3d4e5f6g7h8i9j0",
      "code": "7HGsa9K",
      "title": "Marketing Campaign 2024",
      "destinationUrl": "https://example.com/landing-page",
      "qrType": "square",
      "foregroundColor": "#000000",
      "backgroundColor": "#FFFFFF",
      "scanCount": 42,
      "status": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-16T14:20:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

**Example (cURL):**
```bash
curl http://localhost:5000/api/qr
```

---

### Get Single QR Code

Retrieves details for a specific QR code by its unique code.

**Endpoint:** `GET /api/qr/:code`

**Parameters:**
- `code` (path, required): The unique QR code identifier

**Example Request:**
```
GET /api/qr/7HGsa9K
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65a5f1b2c3d4e5f6g7h8i9j0",
    "code": "7HGsa9K",
    "title": "Marketing Campaign 2024",
    "destinationUrl": "https://example.com/landing-page",
    "qrType": "square",
    "foregroundColor": "#000000",
    "backgroundColor": "#FFFFFF",
    "scanCount": 42,
    "status": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z",
    "redirectUrl": "http://localhost:5000/r/7HGsa9K"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "QR Code not found"
}
```

**Example (cURL):**
```bash
curl http://localhost:5000/api/qr/7HGsa9K
```

---

### Update QR Code

Updates an existing QR code. Destination URL can be changed without affecting the QR code.

**Endpoint:** `PUT /api/qr/:code`

**Parameters:**
- `code` (path, required): The unique QR code identifier

**Request Body (all optional):**
```json
{
  "title": "Updated Title",
  "destinationUrl": "https://newurl.com/new-page",
  "qrType": "rounded",
  "foregroundColor": "#FF0000",
  "backgroundColor": "#FFFFFF",
  "status": false,
  "frameText": "New Frame Text"
}
```

**Updatable Fields:**
- `title`: Change the display name
- `destinationUrl`: **This is the magic!** Update where QR points to
- `qrType`: Change visual style
- `foregroundColor`: Update QR color
- `backgroundColor`: Update background color
- `status`: Activate/deactivate (true/false)
- `frameText`: Update frame text

**Response (200 OK):**
```json
{
  "success": true,
  "message": "QR Code updated successfully",
  "data": {
    "code": "7HGsa9K",
    "title": "Updated Title",
    "destinationUrl": "https://newurl.com/new-page",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

**Example (cURL):**
```bash
curl -X PUT http://localhost:5000/api/qr/7HGsa9K \
  -H "Content-Type: application/json" \
  -d '{
    "destinationUrl": "https://newurl.com"
  }'
```

---

### Delete QR Code

Permanently deletes a QR code.

**Endpoint:** `DELETE /api/qr/:code`

**Parameters:**
- `code` (path, required): The unique QR code identifier

**Response (200 OK):**
```json
{
  "success": true,
  "message": "QR Code deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "QR Code not found"
}
```

**Example (cURL):**
```bash
curl -X DELETE http://localhost:5000/api/qr/7HGsa9K
```

---

### Get Analytics

#### Get Overall Analytics

Retrieves platform-wide analytics.

**Endpoint:** `GET /api/qr/analytics/overview`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalQRCodes": 150,
    "activeQRCodes": 142,
    "totalScans": 5420,
    "recentQRCodes": [
      {
        "code": "7HGsa9K",
        "title": "Latest Campaign",
        "scanCount": 23,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**Example (cURL):**
```bash
curl http://localhost:5000/api/qr/analytics/overview
```

#### Get Single QR Analytics

Retrieves analytics for a specific QR code.

**Endpoint:** `GET /api/qr/:code/analytics`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "code": "7HGsa9K",
    "totalScans": 42,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

**Example (cURL):**
```bash
curl http://localhost:5000/api/qr/7HGsa9K/analytics
```

---

### Redirect Endpoint

The core endpoint that handles QR code redirects. This is NOT part of the API but is called when QR codes are scanned.

**Endpoint:** `GET /r/:code`

**Parameters:**
- `code` (path, required): The unique QR code identifier

**Behavior:**
1. Looks up QR code in database
2. Checks if status is active
3. Increments scan count
4. Logs scan details (optional)
5. Redirects to destination URL (302 temporary redirect)

**Response (Active QR - 302 Redirect):**
```
HTTP/1.1 302 Found
Location: https://destination-url.com/page
```

**Response (Inactive/Not Found - 404):**
```html
<!DOCTYPE html>
<html>
<head>
  <title>QR Code Not Found</title>
  <style>
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 40px;
    }
  </style>
</head>
<body>
  <h1>❌ QR Code Not Found</h1>
  <p>This QR code is invalid or has been deactivated.</p>
</body>
</html>
```

**Example:**
When user scans QR code containing `https://qrer.er/r/7HGsa9K`:
```
GET /r/7HGsa9K
→ Redirects to stored destination URL
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical details (development only)"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful QR creation |
| 400 | Bad Request | Invalid URL format |
| 404 | Not Found | QR code doesn't exist |
| 500 | Internal Server Error | Database error |

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api', limiter);
```

---

## Validation Rules

### URL Validation

All destination URLs must:
- Use HTTP or HTTPS protocol
- Have valid domain structure
- Not be localhost or 127.0.0.1 (production)
- Not contain malicious scripts

Validation uses the `validator` npm package:
```javascript
validator.isURL(url, {
  protocols: ['http', 'https'],
  require_protocol: true,
  require_host: true
});
```

### Code Generation

QR codes use `nanoid` to generate unique 7-character codes:
- Alphanumeric (a-z, A-Z, 0-9)
- Case-sensitive
- Collision check before saving
- ~3.5 trillion possible combinations

---

## Webhooks (Future Feature)

Potential webhook events for future implementation:

- `qr.created` - When new QR is created
- `qr.updated` - When QR is updated
- `qr.deleted` - When QR is deleted
- `qr.scanned` - When QR is scanned (with scan data)

Example payload:
```json
{
  "event": "qr.scanned",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "code": "7HGsa9K",
    "scannedAt": "2024-01-15T10:30:00.000Z",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

---

## SDK Examples

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Create QR
async function createQR(title, url) {
  const response = await axios.post(`${API_BASE}/qr/create`, {
    title,
    destinationUrl: url
  });
  return response.data;
}

// Get all QRs
async function getAllQRs() {
  const response = await axios.get(`${API_BASE}/qr`);
  return response.data;
}

// Update QR
async function updateQR(code, updates) {
  const response = await axios.put(`${API_BASE}/qr/${code}`, updates);
  return response.data;
}
```

### Python

```python
import requests

API_BASE = 'http://localhost:5000/api'

def create_qr(title, url):
    response = requests.post(f'{API_BASE}/qr/create', json={
        'title': title,
        'destinationUrl': url
    })
    return response.json()

def get_all_qrs():
    response = requests.get(f'{API_BASE}/qr')
    return response.json()
```

### PHP

```php
<?php
function createQR($title, $url) {
    $ch = curl_init('http://localhost:5000/api/qr/create');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'title' => $title,
        'destinationUrl' => $url
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
?>
```

---

## Testing

### Postman Collection

Import these endpoints into Postman:

1. Create QR Code
   - Method: POST
   - URL: `http://localhost:5000/api/qr/create`
   - Body: Raw JSON

2. Get All QRs
   - Method: GET
   - URL: `http://localhost:5000/api/qr`

3. Update QR
   - Method: PUT
   - URL: `http://localhost:5000/api/qr/{code}`

4. Delete QR
   - Method: DELETE
   - URL: `http://localhost:5000/api/qr/{code}`

### Automated Testing

Future implementation could use:
- Jest (backend testing)
- Supertest (HTTP assertions)
- Cypress (E2E testing)

---

## Production Considerations

### Security Enhancements

1. **Add Authentication:**
   ```javascript
   const jwt = require('jsonwebtoken');
   
   function authenticate(req, res, next) {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) return res.status(401).send('Access denied');
     
     try {
       const verified = jwt.verify(token, process.env.JWT_SECRET);
       req.user = verified;
       next();
     } catch (error) {
       res.status(400).send('Invalid token');
     }
   }
   ```

2. **Input Sanitization:**
   ```javascript
   const sanitize = require('sanitize-html');
   const cleanTitle = sanitize(req.body.title);
   ```

3. **Rate Limiting:**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   app.use('/api', rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   }));
   ```

### Performance Optimization

1. **Database Indexing:**
   ```javascript
   qrCodeSchema.index({ code: 1 });
   qrCodeSchema.index({ createdAt: -1 });
   ```

2. **Caching:**
   ```javascript
   const cache = new Map();
   
   app.get('/api/qr/:code', (req, res) => {
     if (cache.has(req.params.code)) {
       return res.json(cache.get(req.params.code));
     }
     // Fetch from DB and cache result
   });
   ```

---

## Support

For API issues or questions:
- Check response error messages
- Review request format
- Verify base URL
- Check network tab in browser DevTools

**API Version:** 1.0
**Last Updated:** 2024
