# Deployment Guide for Render

## 🚀 Deploying to Render

### 1. Prerequisites
- Render account
- MongoDB Atlas database (already configured)
- Git repository with your code

### 2. Environment Variables in Render
Set these environment variables in your Render dashboard:

```
PORT=5000
MONGODB_URI=mongodb+srv://lakshmirishithreddymannem:HTW0Su22uxBIvu5J@cluster0.ptqh9ef.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### 3. Build Settings
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `backend` (if deploying from root)

### 4. API Endpoints

#### Root Endpoint
- **URL**: `https://bacend-6rm4.onrender.com/`
- **Method**: GET
- **Response**: API information and available endpoints

#### Health Check
- **URL**: `https://bacend-6rm4.onrender.com/api/health`
- **Method**: GET
- **Response**: Server status

#### Available API Routes
- `/api/auth` - Authentication endpoints
- `/api/products` - Product management
- `/api/cart` - Shopping cart
- `/api/artisan` - Artisan management
- `/api/orders` - Order management
- `/api/reviews` - Product reviews
- `/api/wishlist` - User wishlist

### 5. Testing Your Deployment

#### Test the root endpoint:
```bash
curl https://bacend-6rm4.onrender.com/
```

#### Test the health endpoint:
```bash
curl https://bacend-6rm4.onrender.com/api/health
```

#### Test products endpoint:
```bash
curl https://bacend-6rm4.onrender.com/api/products
```

### 6. Frontend Integration

Update your frontend API base URL to:
```javascript
const API_BASE_URL = 'https://bacend-6rm4.onrender.com/api';
```

### 7. Common Issues & Solutions

#### Issue: "Route not found" on root URL
**Solution**: ✅ Fixed - Added root endpoint that shows API information

#### Issue: CORS errors
**Solution**: ✅ Fixed - Updated CORS configuration to allow Render domains

#### Issue: Database connection fails
**Solution**: 
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check environment variables in Render dashboard

#### Issue: Server not starting
**Solution**:
- Check build logs in Render dashboard
- Verify `package.json` has correct start script
- Ensure all dependencies are in `package.json`

### 8. Monitoring

- Check Render dashboard for logs
- Monitor MongoDB Atlas for database performance
- Use the health endpoint for uptime monitoring

### 9. Security Notes

⚠️ **Important**: 
- Change the JWT_SECRET in production
- Consider using environment-specific MongoDB connections
- Review CORS settings for production use

---

## 🎉 Your API is now live at: https://bacend-6rm4.onrender.com/ 