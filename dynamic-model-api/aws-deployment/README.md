# AWS Deployment Guide for Flask ML API

This guide will help you deploy your Flask ML API to AWS using a g4dn.xlarge spot instance with GPU support.

## Prerequisites

1. **AWS CLI** installed and configured
2. **AWS Account** with appropriate permissions
3. **EC2 Key Pair** created in your AWS region
4. **jq** installed (for JSON parsing in scripts)

## Quick Start

### 1. Prepare Your Environment

```bash
# Install AWS CLI (if not already installed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure

# Install jq (for JSON parsing)
sudo apt-get install jq  # Ubuntu/Debian
# or
brew install jq  # macOS
```

### 2. Create an EC2 Key Pair

```bash
# Create a new key pair
aws ec2 create-key-pair --key-name flask-ml-api-key2 --query 'KeyMaterial' --output text > flask-ml-api-key2.pem

# Set proper permissions
chmod 400 flask-ml-api-key2.pem
```

### 3. Update Configuration

Edit the `deploy.sh` script and update the following variables:

```bash
KEY_PAIR_NAME="scraply-deployment-key.pem"  # Your key pair name
REGION="us-east-1"                # Your preferred AWS region
```

### 4. Deploy to AWS

```bash
# Make scripts executable
chmod +x deploy.sh cleanup.sh

# Deploy the application
./deploy.sh
```

The deployment will:
- Create a VPC with public subnet
- Launch a g4dn.xlarge spot instance
- Configure security groups for SSH and HTTP access
- Install Docker and NVIDIA runtime
- Set up monitoring with CloudWatch

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Internet      │    │   Load Balancer │    │   EC2 Instance  │
│                 │────│   (Optional)    │────│   g4dn.xlarge   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │   Docker        │
                                              │   Container     │
                                              │   (Flask + GPU) │
                                              └─────────────────┘
```

## Instance Specifications

- **Instance Type**: g4dn.xlarge
- **vCPUs**: 4
- **Memory**: 16 GB
- **GPU**: 1x NVIDIA T4
- **Storage**: 125 GB NVMe SSD
- **Network**: Up to 25 Gbps

## Cost Estimation

- **g4dn.xlarge Spot Instance**: ~$0.50-0.70/hour (varies by region)
- **EBS Storage**: ~$0.10/GB/month
- **Data Transfer**: $0.09/GB (outbound)
- **Estimated Monthly Cost**: $400-600 (24/7 usage)

## Post-Deployment Setup

### 1. SSH into the Instance

```bash
ssh -i flask-ml-api-key.pem ubuntu@<PUBLIC_IP>
```

### 2. Run the Setup Script

```bash
# Copy the setup script to the instance
scp -i flask-ml-api-key.pem setup-instance.sh ubuntu@<PUBLIC_IP>:~/

# SSH into the instance and run setup
ssh -i flask-ml-api-key.pem ubuntu@<PUBLIC_IP>
chmod +x setup-instance.sh
./setup-instance.sh
```

### 3. Deploy Your Application

```bash
# Copy your application files
scp -r -i flask-ml-api-key.pem ../../dynamic-model-api/* ubuntu@<PUBLIC_IP>:/opt/flask-app/

# SSH into the instance and start the application
ssh -i flask-ml-api-key.pem ubuntu@<PUBLIC_IP>
cd /opt/flask-app
./start_app.sh
```

### 4. Verify Deployment

```bash
# Test the health endpoint
curl http://<PUBLIC_IP>:5000/health

# Check GPU availability
python3 test_gpu.py

# Monitor the application
./monitor.sh
```

## Monitoring and Maintenance

### Health Checks

The application includes automatic health checks every 5 minutes:

```bash
# View health check logs
tail -f /opt/flask-app/logs/health.log

# Manual health check
./health_check.sh
```

### Logs

```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f

# System logs
sudo journalctl -u flask-app.service -f
```

### Monitoring

```bash
# System resources
./monitor.sh

# GPU usage
nvidia-smi

# Docker containers
docker ps
```

### Backups

```bash
# Create backup
./backup.sh

# List backups
ls -la /opt/backups/
```

## Troubleshooting

### Common Issues

1. **Instance not starting**
   ```bash
   # Check CloudFormation events
   aws cloudformation describe-stack-events --stack-name flask-ml-api-stack
   ```

2. **GPU not available**
   ```bash
   # Check NVIDIA drivers
   nvidia-smi
   
   # Test Docker GPU access
   sudo docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu20.04 nvidia-smi
   ```

3. **Application not responding**
   ```bash
   # Check container status
   docker ps -a
   
   # Check application logs
   docker-compose -f docker-compose.prod.yml logs
   
   # Restart application
   docker-compose -f docker-compose.prod.yml restart
   ```

4. **High memory usage**
   ```bash
   # Monitor memory usage
   htop
   
   # Check for memory leaks
   docker stats
   ```

### Performance Optimization

1. **Enable GPU monitoring**
   ```bash
   # Install nvtop for GPU monitoring
   sudo apt-get install nvtop
   nvtop
   ```

2. **Optimize Docker settings**
   ```bash
   # Edit Docker daemon configuration
   sudo nano /etc/docker/daemon.json
   
   # Add GPU-specific settings
   {
     "default-runtime": "nvidia",
     "runtimes": {
       "nvidia": {
         "path": "nvidia-container-runtime",
         "runtimeArgs": []
       }
     }
   }
   ```

3. **Set up auto-scaling** (for production)
   - Use AWS Auto Scaling Groups
   - Configure CloudWatch alarms
   - Set up load balancing

## Security Considerations

1. **Update security groups** to restrict access
2. **Enable HTTPS** with SSL certificates
3. **Set up AWS WAF** for DDoS protection
4. **Use AWS Secrets Manager** for sensitive data
5. **Enable CloudTrail** for audit logging

## Cleanup

To remove all AWS resources:

```bash
./cleanup.sh
```

This will delete:
- CloudFormation stack
- EC2 instance
- Security groups
- VPC and subnets
- EBS volumes
- Elastic IP

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review CloudWatch logs
3. Check AWS CloudFormation events
4. Monitor instance metrics in AWS Console

## Cost Optimization

1. **Use Spot Instances** (already configured)
2. **Set up auto-shutdown** during off-hours
3. **Monitor usage** with AWS Cost Explorer
4. **Use Reserved Instances** for predictable workloads
5. **Optimize storage** by using appropriate EBS volume types
