# YDB Capacity Calculator - Deployment Plan

## Overview

This document describes the deployment architecture and process for the YDB Capacity Calculator application to Yandex Cloud S3 bucket with static website hosting.

## Deployment Architecture

### Application Type
- **Static Web Application**: Pure HTML, CSS, and JavaScript (no server-side processing)
- **Hosting**: Yandex Cloud S3 bucket with static website hosting enabled
- **Endpoint**: https://capacity-calculator.s3-website.mds.yandex.net

### Files to Deploy

The following files and directories need to be uploaded to the S3 bucket:

#### Required Files (Production)
```
index.html              # Main application entry point
css/
  ├── styles.css        # Application styles
  └── ydb-tech.css      # YDB technical styles
js/
  ├── calculator.js     # Main calculator logic
  └── core.js          # Core calculation functions
images/
  └── cthulhu.png      # Warning illustration
LICENSE                # Apache 2.0 license
README.md              # Project documentation
```

#### Excluded Files (Not for Production)
```
.vscode/               # IDE configuration
.copilot-instructions  # AI assistant instructions
.gitignore            # Git configuration
docs/                 # Development documentation
test/                 # Test files
deply/                # Deployment configuration (contains credentials)
package.json          # Node.js metadata (not needed for static site)
```

## Deployment Strategy

### 1. Authentication & Authorization
- **Method**: AWS S3 API with access keys
- **Credentials Storage**: `deply/settings.txt` (excluded from git)
- **Required Credentials**:
  - `AWS_ACCESS_KEY_ID`: S3 access key
  - `AWS_SECRET_ACCESS_KEY`: S3 secret key
  - `AWS_BUCKET_NAME`: Target bucket name
  - `AWS_REGION`: Yandex Cloud region (ru-central1)

### 2. Deployment Process

#### Manual Deployment Steps
1. Configure AWS CLI with Yandex Cloud S3 credentials
2. Sync local files to S3 bucket
3. Set appropriate content types for files
4. Verify deployment via website endpoint

#### Automated Deployment
A deployment script will:
1. Load credentials from `deply/settings.txt`
2. Upload only production files to S3
3. Set correct MIME types for each file type
4. Preserve directory structure
5. Replace existing files (full sync)
6. Provide deployment status feedback

### 3. File Upload Strategy

#### Content-Type Mapping
```
.html  → text/html
.css   → text/css
.js    → application/javascript
.png   → image/png
.svg   → image/svg+xml
.md    → text/markdown
```

#### Upload Method
- **Sync Operation**: Replace all files in bucket with local versions
- **Preserve Structure**: Maintain directory hierarchy
- **Overwrite**: Replace existing files without prompting

## Implementation Options

### Option 1: Shell Script (Recommended)
**Pros:**
- Simple and lightweight
- Direct AWS CLI usage
- Easy to understand and modify
- No additional dependencies

**Cons:**
- Requires AWS CLI installation
- Platform-specific (bash/zsh)

### Option 2: Node.js Script
**Pros:**
- Cross-platform compatibility
- Can use AWS SDK for JavaScript
- Better error handling
- Can be integrated into npm scripts

**Cons:**
- Requires Node.js and npm packages
- More complex setup

### Recommended: Shell Script with AWS CLI

## Security Considerations

### 1. Credentials Management
- ✅ Store credentials in `deply/settings.txt` (not in git)
- ✅ Add `deply/settings.txt` to `.gitignore`
- ✅ Use environment variables as alternative
- ❌ Never commit credentials to version control

### 2. Access Control
- Bucket should have public read access for website hosting
- Write access restricted to deployment credentials only
- Consider using IAM roles for CI/CD pipelines

### 3. HTTPS
- S3 website endpoint uses HTTPS
- No additional SSL configuration needed

## Deployment Script Requirements

### Functional Requirements
1. **Load Configuration**: Read credentials from `deply/settings.txt`
2. **Validate Files**: Check that required files exist
3. **Upload Files**: Sync production files to S3
4. **Set Metadata**: Apply correct content types
5. **Error Handling**: Report upload failures
6. **Success Confirmation**: Display deployment URL

### Non-Functional Requirements
1. **Idempotent**: Can be run multiple times safely
2. **Fast**: Minimize upload time
3. **Reliable**: Handle network errors gracefully
4. **User-Friendly**: Clear progress and error messages

## Usage Workflow

### Developer Workflow
```bash
# 1. Make changes to application files
# 2. Test locally
# 3. Run deployment script
./deploy.sh

# 4. Verify deployment
open https://capacity-calculator.s3-website.mds.yandex.net
```

### CI/CD Integration (Future)
```yaml
# Example GitHub Actions workflow
- name: Deploy to S3
  run: ./deploy.sh
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Rollback Strategy

### Manual Rollback
1. Keep previous version in separate directory
2. Re-run deployment script with old files
3. Verify rollback successful

### Automated Rollback (Future Enhancement)
- Enable S3 versioning
- Script to restore previous version
- Automated health checks

## Monitoring & Verification

### Post-Deployment Checks
1. ✅ Website loads at endpoint URL
2. ✅ All CSS and JS files load correctly
3. ✅ Images display properly
4. ✅ Calculator functionality works
5. ✅ No console errors in browser

### Health Check Script (Future)
- Automated endpoint testing
- Verify critical functionality
- Alert on deployment failures

## Cost Considerations

### S3 Storage Costs
- **Storage**: ~1-2 MB total (minimal cost)
- **Requests**: GET requests for page loads
- **Data Transfer**: Outbound data transfer

### Optimization
- Enable S3 compression
- Set appropriate cache headers
- Consider CloudFront CDN for global distribution (future)

## Maintenance

### Regular Tasks
1. **Update Dependencies**: Review and update external resources
2. **Security Patches**: Monitor for vulnerabilities
3. **Performance**: Optimize file sizes
4. **Backup**: Maintain local copy of production files

### Deployment Frequency
- **Bug Fixes**: As needed
- **Features**: Weekly/bi-weekly
- **Security Updates**: Immediate

## Appendix

### AWS CLI Installation
```bash
# macOS
brew install awscli

# Linux
pip install awscli

# Verify installation
aws --version
```

### Yandex Cloud S3 Configuration
```bash
# Configure AWS CLI for Yandex Cloud
aws configure --profile yandex
# Enter credentials from deply/settings.txt
# Default region: ru-central1
# Default output format: json
```

### Troubleshooting

#### Issue: Upload Fails
- **Check**: Credentials are correct
- **Check**: Network connectivity
- **Check**: Bucket permissions

#### Issue: Files Not Updating
- **Solution**: Clear browser cache
- **Solution**: Add cache-busting query parameters
- **Solution**: Set appropriate Cache-Control headers

#### Issue: 403 Forbidden
- **Check**: Bucket policy allows public read
- **Check**: Files have correct ACL permissions

## Next Steps

1. ✅ Create deployment script (`deploy.sh`)
2. ✅ Update `.gitignore` to exclude credentials
3. ✅ Test deployment process
4. ✅ Document deployment in README.md
5. ⏳ Consider CI/CD integration
6. ⏳ Add deployment health checks
7. ⏳ Enable S3 versioning for rollback capability