const Ajv = require('ajv');
const ajv = new Ajv();

const tokenSchema = {
  type: 'object',
  properties: {
    network: { enum: ['Ethereum', 'Meter', 'BSC', 'Ropsten', 'BSCTest', 'MeterTest', 'MoonbeamTest'] }, // enum for supported network
    name: { type: 'string', pattern: '^[0-9a-zA-Z._ ]{1,100}$' }, // string of 1-100 digit/letter
    address: { type: 'string', pattern: '^0x[0-9a-zA-Z]{40}$' }, // string of 0x + 40 digit/letter
    symbol: { type: 'string', pattern: '^[0-9a-zA-Z]{1,9}$' }, // string of 1-9 digit/upper_letter
    decimals: { type: 'number', maximum: 20, minimum: 1 }, // number between 1-20
    native: { type: 'boolean' }, // optional
    tokenProxy: { type: 'string' }, // optional
  },
  required: ['network', 'name', 'symbol', 'decimals'],
};

const schema = {
  type: 'object',
  properties: {
    resourceID: { type: 'string', pattern: '^0x[0-9a-z]{64}$' }, // string of 0x + 64 digit/lower_letter
    tokens: { type: 'array', items: tokenSchema, minItems: 1 },
  },
};

const validate = ajv.compile(schema);

const validateSchema = (jsonObj) => {
  const valid = validate(jsonObj);
  return { errors: validate.errors, valid };
};

module.exports = { validateSchema };
