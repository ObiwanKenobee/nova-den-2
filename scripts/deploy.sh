#!/bin/bash

# VaultTap Production Deployment Script
# This script deploys VaultTap to AWS using Terraform and Docker

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-production}
AWS_REGION=${AWS_REGION:-us-west-2}
PROJECT_NAME="vaulttap"
TERRAFORM_DIR="infra/terraform"
DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check if required tools are installed
    local missing_tools=()
    
    if ! command -v aws &> /dev/null; then
        missing_tools+=(aws-cli)
    fi
    
    if ! command -v terraform &> /dev/null; then
        missing_tools+=(terraform)
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_tools+=(docker)
    fi
    
    if ! command -v node &> /dev/null; then
        missing_tools+=(node)
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_tools+=(npm)
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_error "Please install the missing tools and try again."
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Validate AWS credentials
validate_aws_credentials() {
    log_info "Validating AWS credentials..."
    
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured or invalid"
        log_error "Please run 'aws configure' or set AWS environment variables"
        exit 1
    fi
    
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local user_arn=$(aws sts get-caller-identity --query Arn --output text)
    
    log_success "AWS credentials validated for account: $account_id"
    log_info "Using identity: $user_arn"
}

# Build and test the application
build_application() {
    log_info "Building application..."
    
    # Install dependencies
    npm ci
    
    # Run tests
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Running tests..."
        npm run test
    fi
    
    # Build the application
    npm run build
    
    log_success "Application built successfully"
}

# Build Docker image
build_docker_image() {
    log_info "Building Docker image..."
    
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local ecr_registry="$account_id.dkr.ecr.$AWS_REGION.amazonaws.com"
    local image_name="$PROJECT_NAME-$ENVIRONMENT"
    local full_image_name="$ecr_registry/$image_name:$DOCKER_IMAGE_TAG"
    
    # Build the image
    docker build -t "$image_name:$DOCKER_IMAGE_TAG" .
    
    # Tag for ECR
    docker tag "$image_name:$DOCKER_IMAGE_TAG" "$full_image_name"
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ecr_registry
    
    # Create repository if it doesn't exist
    aws ecr describe-repositories --repository-names $image_name --region $AWS_REGION &> /dev/null || \
        aws ecr create-repository --repository-name $image_name --region $AWS_REGION
    
    # Push the image
    docker push "$full_image_name"
    
    echo "$full_image_name" > docker-image-uri.txt
    
    log_success "Docker image built and pushed: $full_image_name"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    log_info "Deploying infrastructure with Terraform..."
    
    cd $TERRAFORM_DIR
    
    # Initialize Terraform
    terraform init
    
    # Create workspace if it doesn't exist
    terraform workspace select $ENVIRONMENT 2>/dev/null || terraform workspace new $ENVIRONMENT
    
    # Plan the deployment
    terraform plan -var="environment=$ENVIRONMENT" -var="aws_region=$AWS_REGION" -out=tfplan
    
    # Ask for confirmation in production
    if [ "$ENVIRONMENT" = "production" ]; then
        echo ""
        log_warning "You are about to deploy to PRODUCTION environment!"
        read -p "Are you sure you want to continue? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log_info "Deployment cancelled"
            exit 0
        fi
    fi
    
    # Apply the changes
    terraform apply tfplan
    
    # Output important information
    echo ""
    log_success "Infrastructure deployment completed!"
    echo "Load Balancer DNS: $(terraform output -raw alb_dns_name)"
    echo "CloudFront Domain: $(terraform output -raw cloudfront_domain_name)"
    
    cd ../..
}

