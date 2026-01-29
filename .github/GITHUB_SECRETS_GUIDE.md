# How to Add GitHub Secrets - Step by Step

This guide shows you exactly where to find and add GitHub Actions secrets.

## Prerequisites

✅ Repository must exist on GitHub
✅ You need **admin or write access** to the repository

## Your Repository

**Repository URL:** https://github.com/sean-ticzon-rp/rp-management-system

## Step-by-Step Instructions

### Step 1: Navigate to Repository Settings

1. Go to: https://github.com/sean-ticzon-rp/rp-management-system
2. Look for the navigation tabs near the top: `Code`, `Issues`, `Pull requests`, `Actions`, `Projects`, `Wiki`, `Security`, **`Settings`**
3. Click the **`Settings`** tab (rightmost tab)

**Important:** If you don't see a `Settings` tab, you don't have admin access. See "What If I Don't Have Access?" section below.

### Step 2: Find Secrets and Variables

1. In the left sidebar, scroll down to the **"Security"** section
2. Look for **"Secrets and variables"** (it should have a key icon 🔑)
3. Click **"Secrets and variables"** to expand it
4. Click **"Actions"** underneath

### Step 3: Add a New Secret

1. You should now see a page titled **"Actions secrets and variables"**
2. You'll see two tabs: **"Secrets"** and **"Variables"**
3. Make sure you're on the **"Secrets"** tab
4. Click the green **"New repository secret"** button (top right)
5. Fill in:
   - **Name**: Secret name in ALL_CAPS (e.g., `STAGING_HOST`)
   - **Secret**: The actual value (will be hidden)
6. Click **"Add secret"**

### Step 4: Repeat for All Required Secrets

For traditional deployment, add these secrets:

#### Staging Secrets
```
STAGING_HOST          → your-staging-server.com
STAGING_USER          → ubuntu (or your SSH username)
STAGING_SSH_KEY       → -----BEGIN OPENSSH PRIVATE KEY----- ...
STAGING_PORT          → 22 (optional, defaults to 22)
STAGING_PATH          → /var/www/staging
```

#### Production Secrets
```
PRODUCTION_HOST       → your-production-server.com
PRODUCTION_USER       → ubuntu (or your SSH username)
PRODUCTION_SSH_KEY    → -----BEGIN OPENSSH PRIVATE KEY----- ...
PRODUCTION_PORT       → 22 (optional, defaults to 22)
PRODUCTION_PATH       → /var/www/production
```

#### Optional Secrets
```
CODECOV_TOKEN         → your-codecov-token (for coverage reports)
```

## Adding Variables (Optional)

Variables are like secrets but visible. Add these if needed:

1. Click the **"Variables"** tab (next to "Secrets")
2. Click **"New repository variable"**
3. Add:
   ```
   STAGING_URL          → https://staging.yourdomain.com
   PRODUCTION_URL       → https://yourdomain.com
   ```

## Setting Up Environments

### Step 1: Navigate to Environments

1. In the left sidebar (while in Settings), scroll down
2. Find **"Environments"** (under "Code and automation" section)
3. Click **"Environments"**

### Step 2: Create Staging Environment

1. Click **"New environment"**
2. Name: `staging`
3. Click **"Configure environment"**
4. (Optional) Add protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches (e.g., only `develop`)
5. Click **"Save protection rules"**

### Step 3: Create Production Environment

1. Click **"New environment"** again
2. Name: `production`
3. Click **"Configure environment"**
4. **Recommended:** Add protection rules:
   - ✅ **Required reviewers** (select team members who must approve)
   - ✅ **Deployment branches** → Only `main` branch
5. Click **"Save protection rules"**

This ensures production deployments require manual approval!

## Generating SSH Keys for Deployment

If you need to generate SSH keys for server access:

### On Your Local Machine:

```bash
# Generate a new SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key

# This creates two files:
# - github_deploy_key (private key) → Add to GitHub secrets
# - github_deploy_key.pub (public key) → Add to server
```

### Add Public Key to Server:

```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/github_deploy_key.pub user@your-server.com

# Or manually add to server's authorized_keys:
cat ~/.ssh/github_deploy_key.pub | ssh user@your-server.com "cat >> ~/.ssh/authorized_keys"
```

