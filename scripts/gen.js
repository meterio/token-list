const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');
const {
  isTestnet,
  DATA_PATH,
  OUT_PATH,
  validateConfig,
  getConfig,
  getImagePath,
  getImageUri,
  getAddressImagePath,
  getResourceImagePath,
  getChainId,
  getChainConfigs,
} = require('./utils/config');

const coingecko = require('./coingecko.json');

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
      console.log(`config contains less than 2 tokens, not valid for bridge skip ${sym}`);
      continue;
    }

    for (const token of config.tokens) {
      if (!(token.network in passportTokens)) {
        passportTokens[token.network] = [];
      }

      let tokenConfig = {
        address: token.address,
        name: token.name || config.name,
        symbol: token.symbol || config.symbol,
        imageUri: getImageUri(sym),
        resourceId: isTestnet(token.network) ? config.testResourceID : config.resourceID,
        native: token.native || false,
        decimals: token.decimals || config.decimals,
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
        name: token.name || config.name,
        address: token.address,
        symbol: token.symbol || config.symbol,
        decimals: token.decimals || config.decimals,
        chainId,
        logoURI: getImageUri(sym),
      });
    }
  }

  const swapTokens = {
    name: 'Voltswap Default List',
    timestamp: '', //new Date().toISOString(),
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
const genWalletTokens = (symbols, chainConfigs) => {
  const parsed = version.split('.');
  const tokenList = [];
  let visited = {};
  for (const sym of symbols) {
    const coinId = coingecko[sym];
    if (!coinId) {
      console.log('[WARN] please configure coinId in coingecko.json for ', sym);
    }

    const config = getConfig(sym);

    for (const token of config.tokens) {
      const chainId = getChainId(token.network);
      const key = `${token.network}_${token.symbol || config.symbol}`;
      if (key in visited) {
        console.log(`already visited ${key}, skip ...`);
        continue;
      }
      visited[key] = true;
      tokenList.push({
        name: token.name || config.name,
        address: token.address,
        symbol: token.symbol || config.symbol,
        decimals: token.decimals || config.decimals,
        chainId,
        logoURI: getImageUri(sym),
        coinId,
        native: token.native || false,
        resourceId: isTestnet(token.network) ? config.testResourceID : config.resourceID,
      });
    }
  }

  for (const c of chainConfigs) {
    const key = `${c.enum}_${c.nativeToken.symbol}`;
    if (key in visited) {
      console.log(`already visited ${key}, skip adding native token ...`);
      continue;
    }
    const sym = c.nativeToken.symbol;
    const coinId = coingecko[sym];
    if (!coinId) {
      console.log('[WARN] please configure coinId in coingecko.json for ', sym);
    }

    visited[key] = true;
    tokenList.push({
      name: c.nativeToken.name,
      address: '0x',
      symbol: c.nativeToken.symbol,
      decimals: c.nativeToken.decimals,
      chainId: c.chainId,
      logoURI: getImageUri(sym),
      coinId,
      native: true,
      resourceId: undefined,
    });
  }

  const walletTokens = {
    name: 'Meter Wallet Default List',
    timestamp: '', //new Date().toISOString(),
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

const chainConfigs = getChainConfigs();
genPassportTokens(symbols);
genSwapTokens(symbols);
genWalletTokens(symbols, chainConfigs);

placeImages(symbols);
