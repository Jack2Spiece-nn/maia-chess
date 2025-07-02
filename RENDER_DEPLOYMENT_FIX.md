# Render Deployment Fix

## Issue
The Gunicorn workers were timing out during startup on Render, showing errors like:
- `WORKER TIMEOUT (pid:XX)`
- `Worker (pid:XX) was sent SIGKILL! Perhaps out of memory?`

## Root Cause
The TensorFlow library was being imported during module initialization in `maia_engine.py`, even though it wasn't actually being used. TensorFlow has a very slow initialization process (25-30+ seconds), which exceeded Gunicorn's default 30-second worker timeout.

## Fixes Applied

### 1. Increased Gunicorn Worker Timeout
Modified `backend/Dockerfile` to add a 120-second timeout:
```dockerfile
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "app:app"]
```

### 2. Removed Unused TensorFlow Import
- Commented out the TensorFlow import in `backend/maia_engine.py` since the current implementation uses lc0 (Leela Chess Zero) instead of TensorFlow models
- Removed `tensorflow-cpu==2.12.0` from `backend/requirements.txt`

## Additional Optimization Options

If you need to use TensorFlow in the future, consider these options:

### Option 1: Lazy Loading
Only import TensorFlow when actually needed:
```python
def some_function_that_needs_tf():
    import tensorflow as tf  # Import only when needed
    # Use TensorFlow here
```

### Option 2: Preload Application
Use Gunicorn's preload feature to load the application once before forking workers:
```dockerfile
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "--preload", "app:app"]
```

### Option 3: Reduce Worker Count
For memory-constrained environments, reduce to 1 worker:
```dockerfile
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "120", "app:app"]
```

### Option 4: Use Lighter Alternative
Consider using TensorFlow Lite or ONNX Runtime for inference if you need neural network support in the future.

## Verification
After these changes, the deployment should:
1. Start successfully without worker timeouts
2. Use less memory (no TensorFlow overhead)
3. Start faster (no 25+ second TensorFlow initialization)

## Memory Considerations
Render's free tier has limited memory (512MB). The current setup with lc0 and 2 workers should fit comfortably within these limits.