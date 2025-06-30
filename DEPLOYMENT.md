# Deployment Guide

This guide covers deploying your full-stack application with React frontend and PocketBase backend.

## Project Structure

```
/
├── client/                 # React frontend (Vite + TypeScript)
├── pb_hooks/              # PocketBase JavaScript hooks
├── pb_migrations/         # PocketBase database migrations
├── pb_data/               # PocketBase data (auto-created, gitignored)
├── main.go                # Go-based PocketBase entry point
├── go.mod                 # Go module dependencies
├── pocket-app             # Built Go binary (auto-created)
├── package.json           # Root package.json for monorepo
├── dev-setup.sh           # Development setup script
├── start-go-pocketbase.sh # PocketBase startup script
└── DEPLOYMENT.md          # This file
```

## Development

### Quick Start

```bash
# One-command setup and start
./dev-setup.sh
```

### Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Initialize Go module
go mod init pocket-app && go mod tidy

# 3. Start development
npm run dev
```

### Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only React dev server
- `npm run dev:backend` - Start only Go-based PocketBase
- `npm run build` - Build frontend for production
- `npm run build:go` - Build Go-based PocketBase binary
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run linting
- `npm run lint:fix` - Fix linting issues

## Deployment Options

### 1. Traditional VPS/Server Deployment

#### Requirements
- Linux server (Ubuntu/Debian recommended)
- Node.js 18+ and npm
- Go 1.23+ (for Go-based PocketBase)
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)
- PM2 or similar process manager

#### Steps

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Go (for Go-based PocketBase)
wget https://go.dev/dl/go1.23.4.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.23.4.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx
```

2. **Deploy Application**
```bash
# Clone repository
git clone <your-repo-url>
cd <your-project>

# Setup production environment
cp .env.example .env.local
# Edit .env.local with production values

# Install dependencies and build
npm install
npm run build

# Option A: Binary PocketBase
./download-pocketbase.sh

# Option B: Go-based PocketBase
go mod tidy
npm run build:go
```

3. **Configure PM2**

#### For Binary PocketBase:
```bash
# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'pocketbase',
    script: './pocketbase',
    args: 'serve --http=127.0.0.1:8090',
    cwd: '/path/to/your/project',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF
```

#### For Go-based PocketBase:
```bash
# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'pocket-app',
    script: './pocket-app',
    args: 'serve --http=127.0.0.1:8090',
    cwd: '/path/to/your/project',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **Configure Nginx**
```nginx
# /etc/nginx/sites-available/your-app
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (serve built files)
    location / {
        root /path/to/your/project/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # PocketBase API
    location /api/ {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # PocketBase Admin
    location /_/ {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Enable SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 2. Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

FROM alpine:latest
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Download PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip \
    && unzip pocketbase_linux_amd64.zip \
    && chmod +x pocketbase \
    && rm pocketbase_linux_amd64.zip

# Copy application files
COPY pb_hooks/ ./pb_hooks/
COPY pb_migrations/ ./pb_migrations/
COPY --from=frontend-build /app/client/dist ./public

EXPOSE 8090

# Serve both API and frontend
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--publicDir=./public"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8090:8090"
    volumes:
      - pb_data:/app/pb_data
    environment:
      - NODE_ENV=production

volumes:
  pb_data:
```

### 3. Platform-as-a-Service (PaaS) Options

#### Railway
1. Connect GitHub repository
2. Add environment variables
3. Railway will auto-detect and deploy

#### Fly.io
```bash
flyctl launch
flyctl deploy
```

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build and run commands:
   - Build: `npm run build`
   - Run: `./pocketbase serve --http=0.0.0.0:$PORT`

## Environment Variables

### Production Environment Variables
```bash
# .env.local for production
NODE_ENV=production
POCKETBASE_PORT=8090
POCKETBASE_HOST=0.0.0.0

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-very-secure-password

# External APIs (if applicable)
OPENAI_API_KEY=your-openai-key
OPENAI_API_URL=https://api.openai.com/v1

# Database backup (optional)
BACKUP_INTERVAL=24h
BACKUP_RETENTION=30d
```

## Security Considerations

1. **Change Default Credentials**: Set strong admin password
2. **HTTPS Only**: Always use SSL in production
3. **Environment Variables**: Never commit sensitive data
4. **CORS Configuration**: Configure proper CORS rules
5. **Rate Limiting**: Implement rate limiting for APIs
6. **Regular Backups**: Setup automated database backups
7. **Updates**: Keep PocketBase and dependencies updated

## Monitoring

1. **Health Checks**: Use `/api/health` endpoint
2. **Logs**: Monitor PocketBase and application logs
3. **Performance**: Monitor response times and resource usage
4. **Uptime**: Setup uptime monitoring

## Backup Strategy

```bash
# Backup PocketBase data
./pocketbase admin backup

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
./pocketbase admin backup "backup_${DATE}.zip"
# Upload to cloud storage (S3, etc.)
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change port in environment variables
   - Kill existing processes: `sudo lsof -ti:8090 | xargs kill -9`

2. **Permission Denied**
   - Make scripts executable: `chmod +x *.sh`
   - Check file ownership and permissions

3. **Database Migration Errors**
   - Check migration files in `pb_migrations/`
   - Ensure proper database backup before migrations

4. **Frontend Build Errors**
   - Clear node_modules: `rm -rf client/node_modules && cd client && npm install`
   - Check TypeScript errors: `npm run typecheck`

For more help, check the [PocketBase documentation](https://pocketbase.io/docs/) and [React deployment guides](https://create-react-app.dev/docs/deployment/).
