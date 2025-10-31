# ⚡ Quick Fix Guide - Email Not Working on Render

## 🎯 Problem
Emails timeout on Render because **SMTP ports are blocked**.

## ✅ Solution
Switch to Brevo HTTP API (already implemented in code).

---

## 🚀 3-Step Fix

### Step 1: Get API Key (2 minutes)
1. Go to https://app.brevo.com/
2. Settings → SMTP & API → API Keys
3. Generate new key
4. Copy it (starts with `xkeysib-`)

### Step 2: Update Render (1 minute)
Go to Render Dashboard → Your Service → Environment:

**Add/Update:**
```
BREVO_API_KEY=xkeysib-paste-your-key-here
BREVO_FROM_EMAIL=nexoventlabs@gmail.com
BREVO_FROM_NAME=NexoventLabs
```

**Delete (if they exist):**
```
BREVO_SMTP_SERVER
BREVO_SMTP_PORT
BREVO_SMTP_EMAIL
BREVO_SMTP_PASSWORD
```

### Step 3: Deploy (2 minutes)
```bash
git add .
git commit -m "Fix: Switch to Brevo API"
git push
```

Wait for Render to deploy (auto-deploys from git).

---

## ✅ Verify It Works

Visit: `https://your-app.onrender.com/api/test-email`

Should see:
```json
{
  "success": true,
  "message": "Test email sent successfully!"
}
```

Check your inbox at `nexoventlabs@gmail.com` - you'll receive the test email!

---

## 📋 What Changed in Code

- ❌ Removed: `nodemailer` package (SMTP)
- ✅ Added: Native `fetch()` for Brevo API
- ✅ Faster: 1-2s instead of 30-60s timeout
- ✅ Works: On ALL platforms (Render, Vercel, etc.)

---

## 🆘 Still Not Working?

### Check 1: API Key Valid?
- Must start with `xkeysib-`
- Generated from Brevo dashboard
- Not expired

### Check 2: Email Verified?
- Go to Brevo → Senders & IP
- Verify `nexoventlabs@gmail.com`

### Check 3: Render Logs
Look for:
```
✅ Email service configured using Brevo API
```

If you see:
```
❌ Missing required environment variables: BREVO_API_KEY
```
→ Go back to Step 2

---

## 💡 Why This Fix Works

| SMTP (Old) | Brevo API (New) |
|------------|-----------------|
| ❌ Blocked on Render | ✅ Works everywhere |
| ❌ 30-60s timeout | ✅ 1-2s response |
| ❌ 6 env variables | ✅ 3 env variables |
| ❌ Complex setup | ✅ Simple HTTP |

---

**Total Time:** ~5 minutes  
**Difficulty:** Easy  
**Status:** Production Ready ✅
