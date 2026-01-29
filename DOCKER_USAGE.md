# Docker Usage Guide

Quick reference for running the RP Management System with Docker.

## Quick Start

### Development Environment

```bash
# Build and start all services (including Mailhog and phpMyAdmin)
docker compose --profile development up -d --build

# View logs
docker compose logs -f app

# Access the application
open http://localhost:8000

# Access phpMyAdmin
open http://localhost:8080

# Access Mailhog (email testing)
open http://localhost:8025
```

### Production Environment

```bash
# Build and start production services only
docker compose up -d --build

# Enable automatic migrations on start
AUTO_MIGRATE=true docker compose up -d --build
```

## Common Commands

### Starting Services

```bash
# Start all services
docker compose up -d

# Start with rebuild
docker compose up -d --build

# Start specific service
docker compose up -d app

# View startup logs
docker compose up
```

### Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes database)
docker compose down -v

# Stop specific service
docker compose stop app
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app

# Last 100 lines
docker compose logs --tail=100 app
```

### Executing Commands

```bash
# Laravel Artisan commands
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
docker compose exec app php artisan cache:clear
docker compose exec app php artisan queue:work

# Composer commands
docker compose exec app composer install
docker compose exec app composer update

# Shell access
docker compose exec app bash
docker compose exec app sh

# MySQL commands
docker compose exec mysql mysql -u root -p
docker compose exec mysql mysqldump -u root -p dbname > backup.sql
```

### Database Operations

```bash
# Run migrations
docker compose exec app php artisan migrate

# Rollback migrations
docker compose exec app php artisan migrate:rollback

# Seed database
docker compose exec app php artisan db:seed

# Fresh migration (WARNING: deletes all data)
docker compose exec app php artisan migrate:fresh --seed

# Database backup
docker compose exec mysql mysqldump -u root -p${DB_PASSWORD} ${DB_DATABASE} > backup.sql

# Database restore
docker compose exec -T mysql mysql -u root -p${DB_PASSWORD} ${DB_DATABASE} < backup.sql
```

### Cache Management

```bash
# Clear all caches
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan route:clear
docker compose exec app php artisan view:clear

# Rebuild caches
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache
```

### Queue Management

```bash
# Start queue worker
docker compose exec app php artisan queue:work

# Restart queue workers
docker compose exec app php artisan queue:restart

# View failed jobs
docker compose exec app php artisan queue:failed

# Retry failed job
docker compose exec app php artisan queue:retry {job-id}

# Retry all failed jobs
docker compose exec app php artisan queue:retry all
```

## Environment Configuration

### Required Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Application
APP_NAME="RP Management System"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_PORT=8000

# Database
DB_CONNECTION=mysql
DB_DATABASE=rp_management
DB_USERNAME=root
DB_PASSWORD=secret
DB_PORT=3306

# Redis
REDIS_PASSWORD=null
REDIS_PORT=6379

# Auto migrate on startup (optional)
AUTO_MIGRATE=false
```

### Generate Application Key

```bash
# Generate new key
docker compose exec app php artisan key:generate

# Or if container is not running yet
php artisan key:generate
```

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| Application | 8000 | http://localhost:8000 |
| MySQL | 3306 | localhost:3306 |
| Redis | 6379 | localhost:6379 |
| phpMyAdmin (dev) | 8080 | http://localhost:8080 |
| Mailhog Web (dev) | 8025 | http://localhost:8025 |
| Mailhog SMTP (dev) | 1025 | localhost:1025 |

## Troubleshooting

### Container won't start

```bash
# Check container status
docker compose ps

# View container logs
docker compose logs app

# Rebuild from scratch
docker compose down -v
docker compose up -d --build
```

### Database connection issues

```bash
# Check MySQL is running
docker compose ps mysql

# Check MySQL logs
docker compose logs mysql

# Test connection
docker compose exec app php artisan tinker
# Then run: DB::connection()->getPdo();
```

### Permission issues

```bash
# Fix storage permissions
docker compose exec app chmod -R 775 storage bootstrap/cache
docker compose exec app chown -R www-data:www-data storage bootstrap/cache

# Or from host
chmod -R 775 storage bootstrap/cache
```

### Clear everything and start fresh

```bash
# Stop and remove all containers, networks, and volumes
docker compose down -v

# Remove all images
docker compose down --rmi all

# Rebuild from scratch
docker compose up -d --build

# Run migrations
docker compose exec app php artisan migrate:fresh --seed
```

### View container resource usage

```bash
# View stats
docker stats

# View specific container
docker stats rp_management_system_app
```

## Production Deployment

### Using Docker Hub

```bash
# Build image
docker build -t your-registry/rp-management-system:latest .

# Push to registry
docker push your-registry/rp-management-system:latest

# On production server
docker pull your-registry/rp-management-system:latest
docker compose up -d
```

### Using GitHub Container Registry

See `.github/workflows/docker-deploy.yml` for automated CI/CD setup.

## Health Checks

```bash
# Check application health
curl http://localhost:8000/api/health

# View container health status
docker compose ps
docker inspect rp_management_system_app | grep -A 10 Health
```

## Monitoring

### View logs in real-time

```bash
# All logs
docker compose logs -f

# Filter by service
docker compose logs -f app mysql redis

# Search logs
docker compose logs app | grep ERROR
```

### Enter container for debugging

```bash
# Application container
docker compose exec app bash

# Check PHP version
docker compose exec app php -v

# Check installed extensions
docker compose exec app php -m

# Check Laravel version
docker compose exec app php artisan --version
```

## Backup and Restore

### Backup

```bash
# Database backup
docker compose exec mysql mysqldump \
  -u root \
  -p${DB_PASSWORD} \
  ${DB_DATABASE} \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup uploaded files
tar -czf storage_backup_$(date +%Y%m%d_%H%M%S).tar.gz storage/app/public
```

### Restore

```bash
# Restore database
docker compose exec -T mysql mysql \
  -u root \
  -p${DB_PASSWORD} \
  ${DB_DATABASE} \
  < backup.sql

# Restore files
tar -xzf storage_backup.tar.gz
```

## Performance Tuning

### Optimize Laravel for production

```bash
# Cache everything
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache
docker compose exec app php artisan event:cache

# Optimize Composer autoloader
docker compose exec app composer install --optimize-autoloader --no-dev
```

### Monitor performance

```bash
# Check container resources
docker stats rp_management_system_app

# Check MySQL performance
docker compose exec mysql mysql -u root -p -e "SHOW PROCESSLIST;"

# Check Redis stats
docker compose exec redis redis-cli info stats
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Laravel Documentation](https://laravel.com/docs)
- [GitHub CI/CD Setup](.github/CICD_SETUP.md)
