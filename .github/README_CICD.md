# CI/CD Implementation Overview

This document provides an overview of the CI/CD setup for the RP Management System.

## 📁 Workflow Files

The CI/CD pipeline consists of **2 clean workflow files**:

### 1. `checks.yml` - Quality Gates ✅
**Runs on:** Pull Requests + Pushes
**Purpose:** Validate code quality before merging

**Jobs:**
- **Code Quality** - PHP Pint, Prettier, ESLint, TypeScript
- **Security Scan** - Composer audit, npm audit
- **Test Suite** - Pest tests with MySQL database and coverage

### 2. `deploy.yml` - Deployments 🚀
**Runs on:** Pushes to main/develop only
**Purpose:** Deploy code to environments

**Jobs:**
- **Build Assets** - Build production frontend
- **Staging** - Deploy to staging (develop branch)
- **Production** - Deploy to production (main branch)
- **Database Backup** - Backup after production deploy

---

## 🔄 Workflow Behavior

### On Pull Request (e.g., feature → main)
```
✅ Code Checks / Code Quality
✅ Code Checks / Security Scan
✅ Code Checks / Test Suite
```

**Deployment jobs are skipped** - No deployments on PRs for safety!

### On Merge to `develop`
```
✅ Code Checks / Code Quality
✅ Code Checks / Security Scan
✅ Code Checks / Test Suite
🚀 Deploy / Build Assets
🚀 Deploy / Staging
```

### On Merge to `main`
```
✅ Code Checks / Code Quality
✅ Code Checks / Security Scan
✅ Code Checks / Test Suite
🚀 Deploy / Build Assets
🚀 Deploy / Production
💾 Deploy / Database Backup
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         GitHub Repository                    │
│                                              │
│  feature/* → PR → develop → Staging         │
│                    ↓                         │
│              PR → main → Production          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         GitHub Actions                       │
│                                              │
│  checks.yml ────┐                           │
│  (Always runs)   │                           │
│                  ├─→ Code Quality            │
│                  ├─→ Security Scan           │
│                  └─→ Test Suite              │
│                                              │
│  deploy.yml ────┐                           │
│  (Push only)     │                           │
│                  ├─→ Build Assets            │
│                  ├─→ Deploy to Environment   │
│                  └─→ Database Backup         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Environments                         │
│                                              │
│  Staging  ←─ develop branch                 │
│  Production ←─ main branch                   │
└─────────────────────────────────────────────┘
```

---

## 📋 Required GitHub Secrets

### For Staging Deployment
```
STAGING_HOST       - Staging server hostname
STAGING_USER       - SSH username
STAGING_SSH_KEY    - Private SSH key
STAGING_PORT       - SSH port (optional, default: 22)
STAGING_PATH       - Application path on server
```

### For Production Deployment
```
PRODUCTION_HOST    - Production server hostname
PRODUCTION_USER    - SSH username
PRODUCTION_SSH_KEY - Private SSH key
PRODUCTION_PORT    - SSH port (optional, default: 22)
PRODUCTION_PATH    - Application path on server
```

### Optional
```
CODECOV_TOKEN      - For coverage reporting (optional)
```

**Setup Guide:** See `.github/GITHUB_SECRETS_GUIDE.md`

---

## 📊 Deployment Flow

```
1. Developer creates PR
   └─→ checks.yml runs (quality gates)

2. PR gets approved & merged to develop
   ├─→ checks.yml runs again
   └─→ deploy.yml builds & deploys to staging

3. Test on staging environment

4. Create PR from develop → main

5. PR approved & merged to main
   ├─→ checks.yml runs again
   └─→ deploy.yml builds & deploys to production
       └─→ Database backup created
```

---

## 🔧 Local Testing

Before pushing, test locally:

```bash
# Code quality
vendor/bin/pint --test
npm run format:check
npm run lint
npm run types

# Security
composer audit
npm audit --audit-level=moderate

# Tests
./vendor/bin/pest --coverage
```

---

## 🎯 Key Features

### Security
- ✅ Vulnerability scanning
- ✅ SSH key authentication
- ✅ Environment variable protection
- ✅ No deployment on PRs
- ✅ Manual approval for production

### Performance
- ✅ Dependency caching
- ✅ Parallel job execution
- ✅ Asset artifact sharing
- ✅ Optimized builds

### Reliability
- ✅ Automated testing
- ✅ Database migrations
- ✅ Health checks
- ✅ Automatic rollback support
- ✅ Database backups

### Developer Experience
- ✅ Fast feedback on PRs
- ✅ Clear job names
- ✅ Comprehensive logging
- ✅ Easy to understand structure

---

## 📈 Monitoring

### View Pipeline Status
- **Actions Tab:** https://github.com/YOUR_REPO/actions
- **PR Checks:** Automatically shown on pull requests
- **Deployment History:** Settings → Environments

### Common Issues

**Tests Failing?**
```bash
# Run locally to debug
./vendor/bin/pest
```

**Code Quality Issues?**
```bash
# Auto-fix locally
vendor/bin/pint
npm run format
```

**Deployment Failing?**
- Check GitHub secrets are configured
- Verify SSH access to servers
- Check server permissions
- Review deployment logs

---

## 🔄 Updating the Pipeline

### To modify quality checks:
Edit `.github/workflows/checks.yml`

### To modify deployment process:
Edit `.github/workflows/deploy.yml`

### To add new environment:
1. Add secrets for new environment
2. Create environment in GitHub Settings
3. Add new job in `deploy.yml`

---

## 📚 Additional Documentation

- **Setup Guide:** `.github/CICD_SETUP.md`
- **Secrets Configuration:** `.github/GITHUB_SECRETS_GUIDE.md`
- **Docker Setup:** `DOCKER_USAGE.md`
- **Local Development:** `LOCAL_SETUP.md`

---

## 🆘 Support

**Pipeline Issues:**
1. Check workflow logs in GitHub Actions
2. Review documentation
3. Test locally first
4. Check server logs

**Need Help?**
- GitHub Actions Docs: https://docs.github.com/en/actions
- Laravel Deployment: https://laravel.com/docs/deployment
