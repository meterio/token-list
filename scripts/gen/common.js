const fs = require('fs');
const path = require('path');
const {
  validateConfig,
  getConfig,
  getImagePath,
  getResourceImagePath,
  getAddressImagePath,
} = require('../utils/config');
const coingecko = require('../coingecko.json');

const loadSupportedSymbols = (basedir) => {
  console.log('-'.repeat(40));
  console.log('* Start: Load supported symbols');
  const files = fs.readdirSync(basedir);
  let symbols = [];
  for (const f of files) {
    const result = validateConfig(f);
    if (!result.valid) {
      console.log(`validation failed for ${f}:`, result.errors);
      continue;
    }

    const config = getConfig(f);

    // make sure config is enabled
    if ('enable' in config && !config.enable) {
      console.log(`config not enabled, skip ${f}`);
      continue;
    }

    symbols.push(f);
  }
  for (const sym of symbols) {
    const coinId = coingecko[sym];
    if (!coinId) {
      console.log('[WARN] please configure coinId in coingecko.json for ', sym);
    }
  }
  console.log('* END: Load supported symbols');
  console.log('-'.repeat(40));
  return symbols;
};

const mkdirIfNeeded = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * place images in `resource-logos` and `token-logos`
 */
const placeImages = (symbols) => {
  try {
    console.log('-'.repeat(40));
    console.log('* Start: Place images in generated folder');
    for (const sym of symbols) {
      const config = getConfig(sym);
      const imagePath = getImagePath(sym);
      const resourceImagePath = getResourceImagePath(config.resourceID);
      mkdirIfNeeded(path.dirname(resourceImagePath));
      fs.copyFileSync(imagePath, resourceImagePath);

      for (const token of config.tokens) {
        const addressImagePath = getAddressImagePath(token.network, token.address);
        mkdirIfNeeded(path.dirname(addressImagePath));
        fs.copyFileSync(imagePath, addressImagePath);
      }

      // for (const token of config.tokens) {
      //   const addressImagePath = getVoltswapAddressImagePath(token.network, token.address);
      //   mkdirIfNeeded(path.dirname(addressImagePath));
      //   fs.copyFileSync(imagePath, addressImagePath);
      // }
    }
    console.log('* END: Place images in generated folder');
    console.log('-'.repeat(40));
  } catch (e) {
    console.error(`[ERROR] placeImages: ${e.message}`);
  }
};

module.exports = {
  mkdirIfNeeded,
  loadSupportedSymbols,
  placeImages,
};
