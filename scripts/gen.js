const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');
const {
  TESTNETS,
  DATA_PATH,
  OUT_PATH,
  validateConfig,
  getConfig,
  getImagePath,
  getImageUri,
  getAddressImagePath,
  getResourceImagePath,
  getChainId,
} = require('./utils/config');

const loadSupportedSymbols = (basedir) => {
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
      console.log(`config is not enabled, skip ${f}`);
      continue;
    }

    symbols.push(f);
  }
  return symbols;
};

const mkdirIfNeeded = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * generate token list for meter passport with given symbol array
 * @param {Array} symbols
 */
const genPassportTokens = (symbols) => {
  const passportTokens = {};
  for (const sym of symbols) {
    const config = getConfig(sym);

    // tokens must have more than 1 tokens to be effective on bridge
    if (config.tokens.length < 2) {
      console.log(`config contains less than 2 tokens, not valid for bridge skip ${f}`);
      continue;
    }

    for (const token of config.tokens) {
      if (!(token.network in passportTokens)) {
        passportTokens[token.network] = [];
      }

      const isTestnet = TESTNETS.includes(token.network);

      let tokenConfig = {
        address: token.address,
        name: token.name || config.name,
        symbol: token.symbol || config.symbol,
        imageUri: getImageUri(sym),
        resourceId: isTestnet ? config.testResourceID : config.resourceID,
        native: token.native || false,
        nativeDecimals: token.native ? token.decimals : undefined,
        tokenProxy: token.tokenProxy || undefined,
      };
      passportTokens[token.network].push(tokenConfig);
    }
  }

  const chainConfigDir = path.join(OUT_PATH, 'chain-configs');
  mkdirIfNeeded(chainConfigDir);
  for (const chain in passportTokens) {
    const filepath = path.join(chainConfigDir, `${chain}.json`.toLowerCase());
    fs.writeFileSync(filepath, JSON.stringify(passportTokens[chain], null, 2));
    console.log(`write chain config to ${filepath}`);
  }

  const outPath = path.join(OUT_PATH, `passport-tokens.json`);
  fs.writeFileSync(outPath, JSON.stringify(passportTokens, null, 2));
  console.log(`write passport tokens config to ${outPath}`);
};

/**
 * generate token list for voltswap with given symbol array
 * @param {Array} symbols
 */
const genSwapTokens = (symbols) => {
  const parsed = version.split('.');
  const tokenList = [];
  for (const sym of symbols) {
    const config = getConfig(sym);

    for (const token of config.tokens) {
      const chainId = getChainId(token.network);
      tokenList.push({
        name: config.name || token.name,
        address: token.address,
        symbol: config.symbol || token.symbol,
        decimals: config.decimals || token.decimals,
        chainId,
        logoURI: getImageUri(sym),
      });
    }
  }

  const swapTokens = {
    name: 'Voltswap Default List',
    timestamp: new Date().toISOString(),
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2],
    },
    tags: {},
    logoURI: '', //FIXME: ipfs logo?
    keywords: ['voltswap', 'default', 'meter'],
    tokens: tokenList
      .filter((t) => t.chainId > 0)
      .sort((t1, t2) => {
        if (t1.chainId === t2.chainId) {
          return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
        }
        return t1.chainId < t2.chainId ? -1 : 1;
      }),
  };

  const outPath = path.join(OUT_PATH, `swap-tokens.json`);
  fs.writeFileSync(outPath, JSON.stringify(swapTokens, null, 2));
  console.log(`write swap tokens config to ${outPath}`);
};

/**
 * generate token list for meter online wallet with given symbol array
 * @param {Array} symbols
 */
const genWalletTokens = (symbols) => {
  const parsed = version.split('.');
  const tokenList = [];
  for (const sym of symbols) {
    const config = getConfig(sym);

    for (const token of config.tokens) {
      const chainId = getChainId(token.network);
      tokenList.push({
        name: config.name || token.name,
        address: token.address,
        symbol: config.symbol || token.symbol,
        decimals: config.decimals || token.decimals,
        chainId,
        logoURI: getImageUri(sym),
      });
    }
  }

  const walletTokens = {
    name: 'Meter Wallet Default List',
    timestamp: new Date().toISOString(),
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2],
    },
    keywords: ['voltswap', 'default', 'meter'],
    tokens: tokenList
      .filter((t) => t.chainId > 0)
      .sort((t1, t2) => {
        if (t1.chainId === t2.chainId) {
          return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
        }
        return t1.chainId < t2.chainId ? -1 : 1;
      }),
  };

  const outPath = path.join(OUT_PATH, `wallet-tokens.json`);
  fs.writeFileSync(outPath, JSON.stringify(walletTokens, null, 2));
  console.log(`write wallet tokens config to ${outPath}`);
};

/**
 * place images in `resource-logos` and `token-logos`
 */
const placeImages = (symbols) => {
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
  }
};

const symbols = loadSupportedSymbols(DATA_PATH);
console.log(symbols);

genPassportTokens(symbols);
genSwapTokens(symbols);
genWalletTokens(symbols);

placeImages(symbols);
