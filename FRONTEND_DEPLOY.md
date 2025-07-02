# Manual Frontend Deployment on Render

## Why Manual Deployment?

If only the backend deployed from the blueprint, you need to manually deploy the frontend as a **Static Site**. This is actually the preferred method for React apps on Render.

## Step-by-Step Frontend Deployment

### 1. Create New Static Site

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository (same repo as backend)

### 2. Configure the Static Site

Fill in these settings:

**Basic Settings:**
- **Name**: `maia-chess-frontend`
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (uses repo root)

**Build Settings:**
- **Build Command**: 
  ```bash
  cd frontend && npm ci && npm run build
  ```
- **Publish Directory**: 
  ```
  frontend/dist
  ```

**Advanced Settings:**
- **Auto-Deploy**: Yes
- **Pull Request Previews**: No (optional)

### 3. Environment Variables

Add this environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://maia-chess-backend.onrender.com` |

⚠️ **Important**: Replace `maia-chess-backend` with your actual backend service name if different.

### 4. Deploy

1. Click **"Create Static Site"**
2. Wait for the build to complete (~2-3 minutes)
3. Your frontend will be available at: `https://maia-chess-frontend.onrender.com`

## Build Process

The build will:
1. Navigate to `frontend/` directory
2. Install dependencies with `npm ci`
3. Build the React app with `npm run build`
4. Serve files from `frontend/dist/`

## Troubleshooting

### Build Fails
**Check logs for common issues:**

1. **Node version**: Should use Node 18+ (automatically handled)
2. **TypeScript errors**: Fix any TS compilation errors
3. **Missing dependencies**: Ensure all packages are in `package.json`

### Frontend Can't Connect to Backend
1. **Check Environment Variable**: Verify `VITE_API_URL` is set correctly
2. **Backend URL**: Make sure backend is deployed and accessible
3. **CORS**: Backend should already handle CORS properly

### 404 Errors on Routes
- **Fixed**: Added `_redirects` file for SPA routing
- This ensures all routes redirect to `index.html`

## Alternative: Update Blueprint

If you want to use the blueprint method:

1. **Push the updated `render.yaml`** (now with correct static site config)
2. **Re-deploy the blueprint** in Render dashboard
3. **Delete the existing services** and redeploy if needed

## Testing Your Deployment

Once deployed, test these URLs:

1. **Frontend**: `https://your-frontend-url.onrender.com`
2. **Backend API**: `https://your-backend-url.onrender.com/`
3. **API Test**: 
   ```bash
   curl https://your-backend-url.onrender.com/ \
   -H "Content-Type: application/json" \
   -d '{"fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "level": 1500}'
   ```

## Expected URLs

After deployment:
- **Frontend**: `https://maia-chess-frontend.onrender.com`
- **Backend**: `https://maia-chess-backend.onrender.com`

## Performance Notes

- **First Load**: ~10-15 seconds (static sites are faster than web services)
- **Subsequent Loads**: Near instant (cached)
- **API Calls**: May take 30+ seconds on first backend request (cold start)

---

## Success! 🎉

Your chess application will be fully functional with:
- ✅ Interactive chess board
- ✅ 9 AI difficulty levels (1100-1900 ELO)
- ✅ Move history and game controls
- ✅ Responsive design for all devices