### Add Private Key to GitHub Secrets:

```bash
# Display private key (copy this entire output)
cat ~/.ssh/github_deploy_key

# Copy the ENTIRE output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... key content ...
# -----END OPENSSH PRIVATE KEY-----
```

Then:
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `STAGING_SSH_KEY` (or `PRODUCTION_SSH_KEY`)
4. Paste the entire private key (including BEGIN/END lines)
5. Click "Add secret"

## What If I Don't Have Access?

### Option 1: Request Access

Ask the repository owner (`sean-ticzon-rp`) to:
1. Go to repository Settings
2. Click "Collaborators" (or "Manage access")
3. Add you with **"Admin"** or **"Maintain"** role

### Option 2: Ask Owner to Add Secrets

Send them this guide and the list of secrets needed.

### Option 3: Use Docker Locally

You can develop and test everything locally without GitHub Actions:

```bash
# Start local development environment
docker compose --profile development up -d --build

# Access at http://localhost:8000
```

See `LOCAL_SETUP.md` for complete local development instructions.

## Verifying Secrets Were Added

After adding secrets:

1. Go to Settings → Secrets and variables → Actions
2. You should see a list of all added secrets
3. Secret values are hidden (you'll see `***` instead)
4. You can update or delete secrets from here

## Testing the CI/CD Pipeline

Once secrets are configured:

### Test with a Feature Branch

```bash
# Create a feature branch
git checkout -b test-cicd

# Make a small change (e.g., update README)
echo "# Testing CI/CD" >> README.md
git add README.md
git commit -m "test: Verify CI/CD pipeline"

# Push to GitHub
git push origin test-cicd

# Create a pull request on GitHub
# The CI/CD pipeline should run automatically!
```

### Check Pipeline Status

1. Go to repository **"Actions"** tab
2. You should see your workflow running
3. Click on the workflow to see detailed logs
4. Green checkmark ✅ = Success
5. Red X ❌ = Failed (click to see error logs)

## Common Issues

### "Resource not accessible by integration"
- Workflow doesn't have proper permissions
- Go to Settings → Actions → General
- Under "Workflow permissions", select "Read and write permissions"

### "Secret not found"
- Secret name doesn't match what's in the workflow
- Check spelling and capitalization (must be exact match)

### "SSH connection failed"
- Verify SSH key is correct (entire private key copied)
- Verify public key is on server's authorized_keys
- Check server firewall allows SSH connections
- Verify username is correct

### "Permission denied"
- SSH user doesn't have write access to deployment path
- Check file permissions on server
- May need to use sudo or change ownership

## For Docker-Based Deployment

If using Docker deployment workflow (`docker-deploy.yml`):

### GitHub Container Registry (Recommended)

**No secrets needed!** The workflow uses `GITHUB_TOKEN` which is automatically provided.

The workflow will push images to: `ghcr.io/sean-ticzon-rp/rp-management-system`

### Enable GitHub Container Registry

1. Go to repository Settings
2. Scroll to "Packages" section
3. Make sure package visibility is set correctly (public or private)

### Pull Images on Server

```bash
# Login to GitHub Container Registry on your server
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull and run
docker compose pull
docker compose up -d
```

## Next Steps

Once secrets are configured:

1. ✅ Verify all secrets are added
2. ✅ Set up staging and production environments
3. ✅ Configure your servers
4. ✅ Test with a feature branch
5. ✅ Deploy to staging (push to `develop`)
6. ✅ Deploy to production (push to `main`)

## Need Help?

- **Can't find Settings tab?** → You need admin access
- **Secrets not working?** → Check secret names match workflow exactly
- **SSH failing?** → Verify SSH key setup on server
- **Want to develop locally first?** → See `LOCAL_SETUP.md`

## Useful Links

- Repository: https://github.com/sean-ticzon-rp/rp-management-system
- Settings: https://github.com/sean-ticzon-rp/rp-management-system/settings
- Secrets: https://github.com/sean-ticzon-rp/rp-management-system/settings/secrets/actions
- Actions: https://github.com/sean-ticzon-rp/rp-management-system/actions
