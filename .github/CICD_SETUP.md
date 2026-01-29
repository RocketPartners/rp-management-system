# CI/CD Pipeline Setup Guide

This document explains how to configure and use the CI/CD pipeline for the RP Management System.

## Overview

The CI/CD pipeline consists of 7 jobs:

1. **Code Quality** - Runs linting and code style checks
2. **Security Checks** - Scans for security vulnerabilities
3. **Test Suite** - Runs all tests with coverage reporting
4. **Build Assets** - Builds production frontend assets
5. **Deploy to Staging** - Deploys develop branch to staging
6. **Deploy to Production** - Deploys main branch to production
7. **Database Backup** - Backs up production database after deployment

## Workflow Triggers

- **Push to main** - Runs all jobs including production deployment
- **Push to develop** - Runs all jobs including staging deployment
- **Pull Requests** - Runs quality, security, and test jobs only (no deployment)

## Required GitHub Secrets

To enable deployment, configure these secrets in your GitHub repository:

### Staging Environment
Go to `Settings > Secrets and variables > Actions` and add:

- `STAGING_HOST` - Staging server hostname/IP
- `STAGING_USER` - SSH username for staging server
- `STAGING_SSH_KEY` - Private SSH key for staging server authentication
- `STAGING_PORT` - SSH port (optional, defaults to 22)
- `STAGING_PATH` - Absolute path to application on staging server

### Production Environment
- `PRODUCTION_HOST` - Production server hostname/IP
- `PRODUCTION_USER` - SSH username for production server
- `PRODUCTION_SSH_KEY` - Private SSH key for production server authentication
- `PRODUCTION_PORT` - SSH port (optional, defaults to 22)
- `PRODUCTION_PATH` - Absolute path to application on production server

### Optional
- `CODECOV_TOKEN` - Token for uploading coverage reports to Codecov

## Required GitHub Variables

Go to `Settings > Secrets and variables > Actions > Variables` and add:

- `STAGING_URL` - Staging environment URL (e.g., https://staging.example.com)
- `PRODUCTION_URL` - Production environment URL (e.g., https://example.com)

## Environment Setup in GitHub

1. Go to `Settings > Environments`
2. Create two environments:
   - **staging** - Add protection rules if needed
   - **production** - Enable "Required reviewers" for manual approval before deployment

## Server Prerequisites

Your deployment servers should have:

1. **PHP 8.4+** with required extensions (mbstring, dom, fileinfo, mysql, pdo_mysql)
2. **Composer 2.x**
3. **Node.js 22+** and npm
4. **MySQL 8.0+**
5. **Git** configured with repository access
6. **SSH access** configured with the provided SSH key

### Server Setup Commands

```bash
# Ensure the application directory exists
mkdir -p /path/to/your/app
cd /path/to/your/app

# Clone the repository (first time only)
git clone <your-repo-url> .

# Set proper permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Configure environment file
cp .env.example .env
# Edit .env with production/staging values
nano .env

# Generate application key
php artisan key:generate
```

## Testing the Pipeline

### Test Locally Before Pushing

```bash
# Run code quality checks
vendor/bin/pint --test
npm run format:check
npm run lint
npm run types

# Run security audits
composer audit
npm audit --audit-level=moderate

# Run tests
./vendor/bin/pest --coverage
```

### Manual Deployment Test

You can manually trigger deployments by:

1. Creating a feature branch
2. Merging to `develop` for staging deployment
3. Merging to `main` for production deployment

## Troubleshooting

### Build Failures

**Lint failures**: Run `vendor/bin/pint` and `npm run format` locally to fix

**Test failures**: Check test output in GitHub Actions logs

**Build failures**: Ensure all dependencies are properly listed in composer.json and package.json

### Deployment Failures

**SSH connection issues**: Verify SSH key is correct and has proper permissions on server

**Permission errors**: Check file ownership and permissions on server

**Migration errors**: Check database credentials in server's .env file

**Asset build errors**: Ensure Node.js and npm versions match on server

## Database Backup

The pipeline automatically backs up the production database after successful deployments. To configure Laravel backup:

```bash
composer require spatie/laravel-backup
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"
```

Configure backup settings in `config/backup.php` and add to `.env`:

```env
BACKUP_DISK=backups
BACKUP_NOTIFICATION_EMAIL=your-email@example.com
```

## Notifications

To add Slack/Discord notifications on deployment success/failure:

1. Add webhook URL to GitHub secrets
2. Add notification steps to the workflow

Example Slack notification:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always() 
```

## Coverage Reports

The pipeline uploads coverage reports to Codecov. To enable:

1. Sign up at https://codecov.io
2. Add your repository
3. Copy the upload token
4. Add `CODECOV_TOKEN` to GitHub secrets

## Monitoring Deployments

Monitor deployments in GitHub:
- Go to `Actions` tab to see workflow runs
- Go to `Environments` to see deployment history
- Check individual job logs for detailed information

## Best Practices

1. **Never skip tests** - Always ensure tests pass before merging
2. **Review staging** - Test thoroughly on staging before merging to main
3. **Database migrations** - Test migrations on staging first
4. **Use feature branches** - Create PRs for all changes
5. **Keep secrets secure** - Never commit secrets to repository
6. **Monitor logs** - Check application logs after deployment
7. **Rollback plan** - Know how to rollback if deployment fails

## Quick Reference

### Branch Strategy
- `main` → Production
- `develop` → Staging
- `feature/*` → Development (no deployment)

### Deployment Flow
```
feature/* → PR → develop → Staging Deploy → Test → PR → main → Production Deploy
```

### Manual Commands on Server

```bash
# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
php artisan queue:restart
sudo systemctl restart php8.4-fpm
sudo systemctl restart nginx
```

## Support

For issues with the CI/CD pipeline, check:
1. GitHub Actions logs
2. Server application logs (`storage/logs`)
3. Web server logs (nginx/apache)
4. PHP-FPM logs
