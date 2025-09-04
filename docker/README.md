# MPLP v1.0 Alpha - Docker Configuration

**Containerized deployment for the Multi-Agent Protocol Lifecycle Platform**

## 🎯 **Overview**

This directory contains Docker configurations for running MPLP v1.0 Alpha in containerized environments. The setup supports development, testing, and Alpha deployment scenarios.

## 🚀 **Quick Start**

### **Basic Alpha Deployment**

```bash
# Start MPLP Alpha with dependencies
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f mplp-core
```

### **Development Environment**

```bash
# Start development environment
docker-compose --profile dev up -d

# Access development server
curl http://localhost:3001/health
```

### **Testing Environment**

```bash
# Run tests in container
docker-compose --profile test up mplp-test

# View test results
docker-compose logs mplp-test
```

## 🏗️ **Architecture**

### **Multi-Stage Dockerfile**

The Dockerfile uses multi-stage builds for different environments:

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Stages                            │
├─────────────────────────────────────────────────────────────┤
│ base        │ Common base with Node.js and system deps     │
│ development │ Full dev environment with all dependencies   │
│ production  │ Optimized production build                   │
│ testing     │ Testing environment with test execution      │
│ alpha       │ Alpha-specific configuration and warnings    │
└─────────────────────────────────────────────────────────────┘
```

### **Service Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Service Stack                            │
├─────────────────────────────────────────────────────────────┤
│ mplp-core   │ Main MPLP application (Alpha)               │
│ postgres    │ PostgreSQL database for persistence         │
│ redis       │ Redis cache for performance                 │
│ prometheus  │ Metrics collection (monitoring profile)     │
│ grafana     │ Metrics visualization (monitoring profile)  │
│ traefik     │ Load balancer (loadbalancer profile)       │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 **Configuration**

### **Environment Variables**

#### **Core MPLP Settings**
```bash
NODE_ENV=alpha                    # Environment mode
MPLP_VERSION=1.0.0-alpha         # MPLP version
MPLP_LOG_LEVEL=info              # Logging level
MPLP_PORT=3000                   # Application port
MPLP_ENABLE_DEBUG=true           # Enable debug mode
MPLP_ENABLE_METRICS=true         # Enable metrics collection
MPLP_ENABLE_TRACING=true         # Enable distributed tracing
```

#### **Database Settings**
```bash
MPLP_DB_HOST=postgres            # Database host
MPLP_DB_PORT=5432               # Database port
MPLP_DB_NAME=mplp_alpha         # Database name
MPLP_DB_USER=mplp               # Database user
MPLP_DB_PASSWORD=***            # Database password
```

#### **Cache Settings**
```bash
MPLP_REDIS_HOST=redis           # Redis host
MPLP_REDIS_PORT=6379            # Redis port
MPLP_REDIS_DB=0                 # Redis database
```

### **Profiles**

Use Docker Compose profiles to run different configurations:

```bash
# Development profile
docker-compose --profile dev up -d

# Testing profile
docker-compose --profile test up

# Monitoring profile (includes Prometheus & Grafana)
docker-compose --profile monitoring up -d

# Load balancer profile (includes Traefik)
docker-compose --profile loadbalancer up -d

# All profiles
docker-compose --profile dev --profile monitoring --profile loadbalancer up -d
```

## 📊 **Monitoring**

### **Health Checks**

All services include health checks:

```bash
# Check service health
docker-compose ps

# View health check logs
docker inspect mplp-core-alpha --format='{{json .State.Health}}'
```

### **Metrics & Monitoring**

When using the monitoring profile:

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/mplp_admin)
- **Traefik Dashboard**: http://localhost:8080

### **Log Management**

```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f mplp-core

# View logs with timestamps
docker-compose logs -t mplp-core
```

## 🔒 **Security**

### **Security Features**

- **Non-root user**: Application runs as non-root user (mplp:1001)
- **Read-only volumes**: Schema files mounted as read-only
- **Health checks**: Regular health monitoring
- **Resource limits**: Memory and CPU limits configured
- **Network isolation**: Services run in isolated network

### **Production Security**

For production deployments:

```bash
# Use production target
docker build --target production -t mplp:1.0.0-alpha .

# Set secure environment variables
export MPLP_DB_PASSWORD=$(openssl rand -base64 32)
export MPLP_REDIS_PASSWORD=$(openssl rand -base64 32)
```

## 🚀 **Deployment Scenarios**

### **Local Development**

```bash
# Start development environment
docker-compose --profile dev up -d

# Access services
curl http://localhost:3001/health    # Development server
curl http://localhost:5432           # PostgreSQL
curl http://localhost:6379           # Redis
```

### **Alpha Testing**

```bash
# Start Alpha environment
docker-compose up -d

# Test MPLP functionality
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/modules
```

### **CI/CD Pipeline**

```bash
# Build and test
docker build --target testing -t mplp:test .
docker run --rm mplp:test

# Build production image
docker build --target alpha -t mplp:1.0.0-alpha .
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Service Won't Start**
```bash
# Check logs
docker-compose logs mplp-core

# Check health status
docker-compose ps

# Restart service
docker-compose restart mplp-core
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test database connection
docker-compose exec postgres psql -U mplp -d mplp_alpha -c "SELECT version();"
```

#### **Performance Issues**
```bash
# Check resource usage
docker stats

# View metrics (if monitoring enabled)
curl http://localhost:9090/metrics
```

### **Debug Mode**

Enable debug mode for troubleshooting:

```bash
# Set debug environment
export MPLP_LOG_LEVEL=debug
export MPLP_ENABLE_DEBUG=true

# Restart with debug
docker-compose up -d
```

## 📚 **Additional Resources**

### **Docker Commands**

```bash
# Build specific stage
docker build --target alpha -t mplp:alpha .

# Run with custom environment
docker run -e MPLP_LOG_LEVEL=debug mplp:alpha

# Execute commands in running container
docker-compose exec mplp-core npm run health-check
```

### **Volume Management**

```bash
# List volumes
docker volume ls | grep mplp

# Backup data
docker run --rm -v mplp-postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restore data
docker run --rm -v mplp-postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

## ⚠️ **Alpha Version Notes**

### **Alpha Considerations**

- **API Changes**: APIs may change before stable release
- **Data Migration**: Database schema may change between Alpha versions
- **Performance**: Not yet optimized for high-scale production use
- **Monitoring**: Enhanced monitoring available but not production-tuned

### **Recommended Usage**

- ✅ **Development environments**: Perfect for building and testing
- ✅ **Alpha testing**: Ideal for evaluating MPLP capabilities
- ✅ **Integration testing**: Great for testing multi-agent integrations
- ⚠️ **Production use**: Evaluate carefully, have migration plans ready

---

**🐳 Happy Containerizing!** For more information, see the [main documentation](../docs/README.md) or [deployment guide](../docs/guides/deployment.md).
