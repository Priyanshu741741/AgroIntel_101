/**
 * AgroIntel Backend Deployment Script for Render
 * 
 * This script helps deploy the AgroIntel backend to Render.com
 * It provides a guided process for setting up the necessary configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=== AgroIntel Backend Deployment to Render ===\n');
console.log('This script will help you deploy the backend to Render.com');
console.log('Make sure you have a Render.com account before proceeding.\n');

// Check if required files exist
const requiredFiles = ['app.py', 'requirements.txt', 'Procfile', 'render.yaml'];
const missingFiles = [];

requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join(__dirname, file))) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('\nError: The following required files are missing:');
  missingFiles.forEach(file => console.error(`- ${file}`));
  console.error('\nPlease make sure these files exist before deploying.\n');
  process.exit(1);
}

// Check if .env file exists and has required variables
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.error('\nError: .env file is missing. Please create it with the required environment variables.\n');
  process.exit(1);
}

const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const requiredEnvVars = ['OPENWEATHERMAP_API_KEY'];
const missingEnvVars = [];

requiredEnvVars.forEach(envVar => {
  if (!envContent.includes(`${envVar}=`)) {
    missingEnvVars.push(envVar);
  }
});

if (missingEnvVars.length > 0) {
  console.error('\nError: The following required environment variables are missing in .env:');
  missingEnvVars.forEach(envVar => console.error(`- ${envVar}`));
  console.error('\nPlease add these variables to your .env file before deploying.\n');
  process.exit(1);
}

// Deployment steps
const steps = [
  {
    title: 'Prepare for Deployment',
    action: () => {
      console.log('\n1. Preparing for deployment...');
      console.log('   - Checking requirements.txt...');
      console.log('   - Checking Procfile...');
      console.log('   - Checking render.yaml...');
      console.log('   ✓ All required files are present!');
      return Promise.resolve();
    }
  },
  {
    title: 'Deployment Options',
    action: () => {
      return new Promise(resolve => {
        console.log('\n2. Choose a deployment method:');
        console.log('   a) Deploy via Render Dashboard (recommended for first-time deployment)');
        console.log('   b) Deploy via Render CLI (requires Render CLI to be installed)');
        
        rl.question('\nSelect an option (a/b): ', answer => {
          if (answer.toLowerCase() === 'a') {
            console.log('\nYou selected: Deploy via Render Dashboard');
            console.log('\nFollow these steps:');
            console.log('1. Log in to your Render account at https://dashboard.render.com');
            console.log('2. Click on "New +" and select "Web Service"');
            console.log('3. Connect your repository or upload files directly');
            console.log('4. Configure your service:');
            console.log('   - Name: agrointel-backend');
            console.log('   - Environment: Python 3');
            console.log('   - Build Command: pip install -r requirements.txt');
            console.log('   - Start Command: gunicorn app:app');
            console.log('5. Add the following environment variables:');
            console.log('   - OPENWEATHERMAP_API_KEY: Your OpenWeatherMap API key');
            console.log('   - GOOGLE_API_KEY: Your Google API key (if using Google services)');
            console.log('   - ALLOWED_ORIGINS: https://agrointel-5089b.web.app,https://agrointel-5089b.firebaseapp.com,http://localhost:3000');
            console.log('   - GRPC_ENABLE_FORK_SUPPORT: 0');
            console.log('   - GRPC_POLL_STRATEGY: epoll1');
            console.log('6. Click "Create Web Service"');
          } else if (answer.toLowerCase() === 'b') {
            console.log('\nYou selected: Deploy via Render CLI');
            console.log('\nNote: This requires the Render CLI to be installed.');
            console.log('If you haven\'t installed it yet, please visit: https://render.com/docs/cli');
            console.log('\nOnce installed, run the following command in this directory:');
            console.log('render blueprint create');
          } else {
            console.log('\nInvalid option. Please restart the script and select a valid option.');
          }
          resolve();
        });
      });
    }
  },
  {
    title: 'Update Frontend Configuration',
    action: () => {
      return new Promise(resolve => {
        console.log('\n3. After deploying to Render, you need to update your frontend configuration');
        console.log('   to use the new backend URL.');
        console.log('\n   Your Render service URL will be something like:');
        console.log('   https://agrointel-backend.onrender.com');
        console.log('\n   You need to update your frontend code to use this URL for API calls.');
        
        rl.question('\nPress Enter to continue...', () => {
          resolve();
        });
      });
    }
  },
  {
    title: 'Verify Deployment',
    action: () => {
      return new Promise(resolve => {
        console.log('\n4. To verify your deployment:');
        console.log('   1. Wait for the deployment to complete on Render (this may take a few minutes)');
        console.log('   2. Visit your service URL + "/api/health" to check if the API is running');
        console.log('      Example: https://agrointel-backend.onrender.com/api/health');
        console.log('   3. You should see a response like: { "status": "ok", "message": "Server is running" }');
        
        rl.question('\nPress Enter to finish...', () => {
          resolve();
        });
      });
    }
  }
];

// Run the steps sequentially
async function runSteps() {
  for (const step of steps) {
    await step.action();
  }
  
  console.log('\n=== Deployment Guide Complete ===');
  console.log('Your backend is now ready to be deployed to Render.com!');
  console.log('For more information, refer to the README.md file in this directory.\n');
  
  rl.close();
}

runSteps();