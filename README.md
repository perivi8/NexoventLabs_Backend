# NexoventLabs Backend API

Backend API server for NexoventLabs contact form with email functionality using Brevo (formerly Sendinblue).

## Features

- ✉️ Contact form submission handling
- 📧 Automated email notifications to admin
- 🤖 Auto-reply emails to users
- ✅ Input validation (email, phone, required fields)
- 🎨 Beautiful HTML email templates with branding
- 🔒 CORS enabled for secure cross-origin requests
- 🏥 Health check endpoint

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Brevo account (free tier available)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file is already included in this backend folder. Update it with your actual Brevo credentials:

```env
# Brevo Configuration
BREVO_API_KEY=your-actual-brevo-api-key
BREVO_FROM_EMAIL=nexoventlabs@gmail.com
BREVO_FROM_NAME="NexoventLabs"
BREVO_SMTP_EMAIL=your-actual-smtp-email@smtp-brevo.com
BREVO_SMTP_PASSWORD=your-actual-brevo-smtp-password
BREVO_SMTP_PORT=587
BREVO_SMTP_SERVER=smtp-relay.brevo.com

# Server Configuration
PORT=3001
```

### 3. Get Brevo Credentials

1. Sign up at [Brevo](https://www.brevo.com/)
2. Go to **Settings** → **SMTP & API**
3. Create an SMTP key
4. Copy your SMTP credentials to `.env`

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### POST /api/contact

Submit a contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Hello, I'm interested in your services."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email sent successfully!"
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Error description"
}
```

### GET /api/health

Health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Deployment to Render

### Step 1: Push to GitHub

1. Initialize git in the backend folder (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial backend setup"
   ```

2. Create a new repository on GitHub and push:
   ```bash
   git remote add origin https://github.com/yourusername/nexoventlabs-backend.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. Go to [Render.com](https://render.com/) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `nexoventlabs-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

### Step 3: Add Environment Variables

In Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `BREVO_API_KEY` | Your Brevo API key |
| `BREVO_FROM_EMAIL` | nexoventlabs@gmail.com |
| `BREVO_FROM_NAME` | NexoventLabs |
| `BREVO_SMTP_EMAIL` | Your SMTP email from Brevo |
| `BREVO_SMTP_PASSWORD` | Your SMTP password from Brevo |
| `BREVO_SMTP_PORT` | 587 |
| `BREVO_SMTP_SERVER` | smtp-relay.brevo.com |
| `PORT` | 3001 |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Note your backend URL (e.g., `https://nexoventlabs-backend.onrender.com`)

### Step 5: Update Frontend

Update your frontend's environment variable:
- `VITE_API_URL` = `https://nexoventlabs-backend.onrender.com`

### Alternative: Deploy to Railway

1. Go to [Railway.app](https://railway.app/)
2. Create new project from GitHub repo
3. Add environment variables
4. Deploy automatically

## Email Templates

The server sends two types of emails:

1. **Admin Notification**: Sent to `BREVO_FROM_EMAIL` with contact form details
2. **Auto-Reply**: Sent to the user confirming receipt of their message

Both emails feature:
- Beautiful HTML templates with NexoventLabs branding
- Responsive design
- Diagonal watermark with company logo
- Plain text fallback

## Validation

The API validates:
- ✅ All fields are required
- ✅ Email format (regex validation)
- ✅ Phone number format (minimum 10 digits)

## CORS Configuration

By default, CORS is enabled for all origins. For production, update `server.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.vercel.app'],
  credentials: true
}));
```

## Troubleshooting

### Email not sending

1. Verify Brevo credentials in `.env`
2. Check Brevo dashboard for API key status
3. Ensure SMTP credentials are correct
4. Check server logs for specific errors

### CORS errors

Update CORS configuration to include your frontend domain.

### Port already in use

Change the PORT in `.env` or kill the process using port 3001:

**Windows:**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:3001 | xargs kill -9
```

## Project Structure

```
backend/
├── server.js          # Main Express server
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (included)
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## Security Notes

- ⚠️ The `.env` file is included for convenience but contains placeholder values
- 🔒 Update all credentials before deployment
- 🚫 Never commit real credentials to version control
- 🔐 Use environment variables in production platforms

## Support

For issues or questions:
- Email: nexoventlabs@gmail.com
- Phone: +91 8106811285

## License

MIT License - NexoventLabs © 2024
