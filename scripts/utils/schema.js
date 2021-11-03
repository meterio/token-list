const Ajv = require('ajv');
const ajv = new Ajv();

// supported chains
const CHAINS = [
  {
    enum: 'Ethereum',
    chainId: 1,
    nativeToken: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    enum: 'Ropsten',
    chainId: 3,
    testnet: true,
    nativeToken: { name: 'Ropsten Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    enum: 'BSC',
    chainId: 56,
    nativeToken: { name: 'Binance Token', symbol: 'BNB', decimals: 18 },
  },
  {
    enum: 'BSCTest',
    chainId: 97,
    testnet: true,
    nativeToken: { name: 'Test Binance Token', symbol: 'BNB', decimals: 18 },
  },
  {
    enum: 'Meter',
    chainId: 82,
    nativeToken: { name: 'Meter Stable', symbol: 'MTR', decimals: 18 },
  },
  {
    enum: 'MeterTest',
    chainId: 101,
    testnet: true,
    nativeToken: { name: 'Test Meter Stable', symbol: 'MTR', decimals: 18 },
  },
  {
    enum: 'Moonriver',
    chainId: 1285,
    nativeToken: { name: 'Moonriver', symbol: 'MOVR', decimals: 18 },
  },
  {
    enum: 'Moonbase',
    chainId: 1287,
    testnet: true,
    nativeToken: { name: 'DEV Token', symbol: 'DEV', decimals: 18 },
  },
  {
    enum: 'ThetaTest',
    chainId: 365,
    testnet: true,
    nativeToken: { name: 'Theta Fuel', symbol: 'TFUEL', decimals: 18 },
  },
  {
    enum: 'Theta',
    chainId: 361,
    nativeToken: { name: 'Theta Fuel', symbol: 'TFUEL', decimals: 18 },
  },
  {
    enum: 'Avalanche',
    chainId: 43114,
    testnet: false,
    nativeToken: { name: 'AVAX Token', symbol: 'AVAX', decimals: 18 },
  },
  {
    enum: 'VoltaTest',
    chainId: 73799,
    testnet: true,
    nativeToken: { name: 'VT Token', symbol: 'VT', decimals: 18 },
  },
  {
    enum: 'EnergyWeb',
    chainId: 246,
    nativeToken: { name: 'EWT Token', symbol: 'EWT', decimals: 18 },
  },
  {
    enum: 'Polis',
    chainId: 333999,
    nativeToken: { name: 'Polis Token', symbol: 'POLIS', decimals: 18 },
  },
];

const tokenSchema = {
  type: 'object',
  properties: {
    network: { enum: CHAINS.map((c) => c.enum) }, // enum for supported network
    address: { type: 'string', pattern: '^0x[0-9a-zA-Z]{40}$' }, // string of 0x + 40 digit/letter

    // chain-specific configs, optional
    name: { type: 'string', pattern: '^[0-9a-zA-Z._ ]{1,100}$' }, // string of 1-100 digit/letter
    symbol: { type: 'string', pattern: '^[0-9a-zA-Z.]{1,9}$' }, // string of 1-9 digit/upper_letter
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
    symbol: { type: 'string', pattern: '^[0-9a-zA-Z.]{1,9}$' }, // string of 1-9 digit/upper_letter
    decimals: { type: 'number', maximum: 20, minimum: 1 }, // number between 1-20
    enable: { type: 'boolean' }, // true - enable | false - disable
    tokens: { type: 'array', items: tokenSchema, minItems: 1 },
  },
  required: ['resourceID', 'name', 'symbol', 'decimals', 'tokens'],
};

const validate = ajv.compile(schema);

const validateSchema = (jsonObj) => {
  const valid = validate(jsonObj);
  return { errors: validate.errors, valid };
};

const getChainId = (network) => {
  const c = getChainConfig(network);
  return c ? c.chainId : -1;
};

const isTestnet = (network) => {
  const c = getChainConfig(network);
  return c ? !!c.testnet : true;
};

const getChainConfig = (network) => {
  for (const c of CHAINS) {
    if (c.enum === network.toString()) {
      return c;
    }
  }
  return undefined;
};

const getChainConfigs = () => {
  return CHAINS;
};

module.exports = { validateSchema, getChainId, isTestnet, getChainConfig, getChainConfigs };
