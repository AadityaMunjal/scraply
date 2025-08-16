#!/bin/bash

# Upload Flask App to S3 for AWS Deployment
# This script uploads the necessary files to S3, then you can download them via SSH from AWS console

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${WHITE}📋 $1${NC}"
}

# Check if bucket name is provided
if [ $# -eq 0 ]; then
    print_error "Usage: $0 <bucket-name> [region]"
    print_info "Example: $0 my-deployment-bucket us-east-1"
    exit 1
fi

BUCKET_NAME=$1
REGION=${2:-us-east-1}

echo -e "${GREEN}🚀 Uploading Flask App files to S3 bucket: $BUCKET_NAME${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first: https://aws.amazon.com/cli/"
    exit 1
fi

print_status "AWS CLI is installed"

# Create a temporary directory for the deployment package
TEMP_DIR="temp-deployment"
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi
mkdir -p "$TEMP_DIR"

print_step "Creating deployment package..."

# Copy application files
cp dynamic-model-api/app.py "$TEMP_DIR/"
cp dynamic-model-api/models.py "$TEMP_DIR/"
cp dynamic-model-api/params.py "$TEMP_DIR/"
cp dynamic-model-api/generate.py "$TEMP_DIR/"
cp dynamic-model-api/requirements.txt "$TEMP_DIR/"
cp dynamic-model-api/Dockerfile "$TEMP_DIR/"
cp dynamic-model-api/docker-compose.yml "$TEMP_DIR/"
cp dynamic-model-api/docker-compose.prod.yml "$TEMP_DIR/"

# Create datasets directory and copy datasets
mkdir -p "$TEMP_DIR/datasets"
cp -r dynamic-model-api/datasets/* "$TEMP_DIR/datasets/"

# Create a deployment script for the EC2 instance
cat > "$TEMP_DIR/deploy.sh" << 'EOF'
#!/bin/bash
# Deployment script for EC2 instance

echo "🚀 Starting Flask app deployment..."

# Update system
sudo apt-get update
sudo apt-get install -y python3-pip docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Python dependencies
pip3 install -r requirements.txt

# Build and run with Docker Compose
sudo docker-compose -f docker-compose.prod.yml up -d --build

echo "✅ Deployment complete!"
echo "🌐 Flask app should be running on: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
EOF

# Create a simple download script for the EC2 instance
cat > "$TEMP_DIR/download-and-deploy.sh" << EOF
#!/bin/bash
# Download script for EC2 instance

BUCKET_NAME="$BUCKET_NAME"
REGION="$REGION"

echo "📥 Downloading files from S3..."

# Install AWS CLI if not present
if ! command -v aws &> /dev/null; then
    echo "Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf awscliv2.zip aws
fi

# Download all files from S3
aws s3 sync s3://\$BUCKET_NAME/flask-app/ . --region \$REGION

# Make deployment script executable
chmod +x deploy.sh

echo "✅ Files downloaded successfully!"
echo "🚀 Run: ./deploy.sh to start the Flask app"
EOF

# Make scripts executable
chmod +x "$TEMP_DIR/deploy.sh"
chmod +x "$TEMP_DIR/download-and-deploy.sh"

print_step "Uploading files to S3..."

# Upload all files to S3
if aws s3 sync "$TEMP_DIR/" "s3://$BUCKET_NAME/flask-app/" --region "$REGION"; then
    print_status "Files uploaded successfully to S3!"
    
    # Clean up temporary directory
    rm -rf "$TEMP_DIR"
    
    echo ""
    print_info "🎯 Next Steps:"
    echo -e "${WHITE}1. SSH into your EC2 instance from AWS Console${NC}"
    echo -e "${WHITE}2. Run the download script:${NC}"
    echo -e "${GRAY}   aws s3 sync s3://$BUCKET_NAME/flask-app/ . --region $REGION${NC}"
    echo -e "${GRAY}   chmod +x deploy.sh${NC}"
    echo -e "${GRAY}   ./deploy.sh${NC}"
    echo ""
    echo -e "${YELLOW}🌐 Your Flask app will be available at: http://[EC2-PUBLIC-IP]:5000${NC}"
else
    print_error "Failed to upload files to S3"
    exit 1
fi
