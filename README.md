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
bridge Impl: 0xBd6bCac46246a7CC2308E0aE87F7794F96e33aaf
bridge Proxy: 0xa7E2cE557980618253D9dafdEDb27ecCe2F82167
erc20Handler Impl: 0x3De3826f4D28cF8bbC854C34a16753E9150422A8
erc20Handler Proxy: 0xEa31ca828F53A41bA2864FA194bb8A2d3f11C0C0
genericHandler Impl: 0xdcF3CA046171efFDC7b3dC64345F5F4258c24565
genericHandler Proxy: 0x5945432d6c0A4b30c1178888F776a4d430d5BC94
```

### On Avalanche Mainnet

```
Avalanche Contract Addresses  ID:2
================================================================
bridge Impl: 0x362eF7dC240758d60bA6C51B120B24144CE00256
bridge Proxy: 0xB447acD21831F6615e208c9EEa7E6049dB3391Cd
erc20Handler Impl: 0x3f5D4B34fBB394835457a271102e70e96f8d688E
erc20Handler Proxy: 0xeB06fa7e1d400caa3D369776Da45EbB5EbDF9b5B
genericHandler Impl: 0x4c36F9Dcd27b5fF3Fb5B687941F1AC9101f0bf22
genericHandler Proxy: 0x0B9709FE3aa76068f07d054fd4417445D5c7DA9A
```

### On Meter Mainnet    

```
Meter Contract Addresses   ID: 3
================================================================
bridge Impl: 0x2AAFcFCfD30c64870f95341d24f7d6CC5fb249CE
bridge Proxy: 0x23894d2937A2a4A479f0407909DA5B028049568E
erc20Handler Impl: 0xcD774447B43b867AE18E28F0f52a1b47fD19eD48
erc20Handler Proxy: 0x139d9B458AcDA76457DD99DB3A6a36ca9Cb3bbf1
genericHandler Impl: 0xde9f813D51d25797A89BdE8AdB32977A795A25F6
genericHandler Proxy: 0x701627e8638c452732eceCC7d0238746654fb365
```

### On BSC Mainnet

```
BSC Contract Addresses  ID: 4
================================================================
bridge Impl: 0x251bA644FF3ffdE20F51F3A490b38D859395320c
bridge Proxy: 0x8209815136b35F21B8C0f5AA2E2f915a73530dF9
erc20Handler Impl: 0x92b57fDb0510D823c339a4Da8ADbeb30AAc5a585
erc20Handler Proxy: 0x83354D47379881e167F7160A80dAC8269Fe946Fa
genericHandler Impl: 0xC13851900912b4E03398549727f2Ab8103DB1DcA
genericHandler Proxy: 0x431a7Bb43b6242225Ceb97Bde140219b4d043116
```

### On Moonriver Mainnet

```
Moonriver Contract Addresses  ID: 5
================================================================
bridge Impl: 0xb0Fee53454da3b177ead11B72aCd5fB5bAF04a65
bridge Proxy: 0x44F0f7F2bA1C077d27D83b22147744E04874B3a7
erc20Handler Impl: 0xfbb865Ae1B38Cc70f4FFe615A8BBF854D63EaEeA
erc20Handler Proxy: 0xB1eFA941D6081afdE172e29D870f1Bbb91BfABf7
genericHandler Impl: 0xcb5a16Dd66D6b25Be8C0BFeA3C3626BB85E6cb7a
genericHandler Proxy: 0x407ad164AB718CEdc863fB34EB64f9048A727c8C
```

### On Theta Mainnet

```
Theta Contract Addresses  ID: 6
================================================================
bridge Impl: 0x27cb6903663c5b9E3667dA8f3815ad6A19499D55
bridge Proxy: 0x1a073fDCc6D9b7eAEc218FE47566Faa85326967D
erc20Handler Impl: 0x780E38B2ec924e134913063C740fad80FD21534F
erc20Handler Proxy: 0xe1c892A6cE33cB31c100369aA6fC302d7B96254a
genericHandler Impl: 0x4c0644a273B81dfCa56ca298712bB0f1b88b27c3
genericHandler Proxy: 0xAb2d0C8122BD0f455EF781BdB91849B7F5A02d57
```

### On Moonbeam

```
Moonbeam Contract Addresses  ID: 9
================================================================
bridge Impl: 0x2E8fC3D4399C9c775746469412B344716471E940
bridge Proxy: 0xc9796B65555B18Fe06a071B9F1ff26b76A4823eC
erc20Handler Impl: 0x9C3DeFbf878649e1b2b4EfF49d14c4a91E26a35a
erc20Handler Proxy: 0x766E33b910Cd6329a0cBD5F72e48Ec162E38A25D
genericHandler Impl: 0x59c14158Be9146AbAbB4757E188A43d01f1Ec01a
genericHandler Proxy: 0xeDBd736c3614a5E9DaCeC92dA0340F1381b954a1
```

### On Polygon Matic

```
Polygon Contract Addresses  ID: 10
================================================================
bridge Impl: 0x362eF7dC240758d60bA6C51B120B24144CE00256
bridge Proxy: 0xB447acD21831F6615e208c9EEa7E6049dB3391Cd
erc20Handler Impl: 0x3f5D4B34fBB394835457a271102e70e96f8d688E
erc20Handler Proxy: 0xeB06fa7e1d400caa3D369776Da45EbB5EbDF9b5B
genericHandler Impl: 0x4c36F9Dcd27b5fF3Fb5B687941F1AC9101f0bf22
genericHandler Proxy: 0x0B9709FE3aa76068f07d054fd4417445D5c7DA9A
```

### On Base

```
Polygon Contract Addresses  ID: 11
================================================================
bridge Impl: 0x911F32FD5d347b4EEB61fDb80d9F1063Be1E78E6
bridge Proxy: 0xB3a128242e23AA80C37D14dB2d577727a1Fd4608
erc20Handler Impl: 0x8B7176Db605B801663f745472D8Ba89ce41d75CA
erc20Handler Proxy: 0x880009982273e6560B75F6E30174E48B503c9747
genericHandler Impl: 0x92D144A99bD3aB1177B8Df600769Ad5422DE7819
genericHandler Proxy: 0xFEDAD08Ba2219489F3090ff118AC9E8b040C8Ad7
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
