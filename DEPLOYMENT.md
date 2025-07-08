# VaultTap Production Deployment Guide

## 🎯 Optimal AWS Services for 100% Success

This guide uses the **most reliable AWS services** for guaranteed production deployment:

### 🏗️ **Core Infrastructure**

- **ECS Fargate** - Fully managed containers (no EC2 management)
- **RDS PostgreSQL** - Multi-AZ for high availability
- **ElastiCache Redis** - Managed Redis cluster
- **Application Load Balancer** - High availability load balancing
- **CloudFront** - Global CDN for performance

### 🔐 **Security & Secrets**

- **AWS Secrets Manager** - Secure credential storage
- **AWS WAF** - Web application firewall
- **AWS Shield** - DDoS protection
- **AWS Certificate Manager** - SSL/TLS certificates

### 📊 **Monitoring & Logging**

- **CloudWatch** - Comprehensive monitoring
- **X-Ray** - Distributed tracing
- **CloudTrail** - Audit logging

## 🚀 **Quick Start Deployment**

### **Prerequisites**

```bash
# Required tools
- AWS CLI v2
- Terraform >= 1.6
- Docker
- Node.js 18+

# AWS Account with sufficient permissions
- AdministratorAccess (or custom policy)
- Service limits increased if needed
```

### **Step 1: Environment Setup**

```bash
# Clone and setup
git clone https://github.com/vaulttap/megastructure.git
cd megastructure

# Install dependencies
npm install

# Configure AWS CLI
aws configure
# Enter your Access Key ID, Secret Access Key, Region (us-west-2)
```

### **Step 2: Create AWS Secrets**

```bash
# Setup all production secrets
chmod +x scripts/setup-aws-secrets.sh
./scripts/setup-aws-secrets.sh setup

# This creates:
# - JWT secrets
# - Database credentials
# - Payment provider keys (placeholders)
# - AI service keys (placeholders)
# - Monitoring service keys (placeholders)
```

### **Step 3: Update Secrets with Real Values**

```bash
# Update Stripe credentials
aws secretsmanager update-secret \
  --secret-id "vaulttap/production/stripe" \
  --secret-string '{"secret_key":"sk_live_YOUR_ACTUAL_KEY","publishable_key":"pk_live_YOUR_ACTUAL_KEY","webhook_secret":"whsec_YOUR_ACTUAL_SECRET"}' \
  --region us-west-2

# Update other payment providers similarly
# See DEPLOYMENT.md for complete list
```

### **Step 4: Deploy Infrastructure**

```bash
# Initialize Terraform
cd infra/terraform
terraform init

# Create production workspace
terraform workspace new production

# Plan deployment (review carefully)
terraform plan -var-file="terraform.tfvars.production"

# Deploy (will take 15-20 minutes)
terraform apply -var-file="terraform.tfvars.production" -auto-approve
```

### **Step 5: Deploy Application**

```bash
# Return to project root
cd ../..

# Build and deploy application
./scripts/deploy.sh production

# Monitor deployment
aws ecs describe-services \
  --cluster vaulttap-production-cluster \
  --services vaulttap-production-service \
  --region us-west-2
```

### **Step 6: Verify Deployment**

```bash
# Get application URL
ALB_DNS=$(terraform output -raw alb_dns_name)
echo "Application URL: https://$ALB_DNS"

# Health check
curl -f "https://$ALB_DNS/health"

# Admin access
echo "Admin Panel: https://$ALB_DNS/admin/login"
echo "Email: admin@vaulttap.com"
echo "Password: VaultTap2024!"
```

## 🔧 **Configuration Details**

### **Environment Files Used**

1. **`.env.local`** - Local development with Docker Compose
2. **`.env.production`** - Production with AWS services
3. **`terraform.tfvars.production`** - Infrastructure configuration

### **AWS Services Deployed**

| Service               | Purpose            | Configuration                          |
| --------------------- | ------------------ | -------------------------------------- |
| **ECS Fargate**       | Container hosting  | 3 instances, auto-scaling              |
| **RDS PostgreSQL**    | Database           | Multi-AZ, encrypted, automated backups |
| **ElastiCache Redis** | Caching            | Cluster mode, encrypted                |
| **ALB**               | Load balancing     | HTTPS, health checks                   |
| **CloudFront**        | CDN                | Global distribution                    |
| **Secrets Manager**   | Credential storage | Encrypted, auto-rotation               |
| **S3**                | File storage       | Versioned, lifecycle policies          |
| **CloudWatch**        | Monitoring         | Logs, metrics, alarms                  |

### **Security Configuration**

- **TLS 1.2+ only**
- **WAF with rate limiting**
- **Security groups with least privilege**
- **Encryption at rest and in transit**
- **Secrets stored in AWS Secrets Manager**
- **Regular security scanning**

## 🔐 **Required Secrets Configuration**

Update these secrets in AWS Secrets Manager:

### **Payment Providers**

```bash
# Stripe (Live)
aws secretsmanager update-secret \
  --secret-id "vaulttap/production/stripe" \
  --secret-string '{"secret_key":"sk_live_...","publishable_key":"pk_live_...","webhook_secret":"whsec_..."}'

# PayPal (Live)
aws secretsmanager update-secret \
  --secret-id "vaulttap/production/paypal" \
  --secret-string '{"client_id":"YOUR_PAYPAL_CLIENT_ID","client_secret":"YOUR_PAYPAL_CLIENT_SECRET"}'
```

