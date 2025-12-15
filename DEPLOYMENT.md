# ATS Resume Builder - Deployment Guide

**Version:** 1.0.0  
**Last Updated:** December 13, 2025  
**Environment:** Production/Staging

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Dependency Installation](#dependency-installation)
4. [Database Setup & Migration](#database-setup--migration)
5. [Configuration](#configuration)
6. [Testing Before Deployment](#testing-before-deployment)
7. [Deployment Steps](#deployment-steps)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Monitoring & Logs](#monitoring--logs)
10. [Rollback Procedure](#rollback-procedure)
11. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All unit tests passing (`npm test` and `pytest`)
- [ ] No console errors or warnings
- [ ] Code reviewed by team member
- [ ] Security vulnerabilities scanned (`npm audit`)
- [ ] No hardcoded secrets or credentials

### Testing
- [ ] Resume creation works end-to-end
- [ ] ATS analysis produces accurate scores
- [ ] PDF export generates correctly
- [ ] Skill autocomplete functioning
- [ ] Authentication working properly
- [ ] Database queries optimized

### Documentation
- [ ] API documentation updated (API.md)
- [ ] README includes feature description
- [ ] Environment variables documented
- [ ] Known issues listed
- [ ] Rollback procedure documented

### Infrastructure
- [ ] Production server capacity confirmed
- [ ] Database backup scheduled
- [ ] Monitoring tools configured
- [ ] SSL certificates valid
- [ ] Firewall rules updated

---

## Environment Setup

### System Requirements

**For Node.js Backend:**
- Node.js 14.x or higher
- npm 6.x or higher
- MongoDB 4.4 or higher
- 2GB RAM minimum

**For Python Backend:**
- Python 3.8 or higher
- pip 20.x or higher
- 1GB RAM minimum

**For Production:**
- Ubuntu 20.04 LTS (recommended)
- Or any Linux distribution with 2GB+ RAM
- Stable internet connection
- Firewall with ports 8080 and 5000 accessible

### Clone Repository

```bash
cd /opt/applications
git clone https://github.com/pramukhjp-ai/AI-Career-Navigator.git
cd AI-Career-Navigator
git checkout main
```

### Directory Structure

```
AI-Career-Navigator/
├── Login/                      # Node.js Express app
│   ├── app.js
│   ├── package.json
│   ├── routers/
│   ├── models/
│   ├── views/
│   ├── public/
│   └── tests/
├── recommandation/             # Python Flask app
│   ├── app.py
│   ├── ats_analyzer.py
│   ├── requirements.txt
│   ├── templates/
│   ├── static/
│   └── tests/
└── README.md
```

---

## Dependency Installation

### Node.js Backend

```bash
cd Login

# Install dependencies
npm install

# Install production-only dependencies
npm install --production

# Verify installation
npm list --depth=0
```

**Key Dependencies:**
- express: Web server
- mongoose: MongoDB ORM
- ejs: Template engine
- pdfkit: PDF generation
- express-session: Session management

### Python Backend

```bash
cd recommandation

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Verify installation
pip list
```

**Key Dependencies:**
- Flask: Web framework
- Flask-CORS: Cross-origin support
- pandas: Data processing
- scikit-learn: Machine learning
- nltk: Natural language processing

### Verify All Dependencies

```bash
# Node.js
npm audit
npm list --depth=0

# Python
pip check
pip list
```

---

## Database Setup & Migration

### MongoDB Connection

```bash
# Check MongoDB status
mongosh

# Create database
use studentsdata

# Create collections (if not exists)
db.createCollection("resumes")
db.createCollection("users")

# Create indexes (for performance)
db.resumes.createIndex({ userId: 1 })
db.resumes.createIndex({ userId: 1, createdAt: -1 })
db.resumes.createIndex({ atsScore: 1 })
```

### Backup Existing Database

```bash
# Before deployment
mongodump --db studentsdata --out /backups/studentsdata_$(date +%Y%m%d_%H%M%S)

# List backups
ls -la /backups/
```

### Verify Database Connection

```bash
# Test MongoDB connection from Node.js
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://127.0.0.1:27017/studentsdata').then(() => console.log('✓ DB Connected')).catch(e => console.error('✗ Error:', e.message));"
```

---

## Configuration

### Environment Variables - Node.js Backend

Create `/Login/.env`:

```bash
# Server Configuration
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/studentsdata
SESSION_SECRET=your-very-secure-secret-key-here-min-32-chars

# Session Configuration
SESSION_MAX_AGE=7200000  # 2 hours in milliseconds
SESSION_NAME=itnav.sid

# Resume Builder
MAX_RESUME_SIZE_MB=10
PDF_EXPORT_ENABLED=true
ATS_ANALYSIS_TIMEOUT_SECONDS=30

# Python Backend Connection
PYTHON_BACKEND_URL=http://localhost:5000

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/ai-career-navigator/node.log
```

### Environment Variables - Python Backend

Create `/recommandation/.env`:

```bash
# Flask Configuration
FLASK_ENV=production
FLASK_APP=app.py
FLASK_DEBUG=false
SECRET_KEY=your-flask-secret-key-here

# Server
FLASK_RUN_HOST=0.0.0.0
FLASK_RUN_PORT=5000

# CORS
FLASK_CORS_ALLOW_ORIGINS=http://localhost:8080

# ATS Analysis
ATS_TIMEOUT_SECONDS=30
MAX_RESUME_TEXT_LENGTH=10000

# Logging
LOG_LEVEL=INFO
```

### Secure Configuration

```bash
# Set restrictive permissions on .env files
chmod 600 Login/.env
chmod 600 recommandation/.env

# Never commit .env files
echo ".env" >> .gitignore
git rm --cached Login/.env recommandation/.env
```

---

## Testing Before Deployment

### Run Unit Tests

```bash
# Node.js tests
cd Login
npm test

# Python tests
cd ../recommandation
python -m pytest tests/ -v --cov
```

### Integration Testing

```bash
# Start services
cd Login && npm start &
cd ../recommandation && python app.py &

# Test API endpoints
curl -X GET http://localhost:8080/resume/list
curl -X GET http://localhost:5000/api/ats-score-info

# Stop services
pkill -f "npm start"
pkill -f "python app.py"
```

### Performance Testing

```bash
# Install Apache Bench (if needed)
sudo apt-get install apache2-utils

# Load test resume creation
ab -n 100 -c 10 -X POST \
  -H "Content-Type: application/json" \
  -d '@test-data.json' \
  http://localhost:8080/resume/create

# Target: < 2 seconds response time at 10 concurrent requests
```

### Security Testing

```bash
# Scan for vulnerabilities
npm audit
pip install safety
safety check

# Test authentication bypass
curl -X GET http://localhost:8080/resume/list  # Should fail (401)

# Test authorization
# (Verify user can't access other user's resumes)
```

---

## Deployment Steps

### Step 1: Prepare Production Server

```bash
# Create application directory
sudo mkdir -p /opt/apps/resume-builder
sudo chown $USER:$USER /opt/apps/resume-builder

# Create log directory
sudo mkdir -p /var/log/ai-career-navigator
sudo chown $USER:$USER /var/log/ai-career-navigator

# Create backup directory
mkdir -p /backups/databases
mkdir -p /backups/code
```

### Step 2: Deploy Code

```bash
# Backup current version
cp -r /opt/apps/resume-builder /backups/code/resume-builder-$(date +%Y%m%d_%H%M%S)

# Deploy new version
cd /opt/apps/resume-builder
git clone https://github.com/pramukhjp-ai/AI-Career-Navigator.git .
git checkout main
```

### Step 3: Install Dependencies

```bash
# Node.js
cd /opt/apps/resume-builder/Login
npm ci --production  # Use 'ci' for production (not 'install')

# Python
cd /opt/apps/resume-builder/recommandation
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 4: Configure Environment

```bash
# Copy template .env files
cp /backups/code/.env.production /opt/apps/resume-builder/Login/.env
cp /backups/code/.env.production /opt/apps/resume-builder/recommandation/.env

# Verify configuration
cat /opt/apps/resume-builder/Login/.env
cat /opt/apps/resume-builder/recommandation/.env
```

### Step 5: Start Services with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file (ecosystem.config.js)
cat > /opt/apps/resume-builder/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'resume-builder-node',
      script: 'Login/app.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      error_file: '/var/log/ai-career-navigator/node-error.log',
      out_file: '/var/log/ai-career-navigator/node-out.log'
    },
    {
      name: 'resume-builder-python',
      script: 'recommandation/app.py',
      instances: 1,
      env: {
        FLASK_ENV: 'production',
        FLASK_RUN_PORT: 5000
      },
      error_file: '/var/log/ai-career-navigator/python-error.log',
      out_file: '/var/log/ai-career-navigator/python-out.log'
    }
  ]
};
EOF

# Start services
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 6: Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo apt-get install nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/resume-builder > /dev/null << 'EOF'
upstream node_app {
  server 127.0.0.1:8080;
}

upstream python_app {
  server 127.0.0.1:5000;
}

server {
  listen 80;
  server_name yourdomain.com;
  
  location / {
    proxy_pass http://node_app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
  
  location /api/analyze-ats {
    proxy_pass http://python_app;
    proxy_http_version 1.1;
  }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/resume-builder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Post-Deployment Verification

### Health Checks

```bash
# Check Node.js service
curl -I http://localhost:8080/dashboard
echo "Expected: 200 OK or 302 Redirect"

# Check Python service
curl -I http://localhost:5000/
echo "Expected: 200 OK"

# Check PM2 status
pm2 status
echo "Expected: Both apps online"

# Check logs
pm2 logs resume-builder-node --lines 20
pm2 logs resume-builder-python --lines 20
```

### Functional Tests

```bash
# Test resume creation
curl -X POST http://localhost:8080/resume/create \
  -H "Content-Type: application/json" \
  -d '{
    "resumeTitle": "Test Resume",
    "personalInfo": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "phone": "1234567890",
      "location": "Test City"
    }
  }'

# Test ATS analysis
curl -X POST http://localhost:5000/api/analyze-ats \
  -H "Content-Type: application/json" \
  -d '{"resume_data": {...}}'

# Test skill suggestions
curl http://localhost:8080/resume/skills/suggestions
```

### Performance Checks

```bash
# Check response times
time curl http://localhost:8080/dashboard

# Check memory usage
ps aux | grep node
ps aux | grep python

# Check database connections
mongosh --eval "db.serverStatus()"
```

### Security Verification

```bash
# Check SSL/TLS (if using HTTPS)
openssl s_client -connect yourdomain.com:443

# Check authentication
curl -I http://localhost:8080/resume/list  # Should be 401

# Check CORS headers
curl -I -H "Origin: http://example.com" http://localhost:8080/dashboard
```

---

## Monitoring & Logs

### Log Files Location

```bash
# Node.js logs
/var/log/ai-career-navigator/node.log
/var/log/ai-career-navigator/node-error.log

# Python logs
/var/log/ai-career-navigator/python.log
/var/log/ai-career-navigator/python-error.log

# Nginx logs
/var/log/nginx/access.log
/var/log/nginx/error.log
```

### View Real-Time Logs

```bash
# PM2 logs
pm2 logs resume-builder-node -f  # -f for follow mode

# System logs
tail -f /var/log/ai-career-navigator/node-error.log
tail -f /var/log/ai-career-navigator/python-error.log
```

### Set Up Monitoring

```bash
# Install monit (optional)
sudo apt-get install monit

# Configure monit to restart services if down
sudo systemctl start monit
sudo systemctl enable monit
```

### Database Monitoring

```bash
# Monitor MongoDB
mongosh --eval "db.serverStatus()"

# List all databases
mongosh --eval "db.adminCommand('listDatabases')"

# Check collection stats
mongosh studentsdata --eval "db.resumes.stats()"
```

---

## Rollback Procedure

### If Deployment Fails

```bash
# Step 1: Stop new services
pm2 stop all
pm2 delete all

# Step 2: Restore backup code
rm -rf /opt/apps/resume-builder/*
cp -r /backups/code/resume-builder-YYYYMMDD_HHMMSS/* /opt/apps/resume-builder/

# Step 3: Reinstall dependencies
cd /opt/apps/resume-builder/Login
npm ci --production
cd ../recommandation
pip install -r requirements.txt

# Step 4: Start services
pm2 start ecosystem.config.js

# Step 5: Verify
curl http://localhost:8080/dashboard
```

### If Database Corruption Occurs

```bash
# Step 1: Backup current data
mongodump --db studentsdata --out /backups/studentsdata_corrupted_$(date +%Y%m%d_%H%M%S)

# Step 2: Restore from backup
mongorestore --db studentsdata /backups/studentsdata_YYYYMMDD_HHMMSS/

# Step 3: Verify
mongosh studentsdata --eval "db.resumes.countDocuments()"
```

### Quick Rollback Commands

```bash
# List available backups
ls -la /backups/code/

# Rollback to previous version
BACKUP_DATE=$(ls -t /backups/code/ | head -1 | sed 's/resume-builder-//' | sed 's/_.*$//')
cp -r /backups/code/resume-builder-$BACKUP_DATE/* /opt/apps/resume-builder/

# Restart services
pm2 restart all
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>

# Or use different port
NODE_ENV=production PORT=8081 npm start
```

#### MongoDB Connection Failed

```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Verify connection
mongosh

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

#### Python Virtual Environment Issues

```bash
# Recreate virtual environment
rm -rf recommandation/venv
python3 -m venv recommandation/venv
source recommandation/venv/bin/activate
pip install -r recommandation/requirements.txt
```

#### Out of Memory

```bash
# Check memory usage
free -h

# Check Node.js memory limit
node --max_old_space_size=4096 app.js

# Check swap space
swapon --show
```

#### Authentication/Session Issues

```bash
# Clear session data
mongosh studentsdata --eval "db.sessions.deleteMany({})"

# Restart services
pm2 restart all
```

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* npm start

# Enable Node.js debug
node --inspect app.js

# Python debug
FLASK_DEBUG=1 python app.py
```

### Health Check Script

Create `/opt/apps/resume-builder/health-check.sh`:

```bash
#!/bin/bash

echo "=== Resume Builder Health Check ==="
echo "Time: $(date)"

# Check Node.js
NODE_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/resume/list)
echo "Node.js Service: $NODE_HEALTH"

# Check Python
PYTHON_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/)
echo "Python Service: $PYTHON_HEALTH"

# Check MongoDB
MONGO_HEALTH=$(mongosh --eval "db.adminCommand('ping')" | grep ok)
echo "MongoDB: $MONGO_HEALTH"

# Check PM2
echo -e "\n=== PM2 Status ==="
pm2 status

# Check Disk Space
echo -e "\n=== Disk Space ==="
df -h /

# Check Memory
echo -e "\n=== Memory Usage ==="
free -h
```

### Support Resources

- **Documentation:** `/opt/apps/resume-builder/API.md`
- **Logs:** `/var/log/ai-career-navigator/`
- **Code:** `/opt/apps/resume-builder/`
- **Backups:** `/backups/`

---

## Checklist for Go-Live

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL/TLS configured (if required)
- [ ] Monitoring set up
- [ ] Logging configured
- [ ] Rollback procedure documented and tested
- [ ] Team trained on deployment
- [ ] Incident response plan ready
- [ ] Health checks automated

---

**Deployment Date:** [TO BE FILLED]  
**Deployed By:** [TO BE FILLED]  
**Version:** 1.0.0
