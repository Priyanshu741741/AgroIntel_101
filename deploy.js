const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  yellow: '\x1b[33m'
};

console.log(`${colors.bright}${colors.cyan}===== AgroIntel Firebase Deployment Script =====${colors.reset}\n`);

// Step 1: Build the React app
console.log(`${colors.yellow}Step 1/4: Building the React app...${colors.reset}`);
process.chdir(path.join(__dirname, 'frontend'));

exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`${colors.red}Build error: ${error.message}${colors.reset}`);
    return;
  }
  
  if (stderr) {
    console.error(`${colors.red}${stderr}${colors.reset}`);
  }
  
  console.log(`${colors.green}React app built successfully.${colors.reset}`);
  console.log(stdout);
  
  // Step 2: Install dependencies for Firebase Functions
  console.log(`\n${colors.yellow}Step 2/4: Installing Firebase Functions dependencies...${colors.reset}`);
  
  process.chdir(path.join(__dirname, 'functions'));
  
  exec('npm install', (error, stdout, stderr) => {
    if (error) {
      console.error(`${colors.red}Functions dependency installation error: ${error.message}${colors.reset}`);
      return;
    }
    
    if (stderr) {
      console.error(`${colors.red}${stderr}${colors.reset}`);
    }
    
    console.log(`${colors.green}Firebase Functions dependencies installed successfully.${colors.reset}`);
    console.log(stdout);
    
    // Step 3: Ensure firebase.json exists
    console.log(`\n${colors.yellow}Step 3/4: Checking Firebase configuration...${colors.reset}`);
    
    process.chdir(path.join(__dirname));
    
    if (!fs.existsSync('firebase.json')) {
      console.error(`${colors.red}firebase.json not found. Please create it first.${colors.reset}`);
      return;
    }
    
    if (!fs.existsSync('.firebaserc')) {
      console.error(`${colors.red}.firebaserc not found. Please create it first.${colors.reset}`);
      return;
    }
    
    // Step 4: Deploy to Firebase (both hosting and functions)
    console.log(`\n${colors.yellow}Step 4/4: Deploying to Firebase...${colors.reset}`);
    
    exec('firebase deploy --only hosting,functions', (error, stdout, stderr) => {
      if (error) {
        console.error(`${colors.red}Deployment error: ${error.message}${colors.reset}`);
        return;
      }
    }
    
    if (stderr) {
      console.error(`${colors.red}${stderr}${colors.reset}`);
    }
    
    console.log(stdout);
    console.log(`${colors.bright}${colors.green}Deployment completed successfully!${colors.reset}`);
    console.log(`\n${colors.cyan}You can now view your app at https://agrointel-5089b.web.app${colors.reset}`);
  });
});