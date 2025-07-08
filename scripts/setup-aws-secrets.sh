#!/bin/bash

# VaultTap AWS Secrets Manager Setup Script
# This script creates all required secrets in AWS Secrets Manager for production deployment

set -e

# Configuration
AWS_REGION=${AWS_REGION:-us-west-2}
ENVIRONMENT=${ENVIRONMENT:-production}
SECRET_PREFIX="vaulttap/${ENVIRONMENT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is configured
check_aws_config() {
    log_info "Checking AWS configuration..."
    
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS CLI not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    log_success "AWS configured for account: $account_id"
}

# Generate secure random string
generate_secret() {
    local length=${1:-64}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Create secret in AWS Secrets Manager
create_secret() {
    local secret_name="$1"
    local secret_value="$2"
    local description="$3"
    
    log_info "Creating secret: $secret_name"
    
    # Check if secret already exists
    if aws secretsmanager describe-secret --secret-id "$secret_name" --region "$AWS_REGION" &> /dev/null; then
        log_warning "Secret $secret_name already exists. Updating..."
        aws secretsmanager update-secret \
            --secret-id "$secret_name" \
            --secret-string "$secret_value" \
            --region "$AWS_REGION" > /dev/null
    else
        aws secretsmanager create-secret \
            --name "$secret_name" \
            --description "$description" \
            --secret-string "$secret_value" \
            --region "$AWS_REGION" > /dev/null
    fi
    
    log_success "Secret $secret_name created/updated successfully"
}

# Create JSON secret
create_json_secret() {
    local secret_name="$1"
    local secret_json="$2"
    local description="$3"
    
    log_info "Creating JSON secret: $secret_name"
    
    if aws secretsmanager describe-secret --secret-id "$secret_name" --region "$AWS_REGION" &> /dev/null; then
        log_warning "Secret $secret_name already exists. Updating..."
        aws secretsmanager update-secret \
            --secret-id "$secret_name" \
            --secret-string "$secret_json" \
            --region "$AWS_REGION" > /dev/null
    else
        aws secretsmanager create-secret \
            --name "$secret_name" \
            --description "$description" \
            --secret-string "$secret_json" \
            --region "$AWS_REGION" > /dev/null
    fi
    
    log_success "JSON secret $secret_name created/updated successfully"
}

# Main setup function
setup_secrets() {
    log_info "Setting up AWS Secrets Manager secrets for VaultTap $ENVIRONMENT..."
    
    # Core application secrets
    log_info "Creating core application secrets..."
    
    create_secret \
        "${SECRET_PREFIX}/jwt" \
        "{\"jwt_secret\":\"$(generate_secret 64)\"}" \
        "JWT signing secret for VaultTap authentication"
    
    create_secret \
        "${SECRET_PREFIX}/encryption" \
        "{\"encryption_key\":\"$(generate_secret 32)\"}" \
        "Encryption key for VaultTap data encryption"
    
    # Database secrets
    log_info "Creating database secrets..."
    
    create_secret \
        "${SECRET_PREFIX}/database" \
        "{\"username\":\"vaulttapuser\",\"password\":\"$(generate_secret 32)\",\"host\":\"REPLACE_WITH_RDS_ENDPOINT\",\"port\":\"5432\",\"database\":\"vaulttap\"}" \
        "Database connection credentials for VaultTap"
    
    # Payment provider secrets
    log_info "Creating payment provider secrets..."
    
    # Stripe (placeholder values - replace with actual keys)
    create_secret \
        "${SECRET_PREFIX}/stripe" \
        "{\"secret_key\":\"sk_live_REPLACE_WITH_ACTUAL_STRIPE_SECRET_KEY\",\"publishable_key\":\"pk_live_REPLACE_WITH_ACTUAL_STRIPE_PUBLISHABLE_KEY\",\"webhook_secret\":\"whsec_REPLACE_WITH_ACTUAL_WEBHOOK_SECRET\"}" \
        "Stripe payment processor credentials"
    
    # PayPal (placeholder values - replace with actual keys)
    create_secret \
        "${SECRET_PREFIX}/paypal" \
        "{\"client_id\":\"REPLACE_WITH_ACTUAL_PAYPAL_CLIENT_ID\",\"client_secret\":\"REPLACE_WITH_ACTUAL_PAYPAL_CLIENT_SECRET\"}" \
        "PayPal payment processor credentials"
    
    # Coinbase Commerce (placeholder values)
    create_secret \
        "${SECRET_PREFIX}/coinbase" \
        "{\"api_key\":\"REPLACE_WITH_ACTUAL_COINBASE_API_KEY\",\"webhook_secret\":\"REPLACE_WITH_ACTUAL_COINBASE_WEBHOOK_SECRET\"}" \
        "Coinbase Commerce crypto payment credentials"
    
    # AI service secrets
    log_info "Creating AI service secrets..."
    
    # OpenAI (placeholder values)
    create_secret \
        "${SECRET_PREFIX}/openai" \
        "{\"api_key\":\"sk-REPLACE_WITH_ACTUAL_OPENAI_API_KEY\"}" \
        "OpenAI API credentials for AI services"
    
    # Monitoring and alerting secrets
    log_info "Creating monitoring secrets..."
    
    # Sentry (placeholder values)
    create_secret \
        "${SECRET_PREFIX}/sentry" \
        "{\"dsn\":\"https://REPLACE_WITH_ACTUAL_SENTRY_DSN@sentry.io/PROJECT_ID\"}" \
        "Sentry error tracking credentials"
    
    # DataDog (placeholder values)
    create_secret \
        "${SECRET_PREFIX}/datadog" \
        "{\"api_key\":\"REPLACE_WITH_ACTUAL_DATADOG_API_KEY\"}" \
        "DataDog monitoring credentials"
    
    # New Relic (placeholder values)
    create_secret \
        "${SECRET_PREFIX}/newrelic" \
        "{\"license_key\":\"REPLACE_WITH_ACTUAL_NEWRELIC_LICENSE_KEY\"}" \
        "New Relic monitoring credentials"
    
    # Communication service secrets
    log_info "Creating communication service secrets..."
    
    # Twilio (placeholder values)
    create_secret \
        "${SECRET_PREFIX}/twilio" \
        "{\"account_sid\":\"REPLACE_WITH_ACTUAL_TWILIO_ACCOUNT_SID\",\"auth_token\":\"REPLACE_WITH_ACTUAL_TWILIO_AUTH_TOKEN\"}" \
        "Twilio SMS service credentials"
    
    # SendGrid (placeholder values)
    create_secret \
        "${SECRET_PREFIX}/sendgrid" \
        "{\"api_key\":\"SG.REPLACE_WITH_ACTUAL_SENDGRID_API_KEY\"}" \
        "SendGrid email service credentials"
    
    # Slack (placeholder values)
    create_secret \
        "${SECRET_PREFIX}/slack" \
        "{\"webhook_url\":\"https://hooks.slack.com/services/REPLACE/WITH/ACTUAL_WEBHOOK_URL\"}" \
        "Slack webhook for alerts and notifications"
    
    log_success "All secrets created successfully!"
    
    # Display next steps
    echo ""
    log_info "Next steps:"
    echo "1. Replace placeholder values in the secrets with actual credentials"
    echo "2. Update RDS endpoint in the database secret"
    echo "3. Configure IAM roles for ECS tasks to access these secrets"
    echo "4. Deploy the application using the deployment script"
    echo ""
    echo "To update a secret:"
    echo "aws secretsmanager update-secret --secret-id SECRET_NAME --secret-string 'NEW_VALUE' --region $AWS_REGION"
    echo ""
    echo "To view secrets (for verification):"
    echo "aws secretsmanager list-secrets --region $AWS_REGION --query 'SecretList[?starts_with(Name, \`$SECRET_PREFIX\`)].Name'"
}

# IAM policy creation for ECS task role
create_iam_policy() {
    log_info "Creating IAM policy for ECS task to access secrets..."
    
    local policy_name="VaultTapSecretsAccessPolicy"
    local policy_document='{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "secretsmanager:GetSecretValue"
                ],
                "Resource": [
                    "arn:aws:secretsmanager:'$AWS_REGION':*:secret:'$SECRET_PREFIX'/*"
                ]
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ssm:GetParameter",
                    "ssm:GetParameters",
                    "ssm:GetParametersByPath"
                ],
                "Resource": [
                    "arn:aws:ssm:'$AWS_REGION':*:parameter/'$SECRET_PREFIX'/*"
                ]
            }
        ]
    }'
    
    # Create or update policy
    if aws iam get-policy --policy-arn "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/$policy_name" &> /dev/null; then
        log_warning "Policy $policy_name already exists. Creating new version..."
        aws iam create-policy-version \
            --policy-arn "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/$policy_name" \
            --policy-document "$policy_document" \
            --set-as-default > /dev/null
    else
        aws iam create-policy \
            --policy-name "$policy_name" \
            --policy-document "$policy_document" \
            --description "Policy for VaultTap ECS tasks to access secrets" > /dev/null
    fi
    
    log_success "IAM policy $policy_name created/updated successfully"
    echo "Attach this policy to your ECS task role: arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/$policy_name"
}

