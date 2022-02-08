# Token List for Meter Ecosystem (Passport, Voltswap, Wallet)

## Supported Networks

| Network Name        | Enum      | ChainID hex | ChainID decimal |
| ------------------- | --------- | ----------- | --------------- |
| Ethereum            | Ethereum  | 0x1         | 1               |
| Ropsten             | Ropsten   | 0x3         | 3               |
| Binance Smart Chain | BSC       | 0x36        | 56              |
| Binance Smart Chain | BSCTest   | 0x61        | 97              |
| Meter               | Meter     | 0x52        | 82              |
| Meter Testnet       | MeterTest | 0x65        | 101             |
| Theta Testnet       | ThetaTest | 0x16d       | 365             |
| Moonbeam            | Moonbeam  | 0x504       | 1284            |
| Moonriver           | Moonriver | 0x505       | 1285            |
| Moonbeam Testnet    | Moonbase  | 0x507       | 1287            |
| Avalanche Network   | Avalanche | 0xa86a      | 43114           |

## Integrating a new ERC20 token to Meter Passport

> You will also have to add ERC20 token addresses, name and decimals in various networks for your token. We could deploy a standard ERC20 wrapper token for you or you could deploy your own ERC20 contract. If you deploy your own token in different network, we recommend you to use the same private key and nonce as the contract in the original network. This ensures the contract address the same as the original network and make it easier for the users to identify.

