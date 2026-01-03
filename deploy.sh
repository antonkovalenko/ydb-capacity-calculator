#!/bin/bash

# YDB Capacity Calculator - Deployment Script
# This script deploys the static web application to Yandex Cloud S3 bucket

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SETTINGS_FILE="${SCRIPT_DIR}/deply/settings.txt"

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Print section header
print_header() {
    echo ""
    print_message "$BLUE" "=========================================="
    print_message "$BLUE" "$1"
    print_message "$BLUE" "=========================================="
}

# Check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_message "$RED" "❌ Error: AWS CLI is not installed"
        echo ""
        echo "Please install AWS CLI:"
        echo "  macOS:  brew install awscli"
        echo "  Linux:  pip install awscli"
        echo ""
        exit 1
    fi
    print_message "$GREEN" "✓ AWS CLI is installed"
}

# Load settings from file
load_settings() {
    if [ ! -f "$SETTINGS_FILE" ]; then
        print_message "$RED" "❌ Error: Settings file not found: $SETTINGS_FILE"
        exit 1
    fi
    
    print_message "$GREEN" "✓ Loading settings from $SETTINGS_FILE"
    
    # Source the settings file
    export $(grep -v '^#' "$SETTINGS_FILE" | xargs)
    
    # Validate required variables
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ -z "$AWS_BUCKET_NAME" ] || [ -z "$AWS_REGION" ]; then
        print_message "$RED" "❌ Error: Missing required settings in $SETTINGS_FILE"
        echo "Required: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION"
        exit 1
    fi
    
    # Set default endpoint if not provided
    if [ -z "$AWS_ENDPOINT_URL" ]; then
        export AWS_ENDPOINT_URL="https://s3.mds.yandex.net"
        print_message "$YELLOW" "⚠ AWS_ENDPOINT_URL not set, using default: $AWS_ENDPOINT_URL"
    fi
    
    print_message "$GREEN" "✓ Settings loaded successfully"
    echo "  Bucket: $AWS_BUCKET_NAME"
    echo "  Region: $AWS_REGION"
    echo "  Endpoint: $AWS_ENDPOINT_URL"
}

# Validate required files exist
validate_files() {
    print_header "Validating Files"
    
    local required_files=(
        "index.html"
        "css/styles.css"
        "css/ydb-tech.css"
        "js/calculator.js"
        "js/core.js"
        "images/cthulhu.png"
        "LICENSE"
        "README.md"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ -f "$SCRIPT_DIR/$file" ]; then
            print_message "$GREEN" "✓ $file"
        else
            print_message "$RED" "✗ $file (missing)"
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        print_message "$RED" "❌ Error: Missing required files"
        exit 1
    fi
    
    print_message "$GREEN" "✓ All required files present"
}

# Verify AWS endpoint connectivity
verify_aws_endpoint() {
    print_header "Verifying AWS Endpoint"
    
    # Test connection to S3 endpoint
    print_message "$YELLOW" "Testing connection to $AWS_ENDPOINT_URL..."
    
    if aws s3 ls "s3://$AWS_BUCKET_NAME" --endpoint-url "$AWS_ENDPOINT_URL" --region "$AWS_REGION" &> /dev/null; then
        print_message "$GREEN" "✓ Successfully connected to S3 bucket: $AWS_BUCKET_NAME"
    else
        print_message "$RED" "❌ Error: Cannot connect to S3 bucket"
        echo ""
        echo "Please verify:"
        echo "  1. AWS credentials are correct"
        echo "  2. Bucket name is correct: $AWS_BUCKET_NAME"
        echo "  3. Endpoint URL is correct: $AWS_ENDPOINT_URL"
        echo "  4. You have access to the bucket"
        echo ""
        exit 1
    fi
}

# Upload file with correct content type
upload_file() {
    local file=$1
    local content_type=""
    
    # Determine content type based on file extension
    case "${file##*.}" in
        html) content_type="text/html" ;;
        css) content_type="text/css" ;;
        js) content_type="application/javascript" ;;
        png) content_type="image/png" ;;
        svg) content_type="image/svg+xml" ;;
        md) content_type="text/markdown" ;;
        txt) content_type="text/plain" ;;
        *) content_type="application/octet-stream" ;;
    esac
    
    # Upload file
    aws s3 cp "$SCRIPT_DIR/$file" "s3://$AWS_BUCKET_NAME/$file" \
        --endpoint-url "$AWS_ENDPOINT_URL" \
        --content-type "$content_type" \
        --acl public-read \
        --region "$AWS_REGION" 2>&1
    
    if [ $? -eq 0 ]; then
        print_message "$GREEN" "  ✓ $file"
    else
        print_message "$RED" "  ✗ $file (failed)"
        return 1
    fi
}

# Deploy files to S3
deploy_files() {
    print_header "Deploying Files to S3"
    
    # List of files to deploy
    local files=(
        "index.html"
        "css/styles.css"
        "css/ydb-tech.css"
        "js/calculator.js"
        "js/core.js"
        "images/cthulhu.png"
        "LICENSE"
        "README.md"
    )
    
    local failed_files=()
    
    for file in "${files[@]}"; do
        if ! upload_file "$file"; then
            failed_files+=("$file")
        fi
    done
    
    if [ ${#failed_files[@]} -gt 0 ]; then
        print_message "$RED" "❌ Some files failed to upload:"
        for file in "${failed_files[@]}"; do
            echo "  - $file"
        done
        exit 1
    fi
    
    print_message "$GREEN" "✓ All files uploaded successfully"
}

# Verify deployment
verify_deployment() {
    print_header "Deployment Summary"
    
    local website_url="https://${AWS_BUCKET_NAME}.s3-website.${AWS_REGION}.yandexcloud.net"
    
    print_message "$GREEN" "✅ Deployment completed successfully!"
    echo ""
    echo "Website URL:"
    print_message "$BLUE" "  $website_url"
    echo ""
    echo "Next steps:"
    echo "  1. Open the URL in your browser"
    echo "  2. Verify the calculator loads correctly"
    echo "  3. Test the calculator functionality"
    echo ""
}

# Main deployment process
main() {
    print_header "YDB Capacity Calculator - Deployment"
    
    echo "Starting deployment process..."
    echo ""
    
    # Step 1: Check prerequisites
    check_aws_cli
    
    # Step 2: Load settings
    load_settings
    
    # Step 3: Verify AWS endpoint
    verify_aws_endpoint
    
    # Step 4: Validate files
    validate_files
    
    # Step 5: Deploy files
    deploy_files
    
    # Step 6: Verify deployment
    verify_deployment
}

# Run main function
main