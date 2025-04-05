# AgroIntel Deployment Guide

This guide will help you deploy your AgroIntel application to Firebase Hosting, replacing the default Firebase Hosting page with your actual application.

## Prerequisites

1. Install Firebase CLI globally (if not already installed):
   ```
   npm install -g firebase-tools
   ```

2. Make sure you're logged in to Firebase:
   ```
   firebase login
   ```

## Option 1: Automated Deployment

Use our automatic deployment script:

1. Make sure you have updated your Firebase project ID in `.firebaserc` file
2. Run the deployment script:
   ```
   node deploy.js
   ```

## Option 2: Manual Deployment

If you prefer to deploy manually, follow these steps:

1. Build your React application:
   ```
   cd frontend
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```
   cd ..  # Back to root directory
   firebase deploy --only hosting
   ```

## Troubleshooting

If you still see the "Firebase Hosting Setup Complete" page:

1. Verify that `firebase.json` correctly points to your build folder:
   ```json
   {
     "hosting": {
       "public": "frontend/build",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

2. Check that your build folder contains the expected files:
   ```
   ls -la frontend/build
   ```

3. Ensure your `.firebaserc` has the correct project ID:
   ```json
   {
     "projects": {
       "default": "agrointel-5089b"
     }
   }
   ```

4. Clear your browser cache or try in incognito mode

5. Verify deployment was successful with:
   ```
   firebase hosting:channel:list
   ```

## Environment Variables

Make sure your `.env.production` file contains the correct Firebase configuration values matching your Firebase project.

## Need Help?

If you continue to experience issues, please check the Firebase Hosting documentation or contact our support team. 