This repository is created to simplify the process of adding new ERC20 tokens to [Meter Passport](https://passport.meter.io).

Projects could either use Meter team created ERC20 wrapped tokens or deploy their own ERC20 token contracts on the destination networks. If projects deploy their own contracts, please make sure to use include the minter burner extension of the open zepplin implementation like the [following](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol), passport uses the `mint` and `burnFrom` functions in the destination chain.

Once the tokens on the destination networks are created, please use the following instructions to submit the pull request for including your tokens in Meter Passport.

Only the files under the `data` directory have to be modified manually. Please submit a pull request to the files under the `data` directory only. We will update the rest with the scripts.

Please take the following steps:

1. Create token config folder
   Create a folder under `data` directory, and name it with token symbol. Put token config file `config.json` and **256x256** token logo `logo.png` inside this folder. For example, to add a `FOO` token, create the following file structure:

```
- data
  |-- FOO
       |-- config.json
       |-- logo.png
```

2. Calculate resourceID
   Create a new entry with `resourceID`
   The resourceID is used for identifying a token in Meter passport. The naming convention for `resource ID` is based on the ERC20 contract address of the asset in its origin network (for example Ethereum), with 01 as surfix (represent version number) and 0 as prefix to make the total length of the resource ID to be 32 bytes. Please make sure all the letters in the address has to be **lower case**.

A sample resource ID for `USDT` on Ethereum network (token address: `0xdAC17F958D2ee523a2206206994597C13D831ec7`)

```
0000000000000000000000   dac17f958d2ee523a2206206994597c13d831ec7   01
<-----padding 0------>   <-----token address in lower case------>   <-suffix->
```

#### NOTICE

if you do need to add the token, but not having resourceID assigned yet. Please give it an special value of `0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff` to indicate this situation for generator.

3. prepare `config.json`

Put your ERC20 information in `config.json`, for each network, create one entry in `tokens` list and set values. The fields that could be configured in `config.json` is defined with a ajv schema like this (as defined in [schema.js](./scripts/utils/schema.js)):

```js
// supported chains
const CHAINS = [
  {
    enum: 'Ethereum',
    chainId: 1,
    nativeToken: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    enum: 'Ropsten',
    chainId: 3,
    testnet: true,
    nativeToken: { name: 'Ropsten Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    enum: 'BSC',
    chainId: 56,
    nativeToken: { name: 'Binance Token', symbol: 'BNB', decimals: 18 },
  },
  {
    enum: 'BSCTest',
    chainId: 97,
    testnet: true,
    nativeToken: { name: 'Test Binance Token', symbol: 'BNB', decimals: 18 },
  },
  {
    enum: 'Meter',
    chainId: 82,
    nativeToken: { name: 'Meter Stable', symbol: 'MTR', decimals: 18 },
  },
  {
    enum: 'MeterTest',
    chainId: 101,
    testnet: true,
    nativeToken: { name: 'Test Meter Stable', symbol: 'MTR', decimals: 18 },
  },
  {
    enum: 'Moonbase',
    chainId: 1287,
    testnet: true,
    nativeToken: { name: 'DEV Token', symbol: 'DEV', decimals: 18 },
  },
  {
    enum: 'ThetaTest',
    chainId: 365,
    testnet: true,
    nativeToken: { name: 'Theta Fuel', symbol: 'TFUEL', decimals: 18 },
  },
];

const tokenSchema = {
  type: 'object',
  properties: {
    network: { enum: CHAINS.map((c) => c.enum) }, // enum for supported network
    address: { type: 'string', pattern: '^0x[0-9a-zA-Z]{40}$' }, // string of 0x + 40 digit/letter

    // chain-specific configs, optional
    name: { type: 'string', pattern: '^[0-9a-zA-Z._ ]{1,100}$' }, // string of 1-100 digit/letter
    symbol: { type: 'string', pattern: '^[0-9a-zA-Z.]{1,9}$' }, // string of 1-9 digit/upper_letter
    decimals: { type: 'number', maximum: 20, minimum: 1 }, // number between 1-20
    native: { type: 'boolean' }, // true - native | false - ERC20
    tokenProxy: { type: 'string' }, // optional
  },
  required: ['network', 'address'],
};

const schema = {
  type: 'object',
  properties: {
    resourceID: { type: 'string', pattern: '^0x[0-9a-z]{64}$' }, // string of 0x + 64 digit/lower_letter
    testResourceID: { type: 'string', pattern: '^0x[0-9a-zA-Z]{64}$' }, // string of 0x + 64 digit/letter
    name: { type: 'string', pattern: '^[0-9a-zA-Z._ ]{1,100}$' }, // string of 1-100 digit/letter
    symbol: { type: 'string', pattern: '^[0-9a-zA-Z.]{1,9}$' }, // string of 1-9 digit/upper_letter
    decimals: { type: 'number', maximum: 20, minimum: 1 }, // number between 1-20
    enable: { type: 'boolean' }, // true - enable | false - disable
    tokens: { type: 'array', items: tokenSchema, minItems: 1 },
  },
  required: ['resourceID', 'name', 'symbol', 'decimals', 'tokens'],
};
```

4. Validate your config.json by

```bash
npm install
node scripts/validate.js [your-token-symbol]
# if validation failed, it will list out errors
```

5. Add the ERC20 handler contract address as the only minter and burner for the new ERC20 tokens outside the home networks. This allows Passport to mint a new token the destination network when a token is locked in the home network. Please do not mint new tokens outside the home network without going through the relayer, this may cause the number of circulating tokens unbalanced on both side of the bridge.

6. If your token has none standard ERC20 features like different decimals, rebasing features and etc, please inquire in our [discord channel](https://discordapp.com/invite/WPjTpMG).

7. If your token is new, you need add its coinId in /scripts/coingecko.json file, you can get the id by the url [coingecko api](https://api.coingecko.com/api/v3/coins/list)

## Deployed contracts on various networks

### On Ethereum Mainnets

```
ETH Contract Addresses  ID:1
================================================================
Bridge:             0xad5bAC300E311169F8223484f242d43C627eCa30
Erc20 Handler:      0xde4fC7C3C5E7bE3F16506FcC790a8D93f8Ca0b40
Generic Handler:    0x517828d2549cEC09386f89a67E92825E26740240
```

### On Avalanche Mainnet

```
Avalanche Contract Addresses  ID:2
================================================================
Bridge:             0xa2De4F2cC54dDFdFb7D27E81b9b9772bd45bf89d
Erc20 Handler:      0x48A6fd66512D45006FC0426576c264D03Dfda304
Generic Handler:    0x123455360bE78C9289B38bcb4DbA427D9a6cD440
```

### On Meter Mainnet    

```
Meter Contract Addresses   ID: 3
================================================================
Bridge:             0x48F755280FD5f1e0C4CD2fb09415c37f78F79f40
Erc20 Handler:      0x60f1ABAa3ED8A573c91C65A5b82AeC4BF35b77b8
Generic Handler:    0x89CA53Bf11d24D32A7aC3aDb7750868360c90590
```

### On BSC Mainnet

```
BSC Contract Addresses  ID: 4
================================================================
Bridge:             0x533d4eD31C3f18B9c8125875bA1588D0f7d86Cb3
Erc20 Handler:      0x5945241BBB68B4454bB67Bd2B069e74C09AC3D51
Generic Handler:    0x83Fc24eB56121FA2A05e0b5170E7310738425839
```

### On Moonriver Mainnet

```
Moonriver Contract Addresses  ID: 5
================================================================
Bridge:             0x04177A22494d8865c3E5D09BEe0490882b737838
Erc20 Handler:      0x48A6fd66512D45006FC0426576c264D03Dfda304
Generic Handler:    0x29E9fDF5933824ad21Bc6dbb8BF156EFA3735e32
```

### On Theta Mainnet

```
Theta Contract Addresses  ID: 6
================================================================
Bridge:             0x407ad164AB718CEdc863fB34EB64f9048A727c8C
Erc20 Handler:      0x48A6fd66512D45006FC0426576c264D03Dfda304
Generic Handler:    0x123455360bE78C9289B38bcb4DbA427D9a6cD440
```

### On Polis Mainnet

```
Polis Contract Addresses ID: 7
================================================================
Bridge:             0xF41e7FC4eC990298d36f667B93951c9dba65224e
Erc20 Handler:      0x911F32FD5d347b4EEB61fDb80d9F1063Be1E78E6
Generic Handler:    0x123455360bE78C9289B38bcb4DbA427D9a6cD440
```

### On EnergyWeb Mainnet
```
Polis Contract Addresses ID: 8
================================================================
Bridge:             0xe8Be16465839302aCeAdb99CfDB5c68C09CDeb08
Erc20 Handler:      0x48A6fd66512D45006FC0426576c264D03Dfda304
Generic Handler:    0x123455360bE78C9289B38bcb4DbA427D9a6cD440
```

### On Moonbeam

```
Moonbeam Contract Addresses  ID: 9
================================================================
Bridge:             0xa53cC329AD9555c51F02f37b3cC93a2be4a166Be
Erc20 Handler:      0x911F32FD5d347b4EEB61fDb80d9F1063Be1E78E6
Generic Handler:    0xB3a128242e23AA80C37D14dB2d577727a1Fd4608
```

### On Ethereum Ropsten

```
ETH Ropsten Contract Addresses
================================================================
Bridge:             0x7Be5166449EE607a8Cd2BE6AF4120880b163668d
Erc20 Handler:      0xC56065ee94eD4d05360e130075Dd06DE55eE0916
Generic Handler:    0xBAb8402E278F45d51BB342525716611fE1090027
```

### On Meter Warringstakes Testnet

```
Meter Warringstakes Contract Address:
================================================================
Bridge:             0x79F0aAc7F2234eae45cA4161470a65E89EC8C513
Erc20 Handler:      0x73BBF74df1c58903132CD4aa0e268C79f10aB042
Generic Handler:    0x56f03E0B73fa6Ff6704CA399CE88282EDcF9FeEA
```

### On BSC Testnet

```
BSC Testnet Contract Addresses
================================================================
Bridge:             0x15cf8FD3d7Cd83fE9a17f15322F4e95D30b3C880
Erc20 Handler:      0xEc239B20C6d93CE22316F807F898d0C9fA67E3D6
Generic Handler:    0xb264Cf6be02f17BF638Cd59F63C68Ec3036b32b5
```


### On Moonbase Alpha Testnet

```
Moonbase Testnet Contract Addresses
================================================================
Bridge:             0x98eC243B9C8FFD4FaccAa4669e172b1266346b5c
Erc20 Handler:      0xe4Fd0BC0601d1f4E042e93D28C6A429B26dF1457
Generic Handler:    0x26c61e08d6fd620420079ED4B90Ec4a99c6bCEaa
```

### On Theta Testnet

```
Theta Testnet Contract Addresses
================================================================
Bridge:             0xc37518bCa208BEb992804baa0ccAD935882A432c
Erc20 Handler:      0x387791781A5A9cB1C491E30F19CFD4c7741e5216
Generic Handler:    0x24bB4c53EeDb777fa1ba78d953941567170Cd3a1
```

## Generate configs

```bash
npm install
npm start
```

## Generated Folder Structure

```
 -- generated
   |-- chain-configs (token configs for various chain)
   |    |-- ethereum.json
   |    |-- ...
   |
   |-- resource-logos (logo files with resource id)
   |    |-- [resource-id].png
   |    |-- ...
   |
   |-- token-logos (logo files with token address)
   |    |-- [token-address].png
   |    |-- ...
   |
   |-- passport-tokens.json (token list for meter passport)
   |-- swap-tokens.json (token list for voltswap)
   |-- wallet-tokens.json (token list for wallet)
 -- scripts
   |-- coingecho.json (coinId for tokens)
   |-- ...

```
