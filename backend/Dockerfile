# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Install lc0 engine (Leela Chess Zero)
# The Debian/Ubuntu repositories on Render do not currently contain an `lc0`
# package, so we download a pre-built CPU binary from the official releases.
# Using a single, self-contained binary keeps the image small and avoids
# compilation during the build step.
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget ca-certificates xz-utils \
    && wget -q https://github.com/LeelaChessZero/lc0/releases/download/v0.30.0/lc0-v0.30.0-linux-cpu-avx2.tar.xz \
    && tar -xJf lc0-v0.30.0-linux-cpu-avx2.tar.xz \
    && mv lc0-v0.30.0-linux-cpu-avx2/lc0 /usr/local/bin/ \
    && chmod +x /usr/local/bin/lc0 \
    && rm -rf /var/lib/apt/lists/* lc0-v0.30.0-linux-cpu-avx2*

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r requirements.txt

# Copy application code
COPY . .

# Expose port 5000
EXPOSE 5000

# Use gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "app:app"]