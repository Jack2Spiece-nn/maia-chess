# Maia Chess Backend

A lightweight Flask application that serves as the API for the Maia chess engine.

## Quick Start

### Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the development server:
   ```bash
   python app.py
   ```

3. Test the health check endpoint:
   ```bash
   curl http://localhost:5000/
   ```

### Production with Gunicorn

```bash
gunicorn --bind 0.0.0.0:5000 --workers 2 app:app
```

### Docker

1. Build the image:
   ```bash
   docker build -t maia-chess-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 5000:5000 maia-chess-backend
   ```

## Deployment

### Render.com

This repository includes a `render.yaml` configuration file for one-click deployment to Render.com. Simply connect your repository to Render and it will automatically deploy the backend service.

## API Endpoints

### Health Check
- **URL:** `/`
- **Method:** GET
- **Response:** 
  ```json
  {
    "status": "ok",
    "message": "Maia Chess Backend is running",
    "version": "1.0.0"
  }
  ```

## Testing

Run the test suite:
```bash
python -m unittest test_app.py -v
```

Validate the setup:
```bash
python validate.py
```

## Dependencies

- Flask 2.3.3 - Web framework
- python-chess 1.999 - Chess library for game logic
- gunicorn 21.2.0 - Production WSGI server

## Next Steps

This is the foundational backend structure. Future enhancements will include:
- Integration with Maia models
- `/get_move` endpoint for chess move prediction
- Frontend integration