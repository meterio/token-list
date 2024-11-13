const { DATA_PATH, getChainConfigs } = require('../utils/config');

const { loadSupportedSymbols, placeImages } = require('./common');
const { loadSupportedWalletSymbols, genConfigForWallet } = require('./gen-wallet');
const { genConfigForPassport } = require('./gen-passport');
const { genConfigForSwap, genConfigForSwapOnMeter, genConfigForSwapOnMeterTest } = require('./gen-swap');
const { genConfigForVoltswapV2, placeImagesForVoltswapV2 } = require('./gen-voltswapv2');

const symbols = loadSupportedSymbols(DATA_PATH);
const chainConfigs = getChainConfigs();

// generate config for wallet
// const walletSymbols = loadSupportedWalletSymbols(DATA_PATH);
// genConfigForWallet(walletSymbols, chainConfigs);

// // generate config for passport
// genConfigForPassport(symbols);

// // generate config for voltswap v1
// genConfigForSwap(symbols);
// genConfigForSwapOnMeter(symbols);
genConfigForSwapOnMeterTest(symbols);

// place images in `generated` folder
// placeImages(symbols);

// // generate config for voltswap v2
// const voltswapv2Config = genConfigForVoltswapV2(symbols);
// placeImagesForVoltswapV2(voltswapv2Config);