# List all created secrets
list_secrets() {
    log_info "Listing all VaultTap secrets..."
    
    aws secretsmanager list-secrets \
        --region "$AWS_REGION" \
        --query "SecretList[?starts_with(Name, \`$SECRET_PREFIX\`)].{Name:Name,Description:Description}" \
        --output table
}

# Cleanup function
cleanup_secrets() {
    log_warning "This will DELETE ALL VaultTap secrets. Are you sure? (yes/no)"
    read -r confirmation
    
    if [[ $confirmation == "yes" ]]; then
        log_info "Deleting all VaultTap secrets..."
        
        aws secretsmanager list-secrets \
            --region "$AWS_REGION" \
            --query "SecretList[?starts_with(Name, \`$SECRET_PREFIX\`)].Name" \
            --output text | while read -r secret_name; do
            
            if [[ -n "$secret_name" ]]; then
                log_info "Deleting secret: $secret_name"
                aws secretsmanager delete-secret \
                    --secret-id "$secret_name" \
                    --force-delete-without-recovery \
                    --region "$AWS_REGION" > /dev/null
                log_success "Deleted: $secret_name"
            fi
        done
        
        log_success "All secrets deleted successfully"
    else
        log_info "Cleanup cancelled"
    fi
}

# Main script logic
case "${1:-setup}" in
    setup)
        check_aws_config
        setup_secrets
        create_iam_policy
        ;;
    list)
        check_aws_config
        list_secrets
        ;;
    cleanup)
        check_aws_config
        cleanup_secrets
        ;;
    policy)
        check_aws_config
        create_iam_policy
        ;;
    --help|help)
        echo "VaultTap AWS Secrets Manager Setup Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  setup     Create all required secrets (default)"
        echo "  list      List all created secrets"
        echo "  cleanup   Delete all VaultTap secrets"
        echo "  policy    Create/update IAM policy for secret access"
        echo "  help      Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  AWS_REGION     AWS region (default: us-west-2)"
        echo "  ENVIRONMENT    Environment name (default: production)"
        exit 0
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
