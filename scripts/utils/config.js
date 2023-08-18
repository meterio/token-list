const fs = require('fs');
const path = require('path');
const DATA_PATH = path.join(__dirname, '..', '..', 'data');
const OUT_PATH = path.join(__dirname, '..', '..', 'generated');
const OUT_PATH_FOR_VOLTSWAP = path.join(__dirname, '..', '..', 'voltswap-tokens');
const { name } = require('../../package.json');
const HOST_URL = `https://raw.githubusercontent.com/meterio/${name}/master`;
const { getChainId, isTestnet, validateSchema, getChainConfig, getChainConfigs } = require('./schema');

const validateConfig = (sym) => {
  const isDir = fs.lstatSync(path.join(DATA_PATH, sym)).isDirectory();
  if (!isDir) {
    return { errors: `config directory not existed: ${path.join(DATA_PATH, sym)}` };
  }

  // config file
  const configPath = path.join(DATA_PATH, sym, 'config.json');
  if (!fs.existsSync(configPath)) {
    return { errors: `no config found: ${configPath}`, valid: false };
  }

  // logo file
  const logoPath = path.join(DATA_PATH, sym, 'logo.png');
  if (!fs.existsSync(configPath)) {
    return { errors: `no logo found: ${logoPath}`, valid: false };
  }

  // schema validation
  const config = require(configPath);
  const result = validateSchema(config);
  if (!result.valid) {
    return result;
  }

  // testResourceID must exist when testnet tokens is configured
  for (const t of config.tokens) {
    if (isTestnet(t.network)) {
      if (!('testResourceID' in config)) {
        return { errors: `${t.network} is a testnet, you should config 'testResourceID' as well`, valid: false };
      }
    }
  }

  return { valid: true };
};

const getConfig = (sym) => {
  return require(path.join(DATA_PATH, sym, 'config.json'));
};

const getImageUri = (sym) => {
  return `${HOST_URL}/data/${sym}/logo.png`;
};

const getImagePath = (sym) => {
  return path.join(DATA_PATH, sym, 'logo.png');
};

const getResourceImagePath = (resourceId) => {
  return path.join(OUT_PATH, 'resource-logos', `${resourceId}.png`.toLowerCase());
};

const getAddressImagePath = (network, address) => {
  return path.join(OUT_PATH, 'token-logos', network.toLowerCase(), `${address}.png`.toLowerCase());
};

const getVoltswapAddressImagePath = (network, address) => {
  return path.join(OUT_PATH_FOR_VOLTSWAP, 'logos', network.toLowerCase(), `${address}.png`.toLowerCase());
};

module.exports = {
  DATA_PATH,
  OUT_PATH,
  OUT_PATH_FOR_VOLTSWAP,
  getChainId,
  validateConfig,
  getConfig,
  getImagePath,
  getImageUri,
  getResourceImagePath,
  getAddressImagePath,
  getVoltswapAddressImagePath,
  getChainId,
  isTestnet,
  getChainConfig,
  getChainConfigs,
};
