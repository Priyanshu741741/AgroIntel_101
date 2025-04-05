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
console.log(`${colors.yellow}Step 1/3: Building the React app...${colors.reset}`);
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
  
  // Step 2: Ensure firebase.json exists
  console.log(`\n${colors.yellow}Step 2/3: Checking Firebase configuration...${colors.reset}`);
  
  process.chdir(path.join(__dirname));
  
  if (!fs.existsSync('firebase.json')) {
    console.error(`${colors.red}firebase.json not found. Please create it first.${colors.reset}`);
    return;
  }
  
  // Step 3: Deploy to Firebase
  console.log(`\n${colors.yellow}Step 3/3: Deploying to Firebase...${colors.reset}`);
  
  exec('firebase deploy --only hosting', (error, stdout, stderr) => {
    if (error) {
      console.error(`${colors.red}Deployment error: ${error.message}${colors.reset}`);
      return;
    }
    
    if (stderr) {
      console.error(`${colors.red}${stderr}${colors.reset}`);
    }
    
    console.log(stdout);
    console.log(`${colors.bright}${colors.green}Deployment completed successfully!${colors.reset}`);
    console.log(`\n${colors.cyan}You can now view your app at https://agrointel-5089b.web.app${colors.reset}`);
  });
}); 