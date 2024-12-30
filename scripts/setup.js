import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';

async function setup() {
  try {
    console.log('\x1b[36m📦 Starting setup process...\x1b[0m');

    // Read .env.bak file
    console.log('\x1b[34m📄 Reading .env.bak file...\x1b[0m');
    const envContent = readFileSync('.env.bak', 'utf8');

    // Write to .env file
    console.log('\x1b[32m✍️  Creating .env file...\x1b[0m');
    writeFileSync('.env', envContent);

    // Run npm install
    console.log('\x1b[33m🔧 Installing dependencies...\x1b[0m');
    exec('npm install', (error, stdout, stderr) => {
      if (error) {
        console.error('\x1b[31m❌ Error during installation: ${error}\x1b[0m');
        return;
      }
      console.log('\x1b[32m✅ Setup completed successfully!\x1b[0m');
      console.log(stdout);
    });

  } catch (error) {
    console.error('\x1b[31m❌ Setup failed: ${error.message}\x1b[0m');
    process.exit(1);
  }
}
setup();