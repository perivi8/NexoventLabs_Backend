# ⚡ Quick Email Test Guide for Render

## 🎯 **TL;DR - How to Test Emails on Render**

After deployment, visit this URL in your browser:

```
https://your-render-url.onrender.com/api/test-email
```

If you see `"success": true` → **Emails work!** ✅

---

## 📋 **Step-by-Step Testing**

### Step 1: Deploy to Render
```bash
git add .
git commit -m 'Your message'
git push
```

Wait for Render to deploy (2-5 minutes)

---

### Step 2: Check Logs

**You'll see this warning (THIS IS NORMAL):**
```
⚠️  Email transporter verification failed: Connection timeout
💡 This is NORMAL on Render due to network restrictions.
💡 Emails WILL work when actually sending
```

**Don't worry!** This is expected. Continue to Step 3.

---

### Step 3: Test Email Endpoint

Open in browser:
```
https://your-render-url.onrender.com/api/test-email
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully! Check your inbox at nexoventlabs@gmail.com"
}
```

---

### Step 4: Check Your Email

Go to `nexoventlabs@gmail.com` inbox.

You should receive an email with:
- **Subject:** ✅ Test Email - Render Deployment
- **Body:** Email service test confirmation

**If you received it → Everything works perfectly!** 🎉

---

## 🌐 **Test Contact Form**

### On Your Website:

1. Go to your contact form
2. Fill in:
   - Name: Test User
   - Email: your-test-email@example.com
   - Phone: 1234567890
   - Message: Testing contact form

3. Submit

4. Check `nexoventlabs@gmail.com` for:
   - ✅ Admin notification (your submission details)
   - ✅ Auto-reply sent to your test email

---

## ❌ **If Test Fails**

### Error: "Failed to send test email"

**Check:**
1. Environment variables in Render dashboard
2. `BREVO_SMTP_PORT` = 587
3. All Brevo credentials are correct

**Then:**
- Restart the service in Render
- Try the test endpoint again

---

## 📊 **What Each Endpoint Does**

### `/api/health`
- Checks if server is running
- Shows email configuration status
- Doesn't send emails

### `/api/test-email`
- **Sends actual test email**
- Proves emails work
- Use this to verify functionality

### `/api/contact`
- Your production contact form endpoint
- Sends 2 emails (admin + auto-reply)
- What your website uses

---

## ✅ **Success Checklist**

- [ ] Code pushed to GitHub
- [ ] Render deployed successfully
- [ ] Logs show server running (ignore timeout warning)
- [ ] `/api/test-email` returns success
- [ ] Test email received in inbox
- [ ] Contact form works on website

---

## 🚀 **Your Render URL**

Find it in Render Dashboard:
- Go to your service
- Look for the URL at the top (e.g., `https://nexoventlabs-backend.onrender.com`)

**Test URLs:**
```
Health Check:
https://your-url.onrender.com/api/health

Email Test:
https://your-url.onrender.com/api/test-email
```

---

## 💡 **Pro Tips**

1. **Bookmark the test endpoint** for quick testing
2. **Check spam folder** if email doesn't arrive in 1-2 minutes
3. **Render free tier** may sleep after inactivity - first request can be slow
4. **Verification timeout is normal** - actual sending works fine

---

**Need Help?** Check `RENDER_TIMEOUT_FIX.md` for detailed explanation.

**Last Updated:** Oct 31, 2025
