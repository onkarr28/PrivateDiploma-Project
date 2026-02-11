# Docker Deployment Guide

## Overview
This guide explains how to deploy the PrivateDiploma application using Docker and Docker Compose.

## Prerequisites
- Docker Desktop installed (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v3.8 or higher
- 4GB RAM minimum
- Git (for cloning repository)

## Quick Start

### 1. Production Build

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f privatediploma

# Stop the application
docker-compose down
```

The application will be available at: http://localhost:3003

### 2. Development Mode

For development with hot-reload, edit `docker-compose.yml` and uncomment the `privatediploma-dev` service:

```bash
# Start in development mode
docker-compose up privatediploma-dev

# Or rebuild if needed
docker-compose up --build privatediploma-dev
```

## Configuration

### Environment Variables

1. Copy the environment template:
```bash
cp .env.docker .env
```

2. Edit `.env` with your values:
```env
CONTRACT_ADDRESS=your_actual_contract_address
ENABLE_BLOCKCHAIN=true
VITE_NETWORK_ID=testnet
VITE_RPC_URL=https://rpc.testnet.midnight.network
```

### Custom Configuration

Edit `docker-compose.yml` to customize:
- Port mapping (default: 3003:80)
- Environment variables
- Volume mounts
- Resource limits

## Docker Commands

### Build Commands
```bash
# Build the image
docker-compose build

# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build privatediploma
```

### Run Commands
```bash
# Start in background
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up privatediploma

# Restart services
docker-compose restart
```

### Management Commands
```bash
# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Execute command in container
docker-compose exec privatediploma sh

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v
```

## Production Deployment

### 1. Build Production Image
```bash
docker-compose -f docker-compose.yml build
```

### 2. Tag and Push to Registry
```bash
# Tag image
docker tag privatediploma-app:latest your-registry/privatediploma:latest

# Push to registry
docker push your-registry/privatediploma:latest
```

### 3. Deploy to Server
```bash
# Pull and run on production server
docker pull your-registry/privatediploma:latest
docker-compose up -d
```

## Architecture

### Multi-Stage Build
The Dockerfile uses a multi-stage build:
1. **Builder Stage**: Installs dependencies and builds the application
2. **Production Stage**: Serves static files with Nginx

### Services
- **privatediploma**: Production build with Nginx (default)
- **privatediploma-dev**: Development server with hot-reload (optional)

### Networking
- Custom bridge network: `privatediploma-network`
- Isolated container communication
- Port mapping: Host 3003 → Container 80

## Health Checks

The application includes automatic health checks:
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3 attempts
- Start period: 40 seconds

Check health status:
```bash
docker-compose ps
docker inspect --format='{{json .State.Health}}' privatediploma-app
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs privatediploma

# Check container status
docker-compose ps

# Restart container
docker-compose restart privatediploma
```

### Port Already in Use
```bash
# Stop conflicting service or change port in docker-compose.yml
# Example: Change "3003:80" to "3004:80"
```

### Build Failures
```bash
# Clean build
docker-compose down
docker system prune -a
docker-compose build --no-cache
```

### Permission Issues (Linux)
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

## Performance Optimization

### Resource Limits
Add to `docker-compose.yml`:
```yaml
services:
  privatediploma:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Nginx Caching
The nginx.conf includes:
- Gzip compression
- Static asset caching (1 year)
- Security headers

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Network Isolation**: Use Docker networks for service communication
3. **Security Headers**: Nginx configuration includes security headers
4. **Health Checks**: Monitor container health automatically
5. **Read-Only Volumes**: Use `:ro` flag for mounted volumes

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Build Docker image
  run: docker-compose build

- name: Push to registry
  run: |
    docker tag privatediploma-app:latest ${{ secrets.REGISTRY }}/privatediploma:${{ github.sha }}
    docker push ${{ secrets.REGISTRY }}/privatediploma:${{ github.sha }}
```

## Support

For issues or questions:
- Check container logs: `docker-compose logs -f`
- Verify configuration: `docker-compose config`
- Review PRODUCTION_READY.md for additional deployment options
- Check GitHub repository: https://github.com/onkarr28/Midnight-RiseIn