### **AI Services**

```bash
# OpenAI
aws secretsmanager update-secret \
  --secret-id "vaulttap/production/openai" \
  --secret-string '{"api_key":"sk-YOUR_OPENAI_API_KEY"}'
```

### **Monitoring**

```bash
# Sentry
aws secretsmanager update-secret \
  --secret-id "vaulttap/production/sentry" \
  --secret-string '{"dsn":"https://YOUR_SENTRY_DSN@sentry.io/PROJECT_ID"}'

# DataDog
aws secretsmanager update-secret \
  --secret-id "vaulttap/production/datadog" \
  --secret-string '{"api_key":"YOUR_DATADOG_API_KEY"}'
```

## 📊 **Post-Deployment Setup**

### **1. DNS Configuration**

```bash
# Point your domain to the CloudFront distribution
CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain_name)
echo "Point vaulttap.com CNAME to: $CLOUDFRONT_DOMAIN"
```

### **2. SSL Certificate**

```bash
# Certificate is automatically created via ACM
# Verify certificate validation
aws acm list-certificates --region us-west-2
```

### **3. Monitoring Setup**

```bash
# Access monitoring dashboards
echo "CloudWatch: https://console.aws.amazon.com/cloudwatch/"
echo "X-Ray: https://console.aws.amazon.com/xray/"
```

### **4. Database Migration**

```bash
# Run initial database setup
aws ecs run-task \
  --cluster vaulttap-production-cluster \
  --task-definition vaulttap-production-task \
  --overrides '{"containerOverrides":[{"name":"vaulttap","command":["npm","run","db:migrate"]}]}'
```

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. ECS Service Failed to Start**

```bash
# Check service events
aws ecs describe-services \
  --cluster vaulttap-production-cluster \
  --services vaulttap-production-service

# Check task logs
aws logs filter-log-events \
  --log-group-name /ecs/vaulttap-production \
  --start-time $(date -d '1 hour ago' +%s)000
```

#### **2. Database Connection Issues**

```bash
# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier vaulttap-production-db

# Check security groups
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=vaulttap-production-rds-sg"
```

#### **3. Secrets Access Issues**

```bash
# Test secret access
aws secretsmanager get-secret-value \
  --secret-id "vaulttap/production/jwt" \
  --region us-west-2

# Check IAM permissions
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::ACCOUNT:role/vaulttap-ecs-task-role \
  --action-names secretsmanager:GetSecretValue \
  --resource-arns arn:aws:secretsmanager:us-west-2:ACCOUNT:secret:vaulttap/production/*
```

#### **4. Load Balancer Health Check Failures**

```bash
# Check target health
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups \
    --names vaulttap-production-tg \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text)

# Test health endpoint directly
ALB_DNS=$(terraform output -raw alb_dns_name)
curl -v "http://$ALB_DNS/health"
```

## 📈 **Scaling & Optimization**

### **Auto Scaling Configuration**

```bash
# Current auto-scaling settings:
# - Min instances: 3
# - Max instances: 20
# - CPU target: 70%
# - Memory target: 80%

# Monitor scaling events
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id service/vaulttap-production-cluster/vaulttap-production-service
```

### **Performance Monitoring**

```bash
# Key metrics to monitor:
# - Response time < 500ms
# - Error rate < 1%
# - CPU utilization < 70%
# - Memory utilization < 80%
# - Database connections < 80% of max
```

## 🔄 **Backup & Recovery**

### **Automated Backups**

- **RDS**: 30-day retention, daily backups
- **S3**: Versioning enabled, lifecycle policies
- **Secrets**: Cross-region replication

### **Disaster Recovery**

```bash
# RDS Point-in-time recovery
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier vaulttap-production-db \
  --target-db-instance-identifier vaulttap-recovery-db \
  --restore-time 2024-01-01T12:00:00Z

# Infrastructure recreation
terraform plan -destroy  # Review what would be destroyed
terraform apply -var-file="terraform.tfvars.production"  # Recreate
```

## 📞 **Support & Maintenance**

### **Regular Maintenance Tasks**

```bash
# Weekly health check
./scripts/health-check.sh production

# Monthly cost review
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-02-01 \
  --granularity MONTHLY \
  --metrics BlendedCost

# Security updates
aws ssm get-patch-baseline \
  --baseline-id pb-123456789
```

### **Emergency Procedures**

```bash
# Emergency rollback
./scripts/deploy.sh production --rollback

# Scale up for high traffic
aws application-autoscaling put-scaling-policy \
  --policy-name vaulttap-scale-up \
  --service-namespace ecs \
  --resource-id service/vaulttap-production-cluster/vaulttap-production-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling
```

---

## ✅ **Deployment Checklist**

- [ ] AWS CLI configured with appropriate permissions
- [ ] All secrets created and updated with real values
- [ ] Terraform plan reviewed and approved
- [ ] Infrastructure deployed successfully
- [ ] Application deployed and health checks passing
- [ ] DNS configured and SSL certificate valid
- [ ] Monitoring and alerting configured
- [ ] Backup verification completed
- [ ] Security scan passed
- [ ] Performance test completed
- [ ] Documentation updated

**🎉 Your VaultTap production deployment is complete and ready for global scale!**
