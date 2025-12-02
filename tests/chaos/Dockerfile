FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir \
    requests \
    pyyaml \
    schedule

# Copy chaos test scenarios
COPY scenarios/ ./scenarios/
COPY chaos_controller.py ./

# Run chaos controller
CMD ["python", "chaos_controller.py"]
