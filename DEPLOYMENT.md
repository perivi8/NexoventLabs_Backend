# Deployment Guide - Render

## ✅ Email Configuration Fixed - Using Brevo API

**IMPORTANT:** Render blocks SMTP connections, so we now use **Brevo HTTP API** instead.

---

## 📋 Deployment Steps

### 1. Get Brevo API Key

1. Login to [Brevo Dashboard](https://app.brevo.com/)
2. Go to **Settings** → **SMTP & API**
3. Click **API Keys** tab
4. Generate a new API key (v3)
5. Copy the key (format: `xkeysib-...`)

### 2. Update Environment Variables in Render Dashboard

Go to your Render service → **Environment** tab and set these variables:

```
BREVO_API_KEY=xkeysib-your-actual-api-key-here
BREVO_FROM_EMAIL=nexoventlabs@gmail.com
BREVO_FROM_NAME=NexoventLabs
NODE_ENV=production
PORT=3001
```

**IMPORTANT:** Remove old SMTP variables if they exist:
- ❌ BREVO_SMTP_SERVER
- ❌ BREVO_SMTP_PORT
- ❌ BREVO_SMTP_EMAIL
- ❌ BREVO_SMTP_PASSWORD

---

### 3. Deploy to Render

#### Option A: Using render.yaml (Recommended)
Simply push your code:

```bash
git add .
git commit -m "Fix: Switch to Brevo API for email (Render blocks SMTP)"
git push
```

Render will automatically deploy using the updated configuration.

#### Option B: Manual Deployment
1. Go to Render Dashboard
2. Select your service
3. Click **Manual Deploy** → **Deploy latest commit**

---

### 4. Verify Deployment

After deployment completes, check the logs for:

```
✅ Email service configured using Brevo API
📧 From: nexoventlabs@gmail.com
🔧 API Method: HTTP (SMTP blocked on Render)
💡 Using Brevo API v3 for reliable email delivery
🚀 Server is running on port 3001
```

If you see this, the email service is configured correctly!

---

## 🧪 Testing Email on Production

### Test 1: Health Check
```bash
curl https://your-render-url.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "emailService": "configured",
  "missingVars": [],
  "timestamp": "2025-10-31T12:38:28.305Z"
}
```

### Test 2: Email Configuration Test
```bash
curl https://your-render-url.onrender.com/api/test-email
```

Expected response:
```json
{
  "success": true,
  "message": "Test email sent successfully! Check your inbox at nexoventlabs@gmail.com",
  "config": {
    "method": "Brevo API v3",
    "apiUrl": "https://api.brevo.com/v3/smtp/email",
    "from": "nexoventlabs@gmail.com",
    "note": "Using HTTP API instead of SMTP (Render blocks SMTP ports)"
  }
}
```

**Check your inbox** - you should receive the test email!

### Test 3: Send Test Email
```bash
curl -X POST https://your-render-url.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "message": "Test message from production"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Email sent successfully!"
}
```

---

## 🔍 Troubleshooting

### Issue: "Missing required environment variables"

**Solution:**
1. Verify `BREVO_API_KEY` is set in Render dashboard
2. Ensure `BREVO_FROM_EMAIL` and `BREVO_FROM_NAME` are set
3. Restart the service after updating environment variables
4. Check Render logs for specific missing variables

### Issue: "Brevo API error: 401"

**Solution:**
1. API key is invalid or expired
2. Generate a new API key in Brevo dashboard
3. Update `BREVO_API_KEY` in Render
4. Redeploy the service

### Issue: "Brevo API error: 400"

**Solution:**
1. Sender email not verified in Brevo
2. Go to Brevo → Senders & IP → Add sender
3. Verify `BREVO_FROM_EMAIL`

### Issue: Email not received

**Solution:**
1. Check spam/junk folder
2. Verify sender email is verified in Brevo
3. Check Brevo dashboard for email sending logs

---

## 📊 Configuration Summary

| Setting | Value | Notes |
|---------|-------|-------|
| Email Method | Brevo API v3 | HTTP-based (SMTP blocked on Render) |
| API Endpoint | https://api.brevo.com/v3/smtp/email | RESTful API |
| Authentication | API Key | In request headers |
| Timeout | 10 seconds | Fast HTTP requests |
| Retry Attempts | 3 | With exponential backoff |
| Rate Limit | 300/day, 9000/month | Brevo free tier |

---

## ✅ Why Brevo API Instead of SMTP?

**Render blocks SMTP ports** (25, 465, 587) on the free tier to prevent spam.

### Benefits of API:
- ✅ Works on ALL hosting platforms
- ✅ Faster (1-2s vs 30-60s timeout)
- ✅ More reliable
- ✅ Better error messages
- ✅ Simpler configuration (3 vars vs 6)
- ✅ No port restrictions

---

## 📝 Notes

- **SMTP is blocked on Render** - Don't try to use it!
- API uses standard HTTP/HTTPS - Works everywhere
- Same email templates and functionality
- Frontend code unchanged
- More modern and recommended by Brevo
