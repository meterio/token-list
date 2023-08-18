const fs = require('fs');
const path = require('path');
const { version } = require('../../package.json');
const {
  DATA_PATH,
  OUT_PATH_FOR_VOLTSWAP,
  getConfig,
  getImageUri,
  getAddressImagePath,
  getVoltswapAddressImagePath,
  getChainId,
} = require('../utils/config');

const { getChainConfigById } = require('../utils/schema');
const voltswapv2GenConfig = require('./gen-voltswapv2-config.json');
const { mkdirIfNeeded } = require('./common');

const genConfigForVoltswapV2 = (symbols) => {
  console.log('-'.repeat(40));
  console.log('* Start: Generate config for Voltswap V2');
  const parsed = version.split('.');
  const tokenList = [
    // {
    //   address: '0xe8876830e7cc85dae8ce31b0802313caf856886f',
    //   name: 'Wrapper Ethereum',
    //   symbol: 'WETH',
    //   decimals: 18,
    //   chainId: 83,
    //   logoURI: getImageUri('ETH')
    // },
    // {
    //   address: '0xda5f90e416a22f6f65ed586a859c8666ce6ce1d1',
    //   name: 'USDT',
    //   symbol: 'USDT',
    //   decimals: 18,
    //   chainId: 83,
    //   logoURI: getImageUri('USDT')
    // },
    // {
    //   address: '0x8ae4c669f147737085a23d578c1da94d3e39879f',
    //   name: 'USDC',
    //   symbol: 'USDC',
    //   decimals: 18,
    //   chainId: 83,
    //   logoURI: getImageUri('USDC')
    // },
  ];
  for (const sym of symbols) {
    // if (['USDT', 'USDC'].includes(sym)) {
    //   continue
    // }

    const config = getConfig(sym);

    for (const token of config.tokens) {
      const chainId = getChainId(token.network);
      if (!voltswapv2GenConfig.supportedChains.includes(chainId)) {
        continue;
      }
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

  const userConfiged = require(path.join(DATA_PATH, '..', 'voltswap-tokens', 'user-configured-tokens.json'));

  const swapTokens = {
    name: 'Voltswapv2 Default List',
    timestamp: '', //new Date().toISOString(),
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2],
    },
    tags: {},
    logoURI: '', //FIXME: ipfs logo?
    keywords: ['voltswap', 'default', 'meter'],
    tokens: tokenList.concat(userConfiged.tokens),
  };

  const outPath = path.join(OUT_PATH_FOR_VOLTSWAP, `voltswapv2-tokens.json`);
  fs.writeFileSync(outPath, JSON.stringify(swapTokens, null, 2));
  console.log(`write swap tokens config to ${outPath}`);
  console.log('* END: Generate config for Voltswap V2');
  console.log('-'.repeat(40));
  return swapTokens;
};

/**
 * place images in `voltswap-tokens`
 */
const placeImagesForVoltswapV2 = (v2Config) => {
  try {
    console.log('-'.repeat(40));
    console.log(`* Start: Place images for voltswapv2`);
    for (const token of v2Config.tokens) {
      const config = getChainConfigById(token.chainId);
      const network = String(config.enum).toLowerCase();
      const imagePath = getAddressImagePath(network, token.address);

      if (fs.existsSync(imagePath)) {
        const addressImagePath = getVoltswapAddressImagePath(network, token.address);
        mkdirIfNeeded(path.dirname(addressImagePath));
        fs.copyFileSync(imagePath, addressImagePath);
      } else {
        console.warn(`no image found: ${imagePath}, skip copying over`);
      }
    }
    console.log('* END: Place images for voltswap v2');
    console.log('-'.repeat(40));
  } catch (e) {
    console.error(`[ERROR] placeImagesForVoltswapV2: ${e.message}`, e);
  }
};

module.exports = {
  genConfigForVoltswapV2,
  placeImagesForVoltswapV2,
};
