const Ajv = require('ajv');
const ajv = new Ajv();
const { TESTNETS } = require('./config');

const tokenSchema = {
  type: 'object',
  properties: {
    network: { enum: ['Ethereum', 'Meter', 'BSC', 'Ropsten', 'BSCTest', 'MeterTest', 'MoonbeamTest'] }, // enum for supported network
    address: { type: 'string', pattern: '^0x[0-9a-zA-Z]{40}$' }, // string of 0x + 40 digit/letter

    // chain-specific configs, optional
    name: { type: 'string', pattern: '^[0-9a-zA-Z._ ]{1,100}$' }, // string of 1-100 digit/letter
    symbol: { type: 'string', pattern: '^[0-9a-zA-Z]{1,9}$' }, // string of 1-9 digit/upper_letter
    decimals: { type: 'number', maximum: 20, minimum: 1 }, // number between 1-20
    native: { type: 'boolean' }, // true - native | false - ERC20
    tokenProxy: { type: 'string' }, // optional
  },
  required: ['network', 'address'],
};

const schema = {
  type: 'object',
  properties: {
    resourceID: { type: 'string', pattern: '^0x[0-9a-z]{64}$' }, // string of 0x + 64 digit/lower_letter
    testResourceID: { type: 'string', pattern: '^0x[0-9a-zA-Z]{64}$' }, // string of 0x + 64 digit/letter
    name: { type: 'string', pattern: '^[0-9a-zA-Z._ ]{1,100}$' }, // string of 1-100 digit/letter
    symbol: { type: 'string', pattern: '^[0-9a-zA-Z]{1,9}$' }, // string of 1-9 digit/upper_letter
    decimals: { type: 'number', maximum: 20, minimum: 1 }, // number between 1-20
    enable: { type: 'boolean' }, // true - enable | false - disable
    tokens: { type: 'array', items: tokenSchema, minItems: 1 },
  },
  required: ['resourceID', 'name', 'symbol', 'decimals', 'tokens'],
};

const validate = ajv.compile(schema);

const validateSchema = (jsonObj) => {
  const valid = validate(jsonObj);
  for (const t of jsonObj.tokens) {
    if (TESTNETS.includes(t.network)) {
      if (!('testResourceID' in jsonObj)) {
        return { errors: ['no testResourceID found, but tokens includes testnet configs'], valid: false };
      }
    }
  }
  return { errors: validate.errors, valid };
};

module.exports = { validateSchema };
