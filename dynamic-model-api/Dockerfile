FROM python:3.9-slim

# System dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgl1 \
 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your app
COPY . .

# Expose the port Flask runs on
EXPOSE 5000

# Run your app
CMD ["python", "app.py"]

# command to run in terminal:
# docker build -t dynamic-model-api .
# docker run -p 5000:5000 dynamic-model-api
