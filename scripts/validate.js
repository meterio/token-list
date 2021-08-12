const path = require('path');
const { validateConfig } = require('./utils/config');

if (process.argv.length < 3) {
  console.log('usage: node scripts/validate.js [token symbol]');
  return;
}
const sym = process.argv[2].toUpperCase();
console.log(`Validating ${sym}`);

const result = validateConfig(sym);
if (result.errors) {
  console.log('Validation failed, errors:', result.errors);
} else {
  console.log('Validation passed.');
}
