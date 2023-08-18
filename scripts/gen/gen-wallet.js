const fs = require('fs');
const path = require('path');
const { version } = require('../../package.json');
const { isTestnet, OUT_PATH, validateConfig, getConfig, getImageUri, getChainId } = require('../utils/config');

const coingecko = require('../coingecko.json');

const loadSupportedWalletSymbols = (basedir) => {
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
      if (config.symbol === 'ETH' || config.symbol === 'BNB') {
        console.log(`config is not enabled, but it is ${f} no skip`);
      } else {
        console.log(`config is not enabled, skip ${f}`);
        continue;
      }
    }

    symbols.push(f);
  }
  for (const sym of symbols) {
    const coinId = coingecko[sym];
    if (!coinId) {
      console.log('[WARN] please configure coinId in coingecko.json for ', sym);
    }
  }
  return symbols;
};

/**
 * generate token list for meter online wallet with given symbol array
 * @param {Array} symbols
 */
const genConfigForWallet = (symbols, chainConfigs) => {
  console.log('-'.repeat(40));
  console.log('* Start: Generate config for wallet');
  const parsed = version.split('.');
  const tokenList = [];
  let visited = {};
  for (const sym of symbols) {
    const coinId = coingecko[sym];
    // if (!coinId) {
    //   console.log('[WARN] please configure coinId in coingecko.json for ', sym);
    // }

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
    // if (!coinId) {
    //   console.log('[WARN] please configure coinId in coingecko.json for ', sym);
    // }

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
  console.log('* END: Generate config for wallet');
  console.log('-'.repeat(40));
};

module.exports = {
  loadSupportedWalletSymbols,
  genConfigForWallet,
};
