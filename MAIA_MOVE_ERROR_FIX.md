# Maia Move Error Fix

## Issue
Maia AI was unable to make moves and showed the error: "Invalid move: undefined"

## Root Cause
The backend was failing to find the Maia weight files due to a path mismatch:

- **Dockerfile**: Copies weights to `./maia_weights/` (same directory as app)
- **Code**: Looks for weights in `../maia_weights/` (parent directory)

This caused the backend to return error responses like:
```json
{"error":"Model not found: Model file not found for level 1500: maia-1500.pb.gz"}
```

The frontend then tried to process an undefined move, resulting in the "Invalid move: undefined" error.

## Fixes Applied

### 1. Fixed Weight File Path Resolution
Updated `backend/maia_engine.py` to look for weights in both locations:

```python
_WEIGHTS_DIRS = [
    os.path.join(os.path.dirname(__file__), "..", "maia_weights"),  # For local development
    os.path.join(os.path.dirname(__file__), "..", "models"),       # For local development
    os.path.join(os.path.dirname(__file__), "maia_weights"),       # For Docker deployment
    os.path.join(os.path.dirname(__file__), "models"),             # For Docker deployment
]
```

### 2. Improved Error Handling
Enhanced error handling in `frontend/src/hooks/useChessGame.ts` to:
- Check for missing move responses
- Display backend error messages clearly
- Handle network errors gracefully
- Provide more descriptive error messages

## Verification Steps

After redeployment, test the fix:

1. **Check backend health**: 
   ```bash
   curl https://maia-chess-backend.onrender.com/
   ```

2. **Test move generation**:
   ```bash
   curl -X POST https://maia-chess-backend.onrender.com/get_move \
     -H "Content-Type: application/json" \
     -d '{"fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "level": 1500}'
   ```

3. **Verify frontend**: Start a new game and confirm Maia can make moves

## Expected Result
- Backend should return valid UCI moves (e.g., `{"move": "e2e4", "level": 1500}`)
- Frontend should display moves correctly without errors
- Maia should be able to play at all skill levels (1100-1900)

## Deployment
Redeploy both services on Render to apply the fixes. The backend deployment will rebuild with the corrected path resolution.