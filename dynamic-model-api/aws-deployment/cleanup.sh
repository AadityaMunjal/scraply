#!/bin/bash

# AWS Cleanup Script for Flask ML API
# This script removes all AWS resources created by the deployment

set -e

# Configuration
STACK_NAME="flask-ml-api-stack"
REGION="us-east-1"

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

print_warning "This script will delete all AWS resources created by the Flask ML API deployment."
print_warning "This action cannot be undone!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Cleanup cancelled."
    exit 0
fi

print_status "Starting cleanup of AWS resources..."

# Check if stack exists
if ! aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
    print_warning "Stack '$STACK_NAME' does not exist. Nothing to clean up."
    exit 0
fi

# Get stack outputs before deletion
print_status "Getting stack outputs..."
STACK_OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs')

# Extract values
INSTANCE_ID=$(echo $STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="InstanceId") | .OutputValue')
PUBLIC_IP=$(echo $STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="PublicIP") | .OutputValue')

print_status "Found resources:"
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"

# Delete CloudFormation stack
print_status "Deleting CloudFormation stack..."
aws cloudformation delete-stack --stack-name $STACK_NAME --region $REGION

print_status "Waiting for stack deletion to complete..."
aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME --region $REGION

print_status "Stack deletion completed successfully!"

# Clean up any orphaned resources (optional)
print_status "Checking for orphaned resources..."

# Check for orphaned EBS volumes
ORPHANED_VOLUMES=$(aws ec2 describe-volumes \
    --filters "Name=attachment.instance-id,Values=$INSTANCE_ID" \
    --region $REGION \
    --query 'Volumes[?Attachments[0].State==`detached`].VolumeId' \
    --output text)

if [ ! -z "$ORPHANED_VOLUMES" ]; then
    print_warning "Found orphaned EBS volumes: $ORPHANED_VOLUMES"
    read -p "Delete orphaned EBS volumes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for volume in $ORPHANED_VOLUMES; do
            print_status "Deleting volume: $volume"
            aws ec2 delete-volume --volume-id $volume --region $REGION
        done
    fi
fi

# Check for orphaned security groups
ORPHANED_SGS=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=*$STACK_NAME*" \
    --region $REGION \
    --query 'SecurityGroups[?length(Instances)==`0`].GroupId' \
    --output text)

if [ ! -z "$ORPHANED_SGS" ]; then
    print_warning "Found orphaned security groups: $ORPHANED_SGS"
    read -p "Delete orphaned security groups? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for sg in $ORPHANED_SGS; do
            print_status "Deleting security group: $sg"
            aws ec2 delete-security-group --group-id $sg --region $REGION
        done
    fi
fi

print_status "Cleanup completed successfully!"
print_status "All AWS resources have been removed."
