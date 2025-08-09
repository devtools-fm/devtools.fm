#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function readMiseToml() {
  const miseTomlPath = path.join(process.cwd(), 'mise.toml');
  if (!fs.existsSync(miseTomlPath)) {
    throw new Error('mise.toml not found');
  }
  
  const content = fs.readFileSync(miseTomlPath, 'utf8');
  const pnpmMatch = content.match(/pnpm = "([^"]+)"/);
  
  if (!pnpmMatch) {
    throw new Error('pnpm version not found in mise.toml');
  }
  
  return pnpmMatch[1];
}

function updatePackageJson(pnpmVersion) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found');
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.packageManager) {
    packageJson.packageManager = `pnpm@${pnpmVersion}`;
  } else if (packageJson.packageManager.startsWith('pnpm@')) {
    packageJson.packageManager = `pnpm@${pnpmVersion}`;
  } else {
    console.warn('package.json already has a non-pnpm packageManager, skipping update');
    return false;
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  return true;
}

function main() {
  try {
    const pnpmVersion = readMiseToml();
    console.log(`Found pnpm version ${pnpmVersion} in mise.toml`);
    
    const updated = updatePackageJson(pnpmVersion);
    if (updated) {
      console.log(`Updated package.json packageManager to pnpm@${pnpmVersion}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { readMiseToml, updatePackageJson };