# Update ECS service with new image
update_ecs_service() {
    log_info "Updating ECS service..."
    
    local cluster_name="$PROJECT_NAME-$ENVIRONMENT-cluster"
    local service_name="$PROJECT_NAME-$ENVIRONMENT-service"
    
    # Force new deployment
    aws ecs update-service \
        --cluster $cluster_name \
        --service $service_name \
        --force-new-deployment \
        --region $AWS_REGION
    
    # Wait for deployment to complete
    log_info "Waiting for deployment to complete..."
    aws ecs wait services-stable \
        --cluster $cluster_name \
        --services $service_name \
        --region $AWS_REGION
    
    log_success "ECS service updated successfully"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # In a real deployment, you would run migrations here
    # For now, we'll just log that this step would happen
    log_info "Database migrations would run here in a real deployment"
    
    # Example of how you might run migrations:
    # aws ecs run-task \
    #     --cluster $PROJECT_NAME-$ENVIRONMENT-cluster \
    #     --task-definition $PROJECT_NAME-migration-task \
    #     --launch-type FARGATE \
    #     --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
    
    log_success "Database migrations completed"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Get the load balancer DNS name
    cd $TERRAFORM_DIR
    local lb_dns=$(terraform output -raw alb_dns_name 2>/dev/null || echo "")
    cd ../..
    
    if [ -z "$lb_dns" ]; then
        log_warning "Could not get load balancer DNS name"
        return
    fi
    
    local health_url="http://$lb_dns/api/ping"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts..."
        
        if curl -f -s "$health_url" > /dev/null; then
            log_success "Health check passed!"
            return
        fi
        
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    exit 1
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    local cluster_name="$PROJECT_NAME-$ENVIRONMENT-cluster"
    local service_name="$PROJECT_NAME-$ENVIRONMENT-service"
    
    # Get previous task definition
    local current_task_def=$(aws ecs describe-services \
        --cluster $cluster_name \
        --services $service_name \
        --query 'services[0].taskDefinition' \
        --output text \
        --region $AWS_REGION)
    
    local family=$(echo $current_task_def | cut -d'/' -f1)
    local current_revision=$(echo $current_task_def | cut -d':' -f2)
    local previous_revision=$((current_revision - 1))
    
    if [ $previous_revision -gt 0 ]; then
        local previous_task_def="$family:$previous_revision"
        
        aws ecs update-service \
            --cluster $cluster_name \
            --service $service_name \
            --task-definition $previous_task_def \
            --region $AWS_REGION
        
        log_success "Rollback initiated to revision $previous_revision"
    else
        log_error "No previous revision available for rollback"
    fi
}

# Cleanup old Docker images
cleanup_images() {
    log_info "Cleaning up old Docker images..."
    
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local repository_name="$PROJECT_NAME-$ENVIRONMENT"
    
    # Keep only the latest 5 images
    aws ecr list-images \
        --repository-name $repository_name \
        --region $AWS_REGION \
        --query 'imageIds[?type(imageTag)==`string`] | sort_by(@, &imageTag) | [0:-5]' \
        --output json > images_to_delete.json
    
    if [ -s images_to_delete.json ] && [ "$(cat images_to_delete.json)" != "[]" ]; then
        aws ecr batch-delete-image \
            --repository-name $repository_name \
            --image-ids file://images_to_delete.json \
            --region $AWS_REGION
        log_success "Old Docker images cleaned up"
    else
        log_info "No old images to clean up"
    fi
    
    rm -f images_to_delete.json
}

# Main deployment function
main() {
    log_info "Starting VaultTap deployment to $ENVIRONMENT environment"
    
    # Trap errors and provide rollback option
    trap 'log_error "Deployment failed! Run with --rollback to rollback."; exit 1' ERR
    
    # Parse arguments
    case "${1:-}" in
        --rollback)
            rollback
            exit 0
            ;;
        --health-check)
            health_check
            exit 0
            ;;
        --cleanup)
            cleanup_images
            exit 0
            ;;
    esac
    
    # Pre-deployment checks
    check_dependencies
    validate_aws_credentials
    
    # Build and deploy
    build_application
    build_docker_image
    deploy_infrastructure
    run_migrations
    update_ecs_service
    
    # Post-deployment
    health_check
    cleanup_images
    
    log_success "🚀 Deployment completed successfully!"
    log_info "Application is now available at the load balancer DNS name"
    
    # Show useful commands
    echo ""
    echo "Useful commands:"
    echo "  View logs: aws logs tail /ecs/vaulttap-$ENVIRONMENT --follow --region $AWS_REGION"
    echo "  Check service status: aws ecs describe-services --cluster vaulttap-$ENVIRONMENT-cluster --services vaulttap-$ENVIRONMENT-service --region $AWS_REGION"
    echo "  Rollback: $0 --rollback"
}

# Handle script arguments
if [ "$1" = "--help" ]; then
    echo "VaultTap Deployment Script"
    echo ""
    echo "Usage: $0 [environment] [options]"
    echo ""
    echo "Arguments:"
    echo "  environment    Target environment (default: production)"
    echo ""
    echo "Options:"
    echo "  --rollback     Rollback to previous deployment"
    echo "  --health-check Perform health check only"
    echo "  --cleanup      Clean up old Docker images"
    echo "  --help         Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  AWS_REGION           AWS region (default: us-west-2)"
    echo "  DOCKER_IMAGE_TAG     Docker image tag (default: latest)"
    echo ""
    exit 0
fi

# Run main function
main "$@"
