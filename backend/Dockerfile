FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create non-root user for security
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Cloud Run injects PORT env variable — default to 8080
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
ENV IS_PRODUCTION=true

# Run the server
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers 2
