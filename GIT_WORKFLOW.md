# Git Workflow

This document defines the branching strategy, commit conventions, and PR process for the RP Management System.

## Branch Strategy

```
main          (production - auto-deploys to production server)
  |
develop       (staging - auto-deploys to staging server)
  |
feature/*     (development - no deployment, PR into develop)
fix/*         (bugfixes - no deployment, PR into develop)
hotfix/*      (urgent production fixes - PR directly into main)
```

### Branch Types

| Branch | Base | Merges Into | Purpose |
|--------|------|-------------|---------|
| `main` | - | - | Production-ready code. Protected. |
| `develop` | `main` | `main` | Integration branch. Staging deploys trigger on push. |
| `feature/HRIS-XX-description` | `develop` | `develop` | New features tied to a ticket. |
| `fix/HRIS-XX-description` | `develop` | `develop` | Bug fixes tied to a ticket. |
| `hotfix/description` | `main` | `main` + `develop` | Critical production fixes. |

### Branch Naming

Use lowercase, hyphen-separated names with the ticket ID when available:

```
feature/HRIS-14-calendar-view-with-multi-user-leave-visualization
feature/HRIS-17-leave-person-availability-refactor
fix/HRIS-22-leave-balance-calculation
hotfix/fix-login-500-error
```

If there's no ticket, use a descriptive name:

```
feature/add-bulk-approval
fix/notification-dropdown-scrollbar
```

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/). Format:

```
<type>(<scope>): <short description>

<optional body>

<optional footer>
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `chore` | Dependencies, config, tooling |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `style` | Formatting, whitespace (no logic change) |
| `perf` | Performance improvement |

### Scope (optional)

Use the ticket ID or module name:

```
feat(HRIS-14): Complete calendar implementation with refactor and fixes
fix(HRIS-22): Correct leave balance calculation for half-day leaves
refactor(calendar): Extract tooltip into standalone module
chore: Update package-lock.json after merging develop
```

### Rules

- Keep the subject line under 72 characters
- Use imperative mood: "Add feature" not "Added feature"
- Reference ticket IDs when applicable
- Separate subject from body with a blank line

## Development Workflow

### 1. Start a Feature

```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/HRIS-XX-short-description
```

### 2. Work on the Feature

```bash
# Make changes and commit often
git add <files>
git commit -m "feat(HRIS-XX): Add calendar filter component"

# Keep your branch updated with develop
git fetch origin develop
git rebase origin/develop
# OR if you prefer merge:
git merge origin/develop
```

### 3. Push and Create PR

```bash
# Push your branch
git push -u origin feature/HRIS-XX-short-description
```

Then create a Pull Request on GitHub targeting `develop`.

### 4. Code Review

- At least **1 approval** required before merging
- All CI checks (lint, tests, security) must pass
- Reviewer should check: correctness, edge cases, security, readability
- Author addresses feedback with new commits (don't force-push during review)

### 5. Merge

- Use **Squash and Merge** for feature branches into `develop` (keeps history clean)
- Use **Merge Commit** for `develop` into `main` (preserves full history of staging-tested changes)
- Delete the feature branch after merge

### 6. Staging Verification

After merging to `develop`:
- CI automatically deploys to staging
- Verify the feature works on staging
- Run any manual QA needed

### 7. Release to Production

When `develop` is stable and verified on staging:

```bash
# Create PR: develop -> main
# Use merge commit (not squash)
# CI deploys to production after merge
```

## Hotfix Workflow

For critical production bugs that can't wait for the normal flow:

```bash
# Branch from main
git checkout main
git pull origin main
git checkout -b hotfix/fix-critical-issue

# Fix, commit, push
git commit -m "fix: Resolve critical login failure"
git push -u origin hotfix/fix-critical-issue

# Create PR -> main (deploy to production)
# After merge, also merge main back into develop:
git checkout develop
git merge main
git push origin develop
```

## What Triggers CI/CD

| Event | Code Quality | Security | Tests | Staging Deploy | Production Deploy |
|-------|:---:|:---:|:---:|:---:|:---:|
| PR to `develop` | Yes | Yes | Yes | No | No |
| PR to `main` | Yes | Yes | Yes | No | No |
| Push to `develop` | Yes | Yes | Yes | Yes | No |
| Push to `main` | Yes | Yes | Yes | No | Yes |

## Pre-Push Checklist

Before pushing your branch, run locally:

```bash
# PHP code style
vendor/bin/pint --test

# Frontend checks
npm run format:check
npm run lint
npm run types

# Build check
npm run build

# Tests (if you have them for your changes)
./vendor/bin/pest
```

## Branch Protection Rules

Configure these in GitHub under `Settings > Branches > Branch protection rules`:

### `main` branch
- Require pull request reviews before merging (1 approval)
- Require status checks to pass: `Code Quality`, `Security Scan`, `Test Suite`
- Require branches to be up to date before merging
- Do not allow force pushes
- Do not allow deletions

### `develop` branch
- Require pull request reviews before merging (1 approval)
- Require status checks to pass: `Code Quality`, `Security Scan`, `Test Suite`
- Do not allow force pushes
- Do not allow deletions
