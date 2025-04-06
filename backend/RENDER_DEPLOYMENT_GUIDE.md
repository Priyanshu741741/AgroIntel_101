# AgroIntel Backend Deployment Guide for Render.com

This guide will walk you through deploying your AgroIntel backend to Render.com while keeping your frontend on Firebase.

## Prerequisites

1. A Render.com account (sign up at https://render.com if you don't have one)
2. Your AgroIntel backend code (which you already have)

## Deployment Steps

### Step 1: Prepare Your Environment Variables

Your `.env` file already contains the necessary environment variables:

```
OPENWEATHERMAP_API_KEY=0ed298208193505d5deb394d1ab181bd
GOOGLE_API_KEY=AIzaSyDJMxmHvenLjjR0YASY15sCHYL4Zvt87Bk
ALLOWED_ORIGINS=https://agrointel-5089b.web.app,https://agrointel-5089b.firebaseapp.com,http://localhost:3000
```

You'll need to add these to Render during deployment.

### Step 2: Deploy via Render Dashboard

1. Log in to your Render account at https://dashboard.render.com
2. Click on "New +" and select "Web Service"
3. You have two options:
   - Connect to your GitHub repository if your code is hosted there
   - Or select "Upload Files" to upload your backend code directly

4. Configure your service with these settings:
   - **Name**: `agrointel-backend` (or any name you prefer)
   - **Environment**: `Python 3`
   - **Region**: Choose the region closest to your users
   - **Branch**: `main` (if using GitHub)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`

5. Add the following environment variables (click "Add Environment Variable" for each):
   - `OPENWEATHERMAP_API_KEY`: Your OpenWeatherMap API key (from .env file)
   - `GOOGLE_API_KEY`: Your Google API key (from .env file)
   - `ALLOWED_ORIGINS`: `https://agrointel-5089b.web.app,https://agrointel-5089b.firebaseapp.com,http://localhost:3000`
   - `GRPC_ENABLE_FORK_SUPPORT`: `0`
   - `GRPC_POLL_STRATEGY`: `epoll1`

6. Under "Advanced" settings, you can leave the defaults or adjust as needed

7. Click "Create Web Service"

### Step 3: Monitor Deployment

Render will now build and deploy your application. This process typically takes 5-10 minutes for the first deployment.

You can monitor the build progress in the Render dashboard. Once complete, Render will provide you with a URL for your service (typically `https://your-service-name.onrender.com`).

### Step 4: Verify Deployment

1. Wait for the deployment to complete
2. Visit your service URL + "/api/health" to check if the API is running
   - Example: `https://agrointel-backend.onrender.com/api/health`
3. You should see a response like: `{ "status": "ok", "message": "Server is running" }`

### Step 5: Update Frontend Configuration

Now that your backend is deployed to Render, you need to update your frontend to use the new backend URL:

1. In your frontend code, update the API endpoint URLs to point to your Render service URL
2. For example, change from Firebase Functions URLs to:
   - `https://your-service-name.onrender.com/api/weather`
   - `https://your-service-name.onrender.com/api/soil-analysis`
   - etc.

## Troubleshooting

- If you encounter CORS issues, verify that your `ALLOWED_ORIGINS` environment variable includes all necessary frontend URLs
- Check Render logs for any errors during deployment or runtime
- Ensure all required environment variables are properly set

## Maintenance

- Render automatically redeploys your application when you push changes to your connected repository
- You can manually trigger a redeploy from the Render dashboard
- Free tier services on Render may spin down after periods of inactivity; the first request after inactivity may take longer to respond

## Next Steps

Once your backend is successfully deployed to Render and your frontend is updated to use the new backend URL, your AgroIntel application should be fully functional with the backend on Render and the frontend on Firebase Hosting.