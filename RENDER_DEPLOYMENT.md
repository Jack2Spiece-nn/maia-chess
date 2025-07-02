# Render.com Deployment Guide for Maia Chess

## Fixed Issues ✅

The TensorFlow compatibility issues have been resolved:

- ✅ **Updated to `tensorflow-cpu==2.12.0`** (compatible with cloud deployment)
- ✅ **Fixed numpy version** to `1.23.5` (compatible with TensorFlow 2.12.0)
- ✅ **Fixed protobuf version** to `3.20.3` (compatible with TensorFlow 2.12.0)
- ✅ **Updated Python runtime** to `3.10.12` (stable and compatible)
- ✅ **Optimized Render configuration** with proper timeout and workers settings

## Quick Deploy Steps

### 1. Connect Repository to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Blueprint" 
3. Connect your GitHub repository containing this code
4. Render will automatically detect the `render.yaml` configuration

### 2. Automatic Deployment

The `render.yaml` file will automatically create:

- **Backend Service**: `maia-chess-backend` (Flask API)
- **Frontend Service**: `maia-chess-frontend` (React app)

### 3. Configuration Details

**Backend:**
- **Runtime**: Python 3.10.12
- **Dependencies**: Lightweight TensorFlow CPU version
- **Fallback**: Gracefully handles TensorFlow loading issues
- **Workers**: Optimized for free tier (1 worker, 120s timeout)

**Frontend:**
- **Runtime**: Node.js (latest)
- **Build**: Vite production build
- **API URL**: Automatically configured to connect to backend

## Expected Deploy Time

- **Backend**: ~5-8 minutes (installing TensorFlow dependencies)
- **Frontend**: ~2-3 minutes (Node.js build)

## Post-Deployment

### URLs
- Frontend: `https://maia-chess-frontend.onrender.com`
- Backend API: `https://maia-chess-backend.onrender.com`

### Test the Deployment

Test the backend health:
```bash
curl https://maia-chess-backend.onrender.com/
```

Expected response:
```json
{
  "status": "ok",
  "message": "Maia Chess Backend is running",
  "version": "1.0.0"
}
```

## Troubleshooting

### If Backend Fails to Start

1. **Check Logs**: In Render dashboard → Backend service → Logs
2. **Common Issues**:
   - Build timeout: The free tier has build limits, retry deployment
   - Memory issues: Restart the service in Render dashboard

### If Frontend Can't Connect to Backend

1. **Check Environment Variable**: Frontend should have `VITE_API_URL` set to backend URL
2. **CORS Issues**: Backend already has CORS handling, but check browser console

### Performance Notes

- **First Request**: May take 30+ seconds (cold start)
- **Model Loading**: Backend caches models after first use
- **Free Tier**: Services sleep after 15 minutes of inactivity

## Advanced Configuration

### Custom Domain (Optional)

In Render dashboard:
1. Go to Frontend service → Settings
2. Add custom domain
3. Follow DNS setup instructions

### Environment Variables

The deployment uses these environment variables:
- `FLASK_ENV=production`
- `PYTHONUNBUFFERED=1`
- `VITE_API_URL` (auto-configured)

## Cost Estimate

- **Free Tier**: Both services can run on free tier
- **Paid Tier**: $7/month per service for better performance
- **No database costs**: Uses in-memory model caching

## Manual Deployment Alternative

If blueprint fails, deploy manually:

1. **Backend**: 
   - New Web Service → Connect repo
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && gunicorn app:app`

2. **Frontend**:
   - New Static Site → Connect repo
   - Build Command: `cd frontend && npm ci && npm run build`
   - Publish Directory: `frontend/dist`

---

## Success! 🎉

Once deployed, you'll have a fully functional chess game where users can play against human-like AI at different skill levels (ELO 1100-1900).

The backend gracefully handles TensorFlow loading and will work even if some ML dependencies have issues, ensuring reliable deployment on Render's infrastructure.