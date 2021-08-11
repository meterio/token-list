const fs = require('fs');
const path = require('path');
const { validateSchema } = require('./utils/schema');

const HOST_URL = 'https://raw.githubusercontent.com/meterio/bridge-tokens/master';

const DATA_PATH = path.join(__dirname, '..', 'data');
const OUT_PATH = path.join(__dirname, '..', 'generated');

const loadSupportedSymbols = (basedir) => {
  const files = fs.readdirSync(basedir);
  let symbols = [];
  for (const f of files) {
    // skip files that are not directories
    const isDir = fs.lstatSync(path.join(basedir, f)).isDirectory();
    if (!isDir) {
      continue;
    }

    const isUpper = f.toUpperCase() === f;
    if (!isUpper) {
      console.log(`invalid token symbol, skip ${f}`);
      continue;
    }

    // validate if config exists
    const configPath = path.join(basedir, f, 'config.json');
    if (!fs.existsSync(configPath)) {
      console.log(`could not find config: ${configPath}, skip ${f}`);
      continue;
    }
    // validate config
    const config = require(configPath);
    const configValid = validateSchema(config);
    if (!configValid) {
      console.log(`config schema is not valid, skip ${f}`);
    }

    // validte if logo exists
    const logoPath = path.join(basedir, f, 'logo.png');
    if (!fs.existsSync(logoPath)) {
      console.log(`could not find logo: ${logoPath}, skip ${f}`);
      continue;
    }

    symbols.push(f);
  }
  return symbols;
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

const generateChainConfig = (symbols) => {
  const chainConfigs = {};
  for (const sym of symbols) {
    const config = getConfig(sym);
    for (const token of config.tokens) {
      if (!(token.network in chainConfigs)) {
        chainConfigs[token.network] = [];
      }

      let tokenConfig = {
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        imageUri: getImageUri(sym),
        resourceId: config.resourceID,
        native: token.native || false,
        nativeDecimals: token.native ? token.decimals : undefined,
        tokenProxy: token.tokenProxy || undefined,
      };
      chainConfigs[token.network].push(tokenConfig);
    }
  }

  for (const chain in chainConfigs) {
    const filepath = path.join(OUT_PATH, `${chain}.json`.toLowerCase());
    fs.writeFileSync(filepath, JSON.stringify(chainConfigs[chain], null, 2));
    console.log(`write chain config to ${filepath}`);
  }

  const mergedPath = path.join(OUT_PATH, `merged.json`);
  fs.writeFileSync(mergedPath, JSON.stringify(chainConfigs, null, 2));
  console.log(`write merged config to ${mergedPath}`);
};

/**
 * copy logo from resource-logos to destDir
 */
const placeImages = (symbols) => {
  for (const sym of symbols) {
    const config = getConfig(sym);
    const imagePath = getImagePath(sym);
    const resourceImagePath = getResourceImagePath(config.resourceID);
    if (!fs.existsSync(path.dirname(resourceImagePath))) {
      fs.mkdirSync(path.dirname(resourceImagePath), { recursive: true });
    }
    fs.copyFileSync(imagePath, resourceImagePath);

    for (const token of config.tokens) {
      const addressImagePath = getAddressImagePath(token.network, token.address);
      if (!fs.existsSync(path.dirname(addressImagePath))) {
        fs.mkdirSync(path.dirname(addressImagePath), { recursive: true });
      }
      fs.copyFileSync(imagePath, addressImagePath);
    }
  }
};

const symbols = loadSupportedSymbols(DATA_PATH);
console.log(symbols);

generateChainConfig(symbols);

placeImages(symbols);
