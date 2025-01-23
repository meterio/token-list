const fs = require('fs');
const path = require('path');
const { isTestnet, OUT_PATH, getConfig, getImageUri } = require('../utils/config');
const { mkdirIfNeeded } = require('./common');

const coingecko = require('../coingecko.json');

const DisabledToken = {
  Meter: ['VOLT', 'BUSD.bsc', 'TIG', 'BBT'],
  BSC: ['DAI.bsc', 'BUSD'],
  Moonriver: ['BUSD.bsc', 'USDC', 'USDT'],
  Theta: ['VOLT', 'BUSD.bsc'],
  Moonbeam: ['BUSD.bsc', 'USDC', 'USDT'],
  Polygon: ['TIG'],
  Arbitrum: ['TIG']
}

/**
 * generate token list for meter passport with given symbol array
 * @param {Array} symbols
 */
const genConfigForPassport = (symbols) => {
  console.log('-'.repeat(40));
  console.log('* Start: Generate config for Passport');
  const passportTokens = {};
  for (const sym of symbols) {
    const coinId = coingecko[sym];
    // if (!coinId) {
    //   console.log('[WARN] please configure coinId in coingecko.json for ', sym);
    // }

    const config = getConfig(sym);

    // tokens must have more than 1 tokens to be effective on bridge
    if (config.tokens.length < 2) {
      // console.log(`config contains less than 2 tokens, not valid for bridge skip ${sym}`);
      continue;
    }

    for (const token of config.tokens) {
      if (!(token.network in passportTokens)) {
        passportTokens[token.network] = [];
      }
      const disabledToken = DisabledToken[token.network];
      const symbol = token.symbol || config.symbol;
      if (disabledToken && disabledToken.includes(symbol)) {
        continue;
      }
      let tokenConfig = {
        address: token.address,
        name: token.name || config.name,
        symbol,
        imageUri: getImageUri(sym),
        resourceId: isTestnet(token.network) ? config.testResourceID : config.resourceID,
        native: token.native || false,
        decimals: token.decimals || config.decimals,
        tokenProxy: token.tokenProxy || undefined,
        coinId,
        rank: config.rank
      };
      passportTokens[token.network].push(tokenConfig);
    }
  }

  for (const net of Object.keys(passportTokens)) {
    passportTokens[net] = passportTokens[net].sort((a, b) => {
      const rankA = a.rank || 0
      const rankB = b.rank || 0
      return rankB - rankA
    }).map(t => {
      delete t.rank
      return t
    })
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
  console.log('* END: Generate config for Passport');
  console.log('-'.repeat(40));
};

module.exports = {
  genConfigForPassport,
};
