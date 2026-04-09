# Deployment Guide 🚀

Deploy your Weather App to the cloud! Here are a few popular options.

## Option 1: Heroku (Simple & Free)

### Backend Deployment (Heroku)

1. **Create Heroku Account**: https://www.heroku.com/

2. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

3. **Login to Heroku**:
   ```bash
   heroku login
   ```

4. **Create a Heroku App**:
   ```bash
   cd backend
   heroku create your-weather-api-app
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

6. **Check Logs**:
   ```bash
   heroku logs --tail
   ```

### Frontend Deployment (Vercel)

1. **Create Vercel Account**: https://vercel.com/

2. **Deploy from GitHub** (easiest):
   - Push your code to GitHub
   - Go to vercel.com and connect your repo
   - Select `frontend` folder as root
   - Set `REACT_APP_API_URL` to your Heroku backend URL

3. **Or use Vercel CLI**:
   ```bash
   npm install -g vercel
   cd frontend
   vercel deploy
   ```

## Option 2: Netlify (Recommended for Frontend)

### Frontend on Netlify

1. **Sign up**: https://netlify.com/

2. **Connect GitHub** and select your repo

3. **Build Settings**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`

4. **Environment Variables**:
   - Add `REACT_APP_API_URL` pointing to your backend

## Option 3: AWS (Advanced)

### Backend on AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli --upgrade --user

# Initialize EB app
eb init -p "Node.js" weather-api

# Create and deploy
eb create weather-api-env
eb deploy
```

### Frontend on AWS S3 + CloudFront

1. Build React app:
   ```bash
   cd frontend
   npm run build
   ```

2. Upload `build/` folder to S3

3. Configure CloudFront for CDN

## Option 4: DigitalOcean (VPS)

### Deploy Both on Single Server

1. **Create DigitalOcean Droplet** (Ubuntu 20.04)

2. **SSH into Droplet**:
   ```bash
   ssh root@your_server_ip
   ```

3. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install and Start App**:
   ```bash
   git clone your-repo-url
   cd weather_prediction

   # Backend
   cd backend
   npm install
   npm start &

   # Frontend
   cd ../frontend
   npm install
   npm run build
   npm install -g serve
   serve -s build -l 3000 &
   ```

5. **Use Nginx as Reverse Proxy**:
   ```bash
   sudo apt-get install nginx
   ```

   Configure `/etc/nginx/sites-available/default`:
   ```nginx
   server {
       listen 80 default_server;
       server_name your_domain;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
       }

       location /api {
           proxy_pass http://localhost:5000;
       }
   }
   ```

6. **Enable SSL with Let's Encrypt**:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your_domain
   ```

## Option 5: Docker + Any Cloud

### Create Docker Files

**Dockerfile.backend**:
```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ .

EXPOSE 5000
CMD ["node", "server.js"]
```

**Dockerfile.frontend**:
```dockerfile
FROM node:16-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml**:
```yaml
version: '3'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

Deploy to:
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- Heroku (Docker support)

## Environment Configuration

### Production Environment Variables

**Backend (.env)**:
```
PORT=5000
NODE_ENV=production
```

**Frontend (.env.production)**:
```
REACT_APP_API_URL=https://your-backend-domain.com
```

## SSL Certificate

For HTTPS (required for production):
- Use Let's Encrypt (Free)
- Use CloudFlare (Free)
- Use your hosting provider's SSL

## Performance Tips

1. **Enable Caching**:
   ```javascript
   // In backend server.js
   app.use((req, res, next) => {
     res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
     next();
   });
   ```

2. **Compress Responses**:
   ```bash
   cd backend
   npm install compression
   ```

   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

3. **Use CDN for Static Files** (Frontend)
   - Netlify/Vercel auto-handles CDN
   - Or use CloudFlare

## Monitoring & Logs

- **Heroku**: `heroku logs --tail`
- **Vercel**: Check dashboard
- **Netlify**: Check dashboard
- **AWS**: CloudWatch
- **DigitalOcean**: Check PM2 or systemd logs

## Rollback

If deployment fails:
- **Heroku**: `heroku releases` then `heroku rollback`
- **Vercel**: Click "Deployments" and redeploy previous version
- **Docker**: Redeploy previous image

## Testing Before Deployment

```bash
# Test locally with production build
cd frontend
npm run build
npm install -g serve
serve -s build

# In another terminal
cd backend
NODE_ENV=production npm start
```

Visit `http://localhost:3000` and test thoroughly.

## Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] Frontend build tested locally
- [ ] Backend API tested locally
- [ ] SSL certificate configured
- [ ] Custom domain set up
- [ ] Monitoring/logging enabled
- [ ] Backups configured
- [ ] Tested location search
- [ ] Tested geolocation
- [ ] Tested mobile responsiveness

## Cost Comparison

| Provider | Cost | Best For |
|----------|------|----------|
| Heroku Free | $0/mo (deprecated) | Free tier now requires paid |
| Heroku Hobby | $7/mo | Small projects |
| Vercel Free | $0/mo | Static frontend |
| Netlify Free | $0/mo | Frontend + functions |
| DigitalOcean | $5/mo | Full control |
| AWS Free Tier | $0/12 months | New users |

## Support

For specific deployment issues, refer to your hosting provider's documentation.

---

Happy Deploying! 🎉
