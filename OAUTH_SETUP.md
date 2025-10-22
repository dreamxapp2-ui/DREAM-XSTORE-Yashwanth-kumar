# OAuth2 Google Authentication Setup Guide

## Overview
This document outlines the configuration required for Google OAuth2 authentication to work properly in the Dream XStore application.

## Issues Fixed

### 1. Frontend OAuth URL Mismatch
- **Problem**: Frontend was calling `/auth/google` but backend route is `/api/auth/google`
- **Solution**: Updated LoginPage.tsx and SignupPage.tsx to use `/api/auth/google`

### 2. Callback Storage Inconsistency  
- **Problem**: OAuth callback stored user data differently than regular login
- **Solution**: Updated Callback.tsx to use consistent `dreamx_user` key and proper redirect

### 3. CORS Configuration
- **Problem**: Backend wasn't configured to accept credentials from frontend
- **Solution**: Added proper CORS configuration with origin and credentials support

## Required Environment Variables

### Backend (.env)
Create a `.env` file in `API-Backend/` with:

```env
# Server Configuration
PORT=3000
BACKEND_URL=http://localhost:3000

# Frontend Configuration
FRONTEND_URL=http://localhost:3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017/dreamxstore

# JWT Secret
JWT_SECRET=your-secure-jwt-secret-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend (.env.local)
Create a `.env.local` file in `Dreamxstore/` with:

```env
# Backend API URL
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Google Cloud Console Configuration

### 1. Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application**

### 2. Configure Authorized URLs

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:3001
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/google/callback
```

### 3. Copy Credentials
- Copy the **Client ID** to `GOOGLE_CLIENT_ID` in backend `.env`
- Copy the **Client Secret** to `GOOGLE_CLIENT_SECRET` in backend `.env`

## OAuth Flow Diagram

```
User clicks "Sign in with Google"
    ↓
Frontend redirects to: http://localhost:3000/api/auth/google
    ↓
Backend (Passport) redirects to Google OAuth consent screen
    ↓
User grants permission
    ↓
Google redirects to: http://localhost:3000/api/auth/google/callback
    ↓
Backend (Passport strategy) verifies user, creates/updates in DB
    ↓
Backend (googleCallback controller) generates JWT token
    ↓
Backend redirects to: http://localhost:3001/api/auth/google/callback?token=xxx&user=xxx
    ↓
Frontend (Callback.tsx) stores token and user in localStorage
    ↓
Frontend redirects to /trending
```

## Testing the OAuth Flow

### 1. Start the Backend
```bash
cd API-Backend
npm install
npm start
```
Backend should be running on `http://localhost:3000`

### 2. Start the Frontend
```bash
cd Dreamxstore
npm install
npm run dev
```
Frontend should be running on `http://localhost:3001`

### 3. Test OAuth Login
1. Navigate to `http://localhost:3001/login`
2. Click "Sign in with Google"
3. You should be redirected to Google's consent screen
4. After granting permission, you should be redirected back and logged in
5. Check browser localStorage for `dreamx_user` and `token` keys

## Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch" Error
**Cause**: The redirect URI in your Google Cloud Console doesn't match the one in your backend.

**Solution**: 
- Ensure Google Cloud Console has: `http://localhost:3000/api/auth/google/callback`
- Ensure backend `passport.js` has: `callbackURL: ${process.env.BACKEND_URL}/api/auth/google/callback`

### Issue 2: CORS Error
**Cause**: Backend not allowing frontend origin.

**Solution**: 
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check backend `app.js` has proper CORS configuration

### Issue 3: User Data Not Persisting
**Cause**: Inconsistent localStorage keys or missing storage event.

**Solution**: 
- Verify Callback.tsx stores data with key `dreamx_user`
- Ensure `window.dispatchEvent(new Event("storage"))` is called

### Issue 4: Infinite Redirect Loop
**Cause**: Frontend and backend URLs misconfigured.

**Solution**: 
- Verify `NEXT_PUBLIC_AUTH_URL` points to backend (port 3000)
- Verify `FRONTEND_URL` in backend points to frontend (port 3001)

## Security Notes

1. **Never commit `.env` files** - They are gitignored for security
2. **Use strong JWT secrets** - Generate a random string for production
3. **HTTPS in Production** - Always use HTTPS for OAuth in production
4. **Update redirect URIs** - Add your production domain to Google Cloud Console
5. **Environment-specific configs** - Use different OAuth credentials for dev/staging/prod

## Production Deployment Checklist

- [ ] Update `BACKEND_URL` to production backend URL
- [ ] Update `FRONTEND_URL` to production frontend URL  
- [ ] Update `NEXT_PUBLIC_AUTH_URL` to production backend URL
- [ ] Add production URLs to Google Cloud Console authorized origins
- [ ] Add production callback URL to Google Cloud Console redirect URIs
- [ ] Use environment-specific Google OAuth credentials
- [ ] Enable HTTPS/SSL certificates
- [ ] Update CORS configuration for production domains
- [ ] Generate new JWT_SECRET for production

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend terminal for errors
3. Verify all environment variables are set correctly
4. Verify Google Cloud Console configuration matches backend
5. Test with OAuth Debugger tools if needed
