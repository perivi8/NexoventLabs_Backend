# 🚀 Render Deployment Checklist

## Before Deployment

- [x] ✅ Updated `render.yaml` with port 587
- [x] ✅ Tested email locally (all tests passed)
- [ ] 📝 Update local `.env` file: `BREVO_SMTP_PORT=587`
- [ ] 🔄 Push code to Git repository

## Render Dashboard Setup

- [ ] 🌐 Login to [Render Dashboard](https://dashboard.render.com)
- [ ] 🔧 Go to your service → **Environment** tab
- [ ] ✏️ Update `BREVO_SMTP_PORT` to **587**
- [ ] 💾 Click **Save Changes**

## Deploy

- [ ] 🚀 Click **Manual Deploy** → **Deploy latest commit**
- [ ] ⏳ Wait for deployment to complete (2-5 minutes)

## Verify Deployment

- [ ] 📋 Check logs for: `✅ Email server is ready to send messages`
- [ ] 🔌 Verify log shows: `Port: 587 (Secure: No )`
- [ ] 🧪 Test health endpoint: `https://your-url.onrender.com/api/health`
- [ ] 📧 Test email endpoint: `https://your-url.onrender.com/api/test-email`
- [ ] 📨 Send test email via contact form

## Success Indicators

✅ **Deployment logs should show:**
```
🔧 SMTP Server: smtp-relay.brevo.com
🔌 Port: 587 (Secure: No )
✅ Email server is ready to send messages
```

✅ **Health endpoint should return:**
```json
{
  "emailService": "configured",
  "missingVars": []
}
```

✅ **Test email should return:**
```json
{
  "success": true,
  "message": "Email service is working"
}
```

## If Issues Occur

❌ **ETIMEDOUT error:**
- Double-check port is 587 in Render dashboard
- Restart the service
- Wait 30 seconds for SMTP verification

❌ **EAUTH error:**
- Verify SMTP credentials are correct
- Check Brevo dashboard for API key validity

❌ **Email not received:**
- Check spam folder
- Verify sender email in Brevo
- Check Brevo logs

---

## 📞 Support

If you encounter issues:
1. Check Render logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test locally first using `node test-complete.js`
4. Review `DEPLOYMENT.md` for detailed troubleshooting

---

**Last Updated:** Oct 31, 2025
**Status:** ✅ Ready for deployment
