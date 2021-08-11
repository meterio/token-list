const path = require('path');
const { validateSchema } = require('./utils/schema');

if (process.argv.length < 3) {
  console.log('usage: node scripts/validate.js [token name]');
  return;
}
const tokenName = process.argv[2].toUpperCase();
console.log(`Validating ${tokenName}`);

const config = require(path.join(__dirname, '..', 'data', tokenName, 'config.json'));

const result = validateSchema(config);
if (result.errors) {
  console.log('Validation failed, errors:', result.errors);
} else {
  console.log('Validation passed.');
}
