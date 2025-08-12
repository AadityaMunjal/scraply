#!/bin/bash

# AWS Deployment Script for Flask ML API
# This script deploys the application to AWS using CloudFormation

set -e

# Configuration
STACK_NAME="flask-ml-api-stack"
REGION="us-east-1"
KEY_PAIR_NAME="flask-ml-api-key"  # Replace with your actual key pair name

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

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials are not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if key pair exists
if ! aws ec2 describe-key-pairs --key-names "$KEY_PAIR_NAME" --region "$REGION" &> /dev/null; then
    print_error "Key pair '$KEY_PAIR_NAME' does not exist in region '$REGION'."
    print_warning "Please create a key pair first or update the KEY_PAIR_NAME variable."
    exit 1
fi

print_status "Starting deployment of Flask ML API to AWS..."

# Create S3 bucket for CloudFormation templates (if it doesn't exist)
BUCKET_NAME="flask-ml-api-templates-$(date +%s)"
print_status "Creating S3 bucket for CloudFormation templates: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Upload CloudFormation template to S3
print_status "Uploading CloudFormation template to S3..."
aws s3 cp cloudformation-template.yaml s3://$BUCKET_NAME/ --region $REGION

# Deploy CloudFormation stack
print_status "Deploying CloudFormation stack..."
aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-url https://s3.amazonaws.com/$BUCKET_NAME/cloudformation-template.yaml \
    --parameters ParameterKey=KeyPairName,ParameterValue=$KEY_PAIR_NAME \
    --capabilities CAPABILITY_IAM \
    --region $REGION

print_status "Waiting for stack creation to complete..."
aws cloudformation wait stack-create-complete \
    --stack-name $STACK_NAME \
    --region $REGION

# Get stack outputs
print_status "Getting stack outputs..."
STACK_OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs')

# Extract values
INSTANCE_ID=$(echo $STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="InstanceId") | .OutputValue')
PUBLIC_IP=$(echo $STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="PublicIP") | .OutputValue')
PUBLIC_DNS=$(echo $STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="PublicDNS") | .OutputValue')
FLASK_URL=$(echo $STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="FlaskAppURL") | .OutputValue')

print_status "Deployment completed successfully!"
echo ""
echo "=== Deployment Summary ==="
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "Public DNS: $PUBLIC_DNS"
echo "Flask App URL: $FLASK_URL"
echo ""

print_status "Waiting for instance to be ready..."
aws ec2 wait instance-status-ok --instance-ids $INSTANCE_ID --region $REGION

print_status "Instance is ready! You can now:"
echo "1. SSH into the instance: ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ubuntu@$PUBLIC_IP"
echo "2. Access the Flask app: $FLASK_URL"
echo "3. Check the health endpoint: $FLASK_URL/health"
echo ""

print_warning "Remember to:"
echo "- Update your frontend application to use the new API URL"
echo "- Configure SSL certificates if needed"
echo "- Set up monitoring and alerting"
echo "- Consider setting up auto-scaling for production use"

# Save deployment info to file
cat > deployment-info.txt << EOF
Deployment completed: $(date)
Stack Name: $STACK_NAME
Instance ID: $INSTANCE_ID
Public IP: $PUBLIC_IP
Public DNS: $PUBLIC_DNS
Flask App URL: $FLASK_URL
SSH Command: ssh -i ~/.ssh/$KEY_PAIR_NAME.pem ubuntu@$PUBLIC_IP
EOF

print_status "Deployment information saved to deployment-info.txt"
