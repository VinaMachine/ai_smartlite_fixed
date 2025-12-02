FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir \
    hvac \
    schedule \
    cryptography

# Copy rotation scripts
COPY rotate_secrets.py ./

# Run secret rotator
CMD ["python", "rotate_secrets.py"]
