#!/bin/bash

# Instance Setup Script for Flask ML API
# This script is run on the EC2 instance to set up the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Setting up Flask ML API on EC2 instance..."

# Update system
print_status "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install NVIDIA Docker runtime
print_status "Installing NVIDIA Docker runtime..."
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker

# Verify NVIDIA Docker installation
print_status "Verifying NVIDIA Docker installation..."

# Check if NVIDIA drivers are available
if command -v nvidia-smi &> /dev/null; then
    print_status "NVIDIA drivers found, checking GPU..."
    nvidia-smi
else
    print_warning "NVIDIA drivers not found. This might be normal if using Deep Learning AMI."
fi

# Test Docker GPU access
print_status "Testing Docker GPU access..."
if sudo docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu20.04 nvidia-smi; then
    print_status "NVIDIA Docker runtime working correctly!"
else
    print_warning "NVIDIA Docker runtime test failed. This might be due to:"
    print_warning "1. NVIDIA drivers not loaded"
    print_warning "2. Docker runtime not configured"
    print_warning "3. Instance restart required"
    print_warning "The application will still work but without GPU acceleration."
fi

# Install additional system dependencies
print_status "Installing additional system dependencies..."
sudo apt-get install -y \
    htop \
    nvtop \
    tree \
    jq \
    curl \
    wget \
    git \
    unzip

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /opt/flask-app
sudo chown ubuntu:ubuntu /opt/flask-app
cd /opt/flask-app

# Clone the repository (replace with your actual repository URL)
print_status "Cloning application repository..."
# git clone https://github.com/yourusername/scraply.git .
# cd dynamic-model-api

# For now, we'll create a simple setup
print_status "Setting up application files..."

# Create a simple test to verify GPU access
cat > test_gpu.py << 'EOF'
import torch
import sys

print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"Number of GPUs: {torch.cuda.device_count()}")
    for i in range(torch.cuda.device_count()):
        print(f"GPU {i}: {torch.cuda.get_device_name(i)}")
else:
    print("CUDA is not available")
    sys.exit(1)
EOF

# Create a startup script
cat > start_app.sh << 'EOF'
#!/bin/bash
cd /opt/flask-app
echo "Starting Flask ML API..."
docker-compose -f docker-compose.prod.yml up -d --build
echo "Application started. Check logs with: docker-compose -f docker-compose.prod.yml logs -f"
EOF

chmod +x start_app.sh

# Create a monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "=== System Resources ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1
echo ""
echo "Memory Usage:"
free -h
echo ""
echo "GPU Usage:"
nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv
echo ""
echo "Docker Containers:"
docker ps
echo ""
echo "Application Logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20
EOF

chmod +x monitor.sh

# Create a backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf $BACKUP_DIR/flask-app-backup-$DATE.tar.gz -C /opt flask-app
echo "Backup created: $BACKUP_DIR/flask-app-backup-$DATE.tar.gz"
EOF

chmod +x backup.sh

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/flask-app << 'EOF'
/opt/flask-app/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
}
EOF

# Create logs directory
mkdir -p /opt/flask-app/logs

# Set up systemd service for auto-restart
print_status "Setting up systemd service..."
sudo tee /etc/systemd/system/flask-app.service << 'EOF'
[Unit]
Description=Flask ML API
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/flask-app
ExecStart=/opt/flask-app/start_app.sh
ExecStop=/usr/local/bin/docker-compose -f /opt/flask-app/docker-compose.prod.yml down
User=ubuntu
Group=ubuntu

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable flask-app.service

# Set up CloudWatch monitoring
print_status "Setting up CloudWatch monitoring..."
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# Create a simple health check script
cat > health_check.sh << 'EOF'
#!/bin/bash
# Health check script for the Flask application
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ $response -eq 200 ]; then
    echo "Application is healthy"
    exit 0
else
    echo "Application health check failed with status: $response"
    exit 1
fi
EOF

chmod +x health_check.sh

# Set up cron job for health checks
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/flask-app/health_check.sh >> /opt/flask-app/logs/health.log 2>&1") | crontab -

print_status "Instance setup completed successfully!"
echo ""
echo "=== Next Steps ==="
echo "1. Copy your application files to /opt/flask-app/"
echo "2. Run: cd /opt/flask-app && ./start_app.sh"
echo "3. Monitor with: ./monitor.sh"
echo "4. Check logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "5. Test GPU: python3 test_gpu.py"
echo ""
echo "=== Useful Commands ==="
echo "Start app: ./start_app.sh"
echo "Stop app: docker-compose -f docker-compose.prod.yml down"
echo "Monitor: ./monitor.sh"
echo "Backup: ./backup.sh"
echo "Health check: ./health_check.sh"
echo ""
print_status "Setup completed! Your Flask ML API is ready to be deployed."
