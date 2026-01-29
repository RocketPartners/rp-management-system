# Local Development Setup (No GitHub Secrets Needed)

You can start using this project immediately without configuring GitHub Actions.

## Quick Start with Docker

### 1. Prepare Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Or if you don't have PHP installed locally:
docker run --rm -v $(pwd):/app -w /app composer:latest composer install
docker run --rm -v $(pwd):/app -w /app php:8.4-cli php artisan key:generate
```

### 2. Update .env File

Edit `.env` and set these values:

```env
APP_NAME="RP Management System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (Docker Compose will use these)
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=rp_management
DB_USERNAME=root
DB_PASSWORD=secret

# Cache & Queue (using Redis in Docker)
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Mail (using Mailhog in Docker)
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=noreply@rpmanagement.com
MAIL_FROM_NAME="${APP_NAME}"

# Auto-migrate on Docker startup
AUTO_MIGRATE=true
```

### 3. Start Docker Containers

```bash
# Start all services including development tools
docker compose --profile development up -d --build

# This will start:
# - Application (port 8000)
# - MySQL (port 3306)
# - Redis (port 6379)
# - phpMyAdmin (port 8080)
# - Mailhog (port 8025)
```

### 4. View Logs

```bash
# Watch all logs
docker compose logs -f

# Watch only app logs
docker compose logs -f app
```

### 5. Access Your Application

- **Application**: http://localhost:8000
- **phpMyAdmin**: http://localhost:8080
  - Server: `mysql`
  - Username: `root`
  - Password: `secret`
- **Mailhog** (email testing): http://localhost:8025

### 6. Run Migrations & Seeders

```bash
# If AUTO_MIGRATE=true in .env, migrations run automatically
# Otherwise, run manually:

docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
```

### 7. Common Commands

```bash
# Clear caches
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear

# Run tests
docker compose exec app php artisan test

# Access container shell
docker compose exec app bash

# Stop containers
docker compose down

# Stop and remove all data
docker compose down -v
```

## Local Development Without Docker

If you prefer running without Docker:

### 1. Install Requirements

- PHP 8.4+
- Composer
- Node.js 22+
- MySQL 8.0+
- Redis (optional but recommended)

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### 3. Configure Database

Create a MySQL database and update `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rp_management
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 4. Run Migrations

```bash
php artisan migrate
php artisan db:seed
```

### 5. Start Development Servers

```bash
# Option 1: Use Laravel's dev script (recommended)
composer dev

# Option 2: Start services manually in separate terminals
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Vite
npm run dev

# Terminal 3: Queue worker
php artisan queue:work

# Terminal 4: Logs
php artisan pail
```

### 6. Access Application

Open http://localhost:8000

## When to Set Up GitHub Actions

You only need to configure GitHub Actions when you're ready to:
- Automatically deploy to staging/production servers
- Run automated tests on every push/PR
- Enable CI/CD pipeline

For local development, you can work without it!

## Setting Up GitHub Actions Later

When you're ready, follow these steps:

### 1. Check Your Repository Access

Go to: https://github.com/sean-ticzon-rp/rp-management-system/settings

If you can't see the Settings tab, ask the repository owner for admin access.

### 2. Add Secrets

If you have access:
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add the required secrets (see `.github/CICD_SETUP.md`)

### 3. Set Up Environments

1. Go to Settings → Environments
2. Create "staging" and "production" environments
3. Add protection rules if needed

### 4. Configure Servers

Set up your staging and production servers with:
- PHP 8.4+, Composer, Node.js, MySQL
- SSH access
- Git access to the repository

See `.github/CICD_SETUP.md` for detailed instructions.

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8000
lsof -i :8000

# Change the port in .env
APP_PORT=8001
```

Then restart: `docker compose down && docker compose --profile development up -d`

### Database Connection Error

```bash
# Check MySQL is running
docker compose ps mysql

# View MySQL logs
docker compose logs mysql

# Verify credentials in .env match docker-compose.yaml
```

### Permission Issues

```bash
# Fix storage permissions
chmod -R 775 storage bootstrap/cache
```

### Container Won't Start

```bash
# View container logs
docker compose logs app

# Rebuild from scratch
docker compose down -v
docker compose --profile development up -d --build
```

## Need Help?

- Check `DOCKER_USAGE.md` for Docker commands
- Check `.github/CICD_SETUP.md` for CI/CD setup
- Check `.github/README_CICD.md` for architecture overview
