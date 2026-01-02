# .gitignore Recommendations

## Security Notice

⚠️ **IMPORTANT**: The `deply/settings.txt` file contains sensitive AWS credentials and should NEVER be committed to version control.

## Recommended .gitignore Entries

Add the following lines to your `.gitignore` file to protect sensitive information:

```gitignore
# Deployment credentials (CRITICAL - DO NOT COMMIT)
deply/settings.txt

# IDE and Editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Node modules (if using npm for development)
node_modules/

# Log files
*.log
npm-debug.log*

# Environment files
.env
.env.local
.env.*.local

# Temporary files
*.tmp
*.temp
```

## Manual Steps Required

Since the `.gitignore` file is currently blocked by `.codeassistantignore`, you need to manually add these entries:

1. Open `.gitignore` in your editor
2. Add the line: `deply/settings.txt`
3. Save the file
4. Verify with: `git status` (settings.txt should not appear)

## Verify Protection

After updating `.gitignore`, verify that credentials are protected:

```bash
# Check if settings.txt is ignored
git check-ignore deply/settings.txt

# Should output: deply/settings.txt
```

## If Credentials Were Already Committed

If `deply/settings.txt` was previously committed to git, you need to remove it from history:

```bash
# Remove from git tracking (keeps local file)
git rm --cached deply/settings.txt

# Commit the removal
git commit -m "Remove credentials from version control"

# Push changes
git push
```

⚠️ **Note**: If credentials were pushed to a remote repository, they should be considered compromised. Generate new credentials and update `deply/settings.txt`.

## Alternative: Environment Variables

For enhanced security, consider using environment variables instead of the settings file:

```bash
# Set environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_BUCKET_NAME="capacity-calculator"
export AWS_REGION="ru-central1"

# Run deployment
./deploy.sh
```

The deployment script will automatically use environment variables if they are set.