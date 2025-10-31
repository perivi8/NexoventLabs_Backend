# Deployment Guide - Render

## ✅ Email Configuration Fixed

The SMTP port has been updated from **465** to **587** to resolve connection timeout issues on Render.

---

## 📋 Deployment Steps

### 1. Update Environment Variables in Render Dashboard

Go to your Render service → **Environment** tab and ensure these variables are set:

```
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM_EMAIL=your_email@example.com
BREVO_FROM_NAME=Your Company Name
BREVO_SMTP_EMAIL=your_smtp_email@smtp-brevo.com
BREVO_SMTP_PASSWORD=your_smtp_password_here
BREVO_SMTP_PORT=587
BREVO_SMTP_SERVER=smtp-relay.brevo.com
NODE_ENV=production
PORT=3001
```

**IMPORTANT:** Make sure `BREVO_SMTP_PORT` is set to **587** (not 465)

---

### 2. Deploy to Render

#### Option A: Using render.yaml (Recommended)
The `render.yaml` file has been updated with the correct port. Simply push your code:

```bash
git add .
git commit -m "Fix: Update SMTP port to 587 for Render deployment"
git push
```

Render will automatically deploy using the updated configuration.

#### Option B: Manual Deployment
1. Go to Render Dashboard
2. Select your service
3. Click **Manual Deploy** → **Deploy latest commit**

---

### 3. Verify Deployment

After deployment completes, check the logs for:

```
✅ Email server is ready to send messages
📧 From: nexoventlabs@gmail.com
🔧 SMTP Server: smtp-relay.brevo.com
🔌 Port: 587 (Secure: No )
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
  "message": "Email service is working",
  "config": {
    "host": "smtp-relay.brevo.com",
    "port": "587",
    "from": "nexoventlabs@gmail.com",
    "secure": false
  }
}
```

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

### Issue: Still getting ETIMEDOUT error

**Solution:**
1. Verify `BREVO_SMTP_PORT` is **587** in Render dashboard
2. Restart the service after updating environment variables
3. Check Render logs for any other errors

### Issue: Authentication failed (EAUTH)

**Solution:**
1. Verify SMTP credentials are correct
2. Check if Brevo API key is still valid
3. Ensure `BREVO_SMTP_EMAIL` and `BREVO_SMTP_PASSWORD` match your Brevo account

### Issue: Email not received

**Solution:**
1. Check spam/junk folder
2. Verify sender email is verified in Brevo
3. Check Brevo dashboard for email sending logs

---

## 📊 Configuration Summary

| Setting | Value | Notes |
|---------|-------|-------|
| SMTP Server | smtp-relay.brevo.com | Brevo's SMTP relay |
| SMTP Port | **587** | STARTTLS (recommended for Render) |
| Secure | false | Auto-set based on port |
| Connection Timeout | 30 seconds | Increased for Render free tier |
| Retry Attempts | 3 | With exponential backoff |

---

## ✅ Local Testing Results

All tests passed successfully:

- ✅ Health Check: configured
- ✅ Email Config: Valid (Port 587, Secure: false)
- ✅ Email Sending: Success

**Next Step:** Deploy to Render and verify in production environment.

---

## 📝 Notes

- Port **587** uses STARTTLS (secure: false)
- Port **465** uses SSL/TLS (secure: true)
- Render's network works better with port 587
- The server automatically sets `secure` based on the port number
