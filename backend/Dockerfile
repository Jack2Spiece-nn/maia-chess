# Use Python 3.11 slim image as base
FROM python:3.11-slim

# ---------------------------------------------------------------------------
# Build and install lc0 (Leela Chess Zero) from source
# ---------------------------------------------------------------------------
# Debian does not provide an `lc0` package, and the upstream project no
# longer ships generic Linux CPU binaries.  We therefore build v0.31.2 from
# source.  The final image keeps only the lc0 executable and its runtime
# dependencies (OpenBLAS + libomp), while build-time toolchains are removed
# to keep the image small.

ARG LC0_VERSION=v0.31.2
RUN set -eux; \
    apt-get update; \
    # Runtime libs we will keep
    apt-get install -y --no-install-recommends libopenblas0 libomp5 ca-certificates; \
    # Build toolchain and headers
    apt-get install -y --no-install-recommends \
        build-essential git meson ninja-build pkg-config libopenblas-dev libomp-dev; \
    # Clone the requested tag (shallow) and build
    git clone --depth 1 --branch ${LC0_VERSION} https://github.com/LeelaChessZero/lc0.git /tmp/lc0; \
    mkdir /tmp/lc0/build; \
    # Note: We removed -Dbackend=blas as it's no longer a valid meson option in LC0 v0.31.2
    # The BLAS backend will be automatically built when OpenBLAS libraries are detected
    meson setup /tmp/lc0/build /tmp/lc0 \
        --buildtype=release \
        -Dgtest=false \
        -Ddefault_library=static \
        -Db_lto=false; \
    # Build just the `lc0` binary using at most two parallel jobs.  Limiting the
    # job count keeps peak RAM well below the 2 GB limit of standard Render
    # builders so the step no longer OOM-kills or times-out.
    meson compile -C /tmp/lc0/build -j 2 lc0; \
    install -m 755 /tmp/lc0/build/lc0 /usr/local/bin/; \
    strip /usr/local/bin/lc0 || true; \
    # Clean up build chain and sources to slim the image
    apt-get purge -y --auto-remove build-essential git meson ninja-build pkg-config libopenblas-dev libomp-dev; \
    rm -rf /var/lib/apt/lists/* /tmp/lc0

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