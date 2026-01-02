# How to Deploy

This document describes how to deploy the YDB Capacity Calculator application to Yandex Cloud S3 bucket.

## Overview

The YDB Capacity Calculator is a static web application built using HTML, CSS, and JavaScript. It is hosted in a Yandex Cloud S3 bucket with static website hosting enabled.

- **Website URL**: https://capacity-calculator.s3-website.mds.yandex.net
- **Deployment Method**: Automated shell script using AWS CLI
- **Authentication**: S3 API keys stored in `deply/settings.txt`

## Prerequisites

### 1. Install AWS CLI

The deployment script requires AWS CLI to be installed:

**macOS:**
```bash
brew install awscli
```

**Linux:**
```bash
pip install awscli
```

**Verify installation:**
```bash
aws --version
```

### 2. Configure Credentials

Ensure your S3 credentials are properly configured in `deply/settings.txt`:

```
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_BUCKET_NAME=capacity-calculator
AWS_REGION=ru-central1
```

⚠️ **Security Warning**: Never commit `deply/settings.txt` to version control. See [gitignore-recommendations.md](gitignore-recommendations.md) for details.

## Quick Start

To deploy the application, simply run:

```bash
./deploy.sh
```

The script will:
1. ✓ Validate AWS CLI is installed
2. ✓ Load credentials from `deply/settings.txt`
3. ✓ Verify all required files exist
4. ✓ Upload files to S3 with correct content types
5. ✓ Display the website URL

## Deployment Process Details

### Files Deployed

The following files are uploaded to the S3 bucket:

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

### Content Types

The script automatically sets correct MIME types:
- `.html` → `text/html`
- `.css` → `text/css`
- `.js` → `application/javascript`
- `.png` → `image/png`
- `.md` → `text/markdown`

### File Permissions

All files are uploaded with `public-read` ACL to enable website hosting.

## Verification

After deployment, verify the application:

1. **Open the website**: https://capacity-calculator.s3-website.mds.yandex.net
2. **Check functionality**:
   - Calculator loads without errors
   - All CSS styles are applied
   - JavaScript functions work correctly
   - Images display properly
3. **Browser console**: Verify no errors in developer console

## Troubleshooting

### Deployment Fails

**Error: AWS CLI not found**
```bash
# Install AWS CLI (see Prerequisites)
brew install awscli  # macOS
pip install awscli   # Linux
```

**Error: Settings file not found**
```bash
# Verify settings file exists
ls -la deply/settings.txt

# Check file contents (without displaying credentials)
head -n 1 deply/settings.txt
```

**Error: Upload failed**
- Verify credentials are correct
- Check network connectivity
- Ensure bucket exists and you have write permissions

### Website Not Loading

**403 Forbidden Error**
- Verify bucket has public read access
- Check file ACLs are set to `public-read`

**404 Not Found**
- Verify files were uploaded successfully
- Check bucket name in URL matches settings

**Styles/Scripts Not Loading**
- Clear browser cache
- Verify content types are set correctly
- Check browser console for specific errors

## Advanced Usage

### Using Environment Variables

Instead of `deply/settings.txt`, you can use environment variables:

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_BUCKET_NAME="capacity-calculator"
export AWS_REGION="ru-central1"

./deploy.sh
```

### Dry Run (Testing)

To test the deployment without actually uploading:

```bash
# Add --dryrun flag to AWS commands in deploy.sh
# (requires manual script modification)
```

### Deploy Specific Files

To deploy only specific files, modify the `files` array in `deploy.sh`:

```bash
# Edit deploy.sh, line ~130
local files=(
    "index.html"
    "css/styles.css"
    # ... add or remove files as needed
)
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to S3

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install AWS CLI
        run: pip install awscli
      
      - name: Deploy to S3
        run: ./deploy.sh
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_BUCKET_NAME: capacity-calculator
          AWS_REGION: ru-central1
```

## Security Best Practices

1. ✅ **Never commit credentials** to version control
2. ✅ **Use `.gitignore`** to exclude `deply/settings.txt`
3. ✅ **Rotate credentials** regularly
4. ✅ **Use IAM roles** in CI/CD pipelines instead of access keys
5. ✅ **Limit permissions** to only what's needed (S3 write access)

See [gitignore-recommendations.md](gitignore-recommendations.md) for detailed security guidelines.

## Related Documentation

- [Deployment Plan](deployment-plan.md) - Detailed architecture and strategy
- [GitIgnore Recommendations](gitignore-recommendations.md) - Security guidelines
- [README.md](../README.md) - Project overview

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the deployment plan document
3. Verify all prerequisites are met
4. Check AWS CLI and S3 bucket configuration