# AWS Deployment Script for Flask ML API (PowerShell)
# This script deploys the application to AWS using CloudFormation

param(
    [string]$StackName = "flask-ml-api-stack",
    [string]$Region = "us-east-1",
    [string]$KeyPairName = "your-key-pair-name"  # Replace with your actual key pair name
)

# Function to write colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if AWS CLI is installed
try {
    aws --version | Out-Null
} catch {
    Write-Error "AWS CLI is not installed. Please install it first."
    exit 1
}

# Check if AWS credentials are configured
try {
    aws sts get-caller-identity | Out-Null
} catch {
    Write-Error "AWS credentials are not configured. Please run 'aws configure' first."
    exit 1
}

# Check if key pair exists
try {
    aws ec2 describe-key-pairs --key-names $KeyPairName --region $Region | Out-Null
} catch {
    Write-Error "Key pair '$KeyPairName' does not exist in region '$Region'."
    Write-Warning "Please create a key pair first or update the KeyPairName parameter."
    exit 1
}

Write-Status "Starting deployment of Flask ML API to AWS..."

# Create S3 bucket for CloudFormation templates
$BucketName = "flask-ml-api-templates-$(Get-Date -Format 'yyyyMMddHHmmss')"
Write-Status "Creating S3 bucket for CloudFormation templates: $BucketName"
aws s3 mb "s3://$BucketName" --region $Region

# Upload CloudFormation template to S3
Write-Status "Uploading CloudFormation template to S3..."
aws s3 cp cloudformation-template.yaml "s3://$BucketName/" --region $Region

# Deploy CloudFormation stack
Write-Status "Deploying CloudFormation stack..."
aws cloudformation create-stack `
    --stack-name $StackName `
    --template-url "https://s3.amazonaws.com/$BucketName/cloudformation-template.yaml" `
    --parameters ParameterKey=KeyPairName,ParameterValue=$KeyPairName `
    --capabilities CAPABILITY_IAM `
    --region $Region

Write-Status "Waiting for stack creation to complete..."
aws cloudformation wait stack-create-complete --stack-name $StackName --region $Region

# Get stack outputs
Write-Status "Getting stack outputs..."
$StackOutputs = aws cloudformation describe-stacks --stack-name $StackName --region $Region --query 'Stacks[0].Outputs' | ConvertFrom-Json

# Extract values
$InstanceId = ($StackOutputs | Where-Object { $_.OutputKey -eq "InstanceId" }).OutputValue
$PublicIP = ($StackOutputs | Where-Object { $_.OutputKey -eq "PublicIP" }).OutputValue
$PublicDNS = ($StackOutputs | Where-Object { $_.OutputKey -eq "PublicDNS" }).OutputValue
$FlaskURL = ($StackOutputs | Where-Object { $_.OutputKey -eq "FlaskAppURL" }).OutputValue

Write-Status "Deployment completed successfully!"
Write-Host ""
Write-Host "=== Deployment Summary ===" -ForegroundColor Cyan
Write-Host "Instance ID: $InstanceId"
Write-Host "Public IP: $PublicIP"
Write-Host "Public DNS: $PublicDNS"
Write-Host "Flask App URL: $FlaskURL"
Write-Host ""

Write-Status "Waiting for instance to be ready..."
aws ec2 wait instance-status-ok --instance-ids $InstanceId --region $Region

Write-Status "Instance is ready! You can now:"
Write-Host "1. SSH into the instance: ssh -i ~/.ssh/$KeyPairName.pem ubuntu@$PublicIP"
Write-Host "2. Access the Flask app: $FlaskURL"
Write-Host "3. Check the health endpoint: $FlaskURL/health"
Write-Host ""

Write-Warning "Remember to:"
Write-Host "- Update your frontend application to use the new API URL"
Write-Host "- Configure SSL certificates if needed"
Write-Host "- Set up monitoring and alerting"
Write-Host "- Consider setting up auto-scaling for production use"

# Save deployment info to file
$DeploymentInfo = @"
Deployment completed: $(Get-Date)
Stack Name: $StackName
Instance ID: $InstanceId
Public IP: $PublicIP
Public DNS: $PublicDNS
Flask App URL: $FlaskURL
SSH Command: ssh -i ~/.ssh/$KeyPairName.pem ubuntu@$PublicIP
"@

$DeploymentInfo | Out-File -FilePath "deployment-info.txt" -Encoding UTF8

Write-Status "Deployment information saved to deployment-info.txt"
