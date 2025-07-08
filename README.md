# VaultTap Megastructure - Production Platform

[![CI/CD Pipeline](https://github.com/vaulttap/megastructure/workflows/VaultTap%20CI/CD%20Pipeline/badge.svg)](https://github.com/vaulttap/megastructure/actions)
[![Security Scan](https://github.com/vaulttap/megastructure/workflows/Security%20Scan/badge.svg)](https://github.com/vaulttap/megastructure/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

VaultTap is a production-ready, sovereign mesh finance platform combining Bluetooth Low Energy (BLE) networking, AI-powered governance, and zero-knowledge cryptography for humanitarian and diaspora communities worldwide.

## 🌟 Key Features

### 🔐 Admin Authentication & Security

- **Multi-role admin system** (super_admin, admin, ops_manager)
- **JWT-based authentication** with secure token management
- **Permission-based access control** for RevOps dashboard
- **Rate limiting** and security headers for production
- **Audit logging** for all admin actions

### 💳 Global Payment System

- **Multiple payment methods**: Stripe, PayPal, Crypto (BTC/ETH/USDC), Bank transfers, Mobile money
- **Enterprise subscription management** with automated billing
- **Global payment method detection** by country/region
- **Real-time payment processing** with comprehensive error handling
- **PCI-compliant** payment handling

### 🏢 Enterprise Features

- **Tier-based access control** (Individual, Community, Enterprise)
- **Feature gating** based on subscription status
- **White-label deployment** options
- **API rate limiting** per subscription tier
- **Advanced analytics** and reporting

### 🌐 Production Infrastructure

- **AWS deployment** with Terraform Infrastructure as Code
- **Docker containerization** with multi-stage builds
- **Kubernetes support** for alternative deployment
- **Auto-scaling** ECS services with load balancing
- **CloudFront CDN** for global content delivery
- **RDS PostgreSQL** with automated backups
- **ElastiCache Redis** for session management

### 📊 Monitoring & Observability

- **Prometheus metrics** collection
- **Grafana dashboards** for visualization
- **ELK stack** for centralized logging
- **Health checks** and readiness probes
- **Alert management** with multiple notification channels
- **Performance monitoring** and request tracing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- AWS CLI configured
- Terraform 1.6+

### Local Development

```bash
# Clone the repository
git clone https://github.com/vaulttap/megastructure.git
cd megastructure

# Install dependencies
npm install

# Start development environment
docker-compose up -d  # Start databases
npm run dev          # Start development server

# Access the application
# Frontend: http://localhost:5173
# API: http://localhost:3000
# Admin Panel: http://localhost:3000/admin/login
```

### Admin Access (Development)

- **URL**: http://localhost:3000/admin/login
- **Email**: admin@vaulttap.com
- **Password**: VaultTap2024!

### Production Deployment

```bash
# Build and deploy to AWS
npm run deploy:production

# Or use the deployment script
./scripts/deploy.sh production
```

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                   CloudFront CDN                    │
└─────────���───────┬───────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────┐
│              Application Load Balancer              │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────┐
│                ECS Fargate Cluster                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  VaultTap   │ │  VaultTap   │ │  VaultTap   │   │
│  │ Instance 1  │ │ Instance 2  │ │ Instance 3  │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└───────────────────────────────���─────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
┌────────┴────────┐ ┌──────┴──────┐
│   RDS PostgreSQL│ │ElastiCache  │
│   (Multi-AZ)    │ │   Redis     │
└─────────────────┘ └─────────────┘
```

### Tech Stack

- **Backend**: Node.js, TypeScript, Express
- **Database**: PostgreSQL 15 with Redis for caching
- **Infrastructure**: AWS (ECS, RDS, ElastiCache, CloudFront)
- **Containerization**: Docker with multi-stage builds
- **Monitoring**: Prometheus, Grafana, ELK Stack
- **Security**: JWT, bcrypt, Helmet, rate limiting
- **Payments**: Stripe, PayPal, crypto integrations

## 📁 Project Structure

```
vaulttap-megastructure/
├── client/                    # Frontend React application
│   ├── components/           # Reusable UI components
│   ├── pages/               # Application pages
│   └── hooks/               # Custom React hooks
├── server/                   # Backend Node.js application
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic services
│   ├── middleware/          # Express middleware
│   ├── models/              # Data models
│   └── config/              # Configuration management
├── infra/                    # Infrastructure as Code
│   ├── terraform/           # AWS Terraform modules
│   ├── k8s/                 # Kubernetes manifests
│   ├── nginx/               # Nginx configuration
│   └── monitoring/          # Monitoring configuration
├── scripts/                  # Deployment and utility scripts
├── packages/                 # Shared packages
│   ├── mesh-core/           # BLE mesh networking
│   ├── vault-engine/        # Vault cryptography
│   ├── ai-validators/       # AI governance
│   └── zk-auth/             # Zero-knowledge proofs
└── apps/                     # Additional applications
    ├── mobile-wallet/       # React Native mobile app
    └── admin-console/       # Admin management console
```

## 🔧 Configuration

### Environment Variables

Create `.env.production` with the following variables:

```bash
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/vaulttap
REDIS_URL=redis://host:6379

# Security (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-secure-jwt-secret-64-chars-minimum
ENCRYPTION_KEY=your-secure-encryption-key-32-chars

# AWS
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Payments
STRIPE_SECRET_KEY=sk_live_your-stripe-secret
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
```

## 🏥 Health Checks & Monitoring

### Health Endpoints

- `GET /health` - Overall system health
- `GET /health/live` - Liveness probe (K8s)
- `GET /health/ready` - Readiness probe (K8s)
- `GET /metrics` - Prometheus metrics

### Monitoring Stack

1. **Prometheus** - Metrics collection
2. **Grafana** - Visualization dashboards
3. **AlertManager** - Alert routing and notification
4. **ELK Stack** - Centralized logging
5. **CloudWatch** - AWS native monitoring

### Key Metrics

- Request rate and latency
- Error rates by endpoint
- Database connection pool status
- Memory and CPU usage
- Payment processing metrics
- User authentication rates

## 🔐 Security

### Security Features

- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **CORS** configuration for production
- **Input validation** with express-validator
- **SQL injection** prevention with parameterized queries
- **XSS protection** with content security policy
- **JWT token** security with proper expiration

### Security Scanning

```bash
# Run security audit
npm run security:audit

# Snyk vulnerability scanning
npm run security:snyk

# OWASP ZAP penetration testing
docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-full-scan.py -t http://localhost:3000
```

## 🚀 Deployment

### AWS Deployment (Recommended)

1. **Prerequisites**:

   ```bash
   # Install AWS CLI and configure credentials
   aws configure

   # Install Terraform
   brew install terraform  # macOS
   # or download from https://terraform.io
   ```

2. **Deploy Infrastructure**:

   ```bash
   cd infra/terraform
   terraform init
   terraform plan -var="environment=production"
   terraform apply
   ```

3. **Deploy Application**:
   ```bash
   ./scripts/deploy.sh production
   ```

### Kubernetes Deployment (Alternative)

```bash
# Apply Kubernetes manifests
kubectl apply -f infra/k8s/

# Check deployment status
kubectl get pods -n vaulttap-production
kubectl get services -n vaulttap-production
```

### CI/CD Pipeline

The project includes a comprehensive GitHub Actions pipeline:

- **Code Quality**: Linting, type checking, formatting
- **Security**: Vulnerability scanning, SAST analysis
- **Testing**: Unit tests, integration tests, E2E tests
- **Performance**: Load testing with Artillery
- **Deployment**: Automated staging and production deployment
- **Monitoring**: Health checks and rollback capabilities

## 📊 API Documentation

### Authentication Endpoints

- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/verify` - Verify admin token
- `GET /api/admin/profile` - Get admin profile

### Payment Endpoints

- `POST /api/payments/create` - Create payment intent
- `GET /api/payments/methods` - Get supported payment methods
- `POST /api/customers` - Create customer
- `POST /api/subscriptions` - Create subscription

### RevOps Endpoints (Admin Only)

- `GET /api/revops/dashboard` - Get operational dashboard data
- `GET /api/billing/metrics` - Get revenue metrics
- `GET /api/billing/analytics` - Get detailed analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow semantic commit messages
- Ensure security best practices

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.vaulttap.com](https://docs.vaulttap.com)
- **Issues**: [GitHub Issues](https://github.com/vaulttap/megastructure/issues)
- **Email**: support@vaulttap.com
- **Slack**: [VaultTap Community](https://vaulttap.slack.com)

## 🙏 Acknowledgments

- Built for humanitarian organizations and diaspora communities
- Powered by open-source technologies
- Inspired by the need for financial sovereignty
- Dedicated to those building financial inclusion worldwide

---

**VaultTap** - Building financial sovereignty for everyone, everywhere. 🌍
