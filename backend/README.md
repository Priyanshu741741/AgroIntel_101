# AgroIntel Backend Deployment to Render

This guide explains how to deploy the AgroIntel backend to Render.com while keeping the frontend on Firebase Hosting.

## Prerequisites

1. A Render.com account
2. Git repository with your code (or you can deploy directly from your local files)

## Deployment Steps

### Option 1: Deploy via Render Dashboard

1. Log in to your Render account
2. Click on "New +" and select "Web Service"
3. Connect your repository or upload files directly
4. Configure your service:
   - Name: `agrointel-backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
5. Add the following environment variables:
   - `OPENWEATHERMAP_API_KEY`: Your OpenWeatherMap API key
   - `GOOGLE_API_KEY`: Your Google API key (if using Google services)
   - `ALLOWED_ORIGINS`: `https://agrointel-5089b.web.app,https://agrointel-5089b.firebaseapp.com,http://localhost:3000`
   - `GRPC_ENABLE_FORK_SUPPORT`: `0`
   - `GRPC_POLL_STRATEGY`: `epoll1`
6. Click "Create Web Service"

### Option 2: Deploy via render.yaml

Render also supports deployment via a `render.yaml` configuration file (already included in this repository):

1. Push your code to a Git repository
2. In the Render dashboard, click "New +" and select "Blueprint"
3. Connect your repository
4. Render will automatically detect the `render.yaml` file and configure your service

## Updating the Frontend

After deploying the backend to Render, you'll need to update your frontend to use the new backend URL:

1. In your frontend code, update the API endpoint URLs to point to your Render service URL
2. Example: `https://agrointel-backend.onrender.com/api/weather` instead of Firebase Functions URLs

## Troubleshooting

- If you encounter CORS issues, verify that your `ALLOWED_ORIGINS` environment variable includes all necessary frontend URLs
- Check Render logs for any errors during deployment or runtime
- Ensure all required environment variables are properly set

## Local Development

To run the backend locally:

```bash
python app.py
```

This will start the Flask development server on port 8000 (or the port specified in your .env file).