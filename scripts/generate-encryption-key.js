#!/usr/bin/env node

// this script generates a secure encryption key and updates the .env file
// run with: node scripts/generate-encryption-key.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const generateKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

const envPath = path.join(__dirname, '..', '.env');

const main = async () => {
  try {
    const newKey = generateKey();
    console.log('Generated new encryption key');

    if (!fs.existsSync(envPath)) {
      console.log('No .env file found. Creating a new one...');
      fs.writeFileSync(envPath, `ENCRYPTION_KEY=${newKey}\n`);
      console.log('.env file created with new encryption key');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');

    // check if ENCRYPTION_KEY already exists
    if (envContent.includes('ENCRYPTION_KEY=')) {
      // replace existing key
      const updatedContent = envContent.replace(
        /ENCRYPTION_KEY=.*/,
        `ENCRYPTION_KEY=${newKey}`
      );
      fs.writeFileSync(envPath, updatedContent);
      console.log('Encryption key updated in .env file');
    } else {
      fs.appendFileSync(envPath, `\nENCRYPTION_KEY=${newKey}\n`);
      console.log('Encryption key added to .env file');
    }

    console.log('Security improvement complete!');
    console.log('\nIMPORTANT: Make sure to restart your application for changes to take effect.');
    console.log('Note: Changing the encryption key will invalidate existing stored API keys.');
  } catch (error) {
    console.error('Error updating encryption key:', error);
    process.exit(1);
  }
};

main();