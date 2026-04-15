FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg62-turbo zlib1g libfreetype6 libcairo2 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 appuser

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml .
RUN uv pip install --system .

COPY . .

# Create rendered_images dir and set permissions
RUN mkdir -p /app/rendered_images && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=3s --start-period=60s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
