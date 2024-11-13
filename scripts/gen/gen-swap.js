const fs = require('fs');
const path = require('path');
const { version } = require('../../package.json');
const { OUT_PATH, getConfig, getImageUri, getChainId } = require('../utils/config');

/**
 * generate token list for voltswap with given symbol array
 * @param {Array} symbols
 */
const genConfigForSwap = (symbols) => {
  console.log('-'.repeat(40));
  console.log('* Start: Generate config for Swap');
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
  console.log('* END: Generate config for Swap on meter');
  console.log('-'.repeat(40));
};

/**
 * generate token list for voltswap with given symbol array
 * @param {Array} symbols
 */
const genConfigForSwapOnMeter = (symbols) => {
  console.log('-'.repeat(40));
  console.log('* Start: Generate config for Swap on meter');
  const parsed = version.split('.');
  const tokenList = [
    {
      name: 'Wrapped MTR',
      address: '0x160361ce13ec33C993b5cCA8f62B6864943eb083',
      symbol: 'WMTR',
      decimals: 18,
      chainId: 82,
      logoURI: getImageUri('MTR')
    },
  ];
  for (const sym of symbols) {
    const config = getConfig(sym);

    for (const token of config.tokens) {
      if (token.network === 'Meter') {
        const chainId = getChainId(token.network);
        const name = token.name || config.name;
        const symbol = token.symbol || config.symbol;
        tokenList.push({
          name,
          address: token.address,
          symbol,
          decimals: token.decimals || config.decimals,
          chainId,
          logoURI: getImageUri(symbol)
        });
      }
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
    tokens: tokenList,
  };

  const outPath = path.join(OUT_PATH, `meter-tokens.json`);
  fs.writeFileSync(outPath, JSON.stringify(swapTokens, null, 2));
  console.log(`write meter tokens formated with uniswap to ${outPath}`);
  console.log('* END: Generate config for Swap on meter');
  console.log('-'.repeat(40));
};

/**
 * generate token list for voltswap with given symbol array
 * @param {Array} symbols
 */
const genConfigForSwapOnMeterTest = (symbols) => {
  console.log('-'.repeat(40));
  console.log('* Start: Generate config for Swap on metertest');
  const parsed = version.split('.');
  const tokenList = [
    {
      name: 'Wrapped MTR',
      address: '0xfAC315d105E5A7fe2174B3EB1f95C257A9A5e271',
      symbol: 'WMTR',
      decimals: 18,
      chainId: 83,
      logoURI: getImageUri('MTR')
    },
  ];
  for (const sym of symbols) {
    const config = getConfig(sym);

    for (const token of config.tokens) {
      if (token.network === 'MeterTest') {
        const chainId = getChainId(token.network);
        const name = token.name || config.name;
        const symbol = token.symbol || config.symbol;
        tokenList.push({
          name,
          address: token.address,
          symbol,
          decimals: token.decimals || config.decimals,
          chainId,
          logoURI: getImageUri(symbol)
        });
      }
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
    keywords: ['voltswap', 'default', 'metertest'],
    tokens: tokenList,
  };

  const outPath = path.join(OUT_PATH, `metertest-tokens.json`);
  fs.writeFileSync(outPath, JSON.stringify(swapTokens, null, 2));
  console.log(`write meter tokens formated with uniswap to ${outPath}`);
  console.log('* END: Generate config for Swap on meter');
  console.log('-'.repeat(40));
};

module.exports = {
  genConfigForSwap,
  genConfigForSwapOnMeter,
  genConfigForSwapOnMeterTest
};
