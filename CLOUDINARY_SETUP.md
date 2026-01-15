# Cloudinary Setup Guide

## 1. Create a Free Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com/)
2. Click **Sign Up for Free**
3. Complete registration (email verification required)

## 2. Get Your API Credentials

1. After logging in, go to your **Dashboard**
2. You'll see your credentials:
   - **Cloud Name** (e.g., `dxxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click to reveal)

## 3. Update Your `.env` File

Edit `backend/.env` and replace the placeholder values:

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## 4. That's It!

Restart your backend server and upload a report. It will automatically:
- Upload to Cloudinary after extraction
- Store the cloud URL in the database
- Allow viewing via the "View Original Report" button

## Free Tier Limits

- **25 GB** storage
- **25 GB** bandwidth/month
- More than enough for a health dashboard!

## Troubleshooting

**Reports not showing?**
- Check backend logs for "📤 Report uploaded to Cloudinary" message
- Verify credentials in `.env` are correct
- Existing local-only reports won't have cloud URLs (re-upload needed)
