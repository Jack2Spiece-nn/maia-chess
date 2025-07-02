# Debugging Render Deployment 404 Error

## Current Issue
Maia cannot make moves and returns "Request failed with status code 404" error.

## Step 1: Verify Backend Service URL

### Check Actual Service URL in Render Dashboard
1. Go to your Render dashboard
2. Find the backend service (should be named `maia-chess-backend`)
3. Check the actual URL in the service details
4. The URL might be different from `https://maia-chess-backend.onrender.com`

### Test Backend Health Endpoint
Test the backend directly with:
```bash
curl https://[YOUR-ACTUAL-BACKEND-URL]/
```

Expected response:
```json
{
  "status": "ok",
  "message": "Maia Chess Backend is running",
  "version": "1.0.0"
}
```

## Step 2: Check Frontend Environment Variable

### Verify VITE_API_URL
1. In Render dashboard, go to your frontend service
2. Check Environment Variables
3. Ensure `VITE_API_URL` matches your actual backend URL
4. Update if necessary to: `https://[YOUR-ACTUAL-BACKEND-URL]`

## Step 3: Test API Endpoint Directly

Test the move prediction endpoint:
```bash
curl -X POST https://[YOUR-ACTUAL-BACKEND-URL]/get_move \
  -H "Content-Type: application/json" \
  -d '{"fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "level": 1500}'
```

Expected response:
```json
{
  "move": "e2e4",
  "level": 1500
}
```

## Step 4: Common URL Issues

### Auto-generated Service Names
Render might have auto-generated a different service name if `maia-chess-backend` was already taken:
- `maia-chess-backend-xxx` (with random suffix)
- `maia-chess-backend-1`, `maia-chess-backend-2`, etc.

### Region-specific URLs
Some services might have region-specific URLs:
- `https://maia-chess-backend-onrender-com.onrender.com`
- `https://maia-chess-backend.onrender.com`

## Step 5: Check Backend Logs

1. In Render dashboard → Backend service → Logs
2. Look for startup errors:
   - Model loading issues
   - lc0 engine initialization problems
   - File not found errors for model weights

## Step 6: Quick Fix Solution

If the backend URL is different, update the frontend environment variable:

1. Go to Render dashboard → Frontend service → Environment
2. Update `VITE_API_URL` to the correct backend URL
3. Redeploy the frontend service

## Step 7: Alternative Debugging

### Enable Debug Logging in Frontend
Add console logging to see the actual API URL being used:

In `frontend/src/services/api.ts`, add:
```typescript
console.log('API Base URL:', API_BASE_URL);
```

### Check Browser Network Tab
1. Open browser developer tools
2. Go to Network tab
3. Try to make a move with Maia
4. Check the failed request to see the exact URL being called

## Step 8: Manual URL Override (Quick Test)

For immediate testing, you can temporarily hardcode the backend URL:

In `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://[YOUR-ACTUAL-BACKEND-URL]';
```

## Most Likely Solutions

1. **Update Environment Variable**: Fix `VITE_API_URL` to match actual backend URL
2. **Check Service Names**: Backend service might have a different auto-generated name
3. **Restart Services**: Sometimes a simple restart resolves connectivity issues

## Prevention

To avoid this in the future:
1. Use custom service names that won't conflict
2. Set up health check endpoints
3. Add proper error handling and logging