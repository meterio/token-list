# Token definitions for Meter Passport

## Supported Networks

| Network Name        | Enum         | ChainID hex | ChainID decimal |
| ------------------- | ------------ | ----------- | --------------- |
| Ethereum            | Ethereum     | 0x1         | 1               |
| Ropsten             | Ropsten      | 0x3         | 3               |
| Binance Smart Chain | BSC          | 0x36        | 56              |
| Binance Smart Chain | BSCTest      | 0x61        | 97              |
| Meter               | Meter        | 0x52        | 82              |
| Meter Testnet       | MeterTest    | 0x65        | 101             |
| Moonbeam Testnet    | MoonbeamTest | 0x507       | 1287            |

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

3. prepare `config.json`

Put your ERC20 information in `config.json`, for each network, create one entry in `tokens` list and set values. The fields that could be configured in `config.json` is defined with a ajv schema like this:

```js
const tokenSchema = {
  type: 'object',
  properties: {
    network: { enum: ['Ethereum', 'Meter', 'BSC', 'Ropsten', 'BSCTest', 'MeterTest', 'MoonbeamTest'] }, // enum for supported network
    address: { type: 'string', pattern: '^0x[0-9a-zA-Z]{40}$' }, // string of 0x + 40 digit/letter

    // chain-specific configs, optional
    name: { type: 'string', pattern: '^[0-9a-zA-Z._ ]{1,100}$' }, // string of 1-100 digit/letter
    symbol: { type: 'string', pattern: '^[0-9a-zA-Z]{1,9}$' }, // string of 1-9 digit/upper_letter
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
    symbol: { type: 'string', pattern: '^[0-9a-zA-Z]{1,9}$' }, // string of 1-9 digit/upper_letter
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

## Deployed contracts on various networks

### On Ethereum Mainnets

```
ETH Contract Addresses
================================================================
Bridge:             0xbD515E41DF155112Cc883f8981CB763a286261be
Erc20 Handler:      0xde4fC7C3C5E7bE3F16506FcC790a8D93f8Ca0b40
Generic Handler:    0x517828d2549cEC09386f89a67E92825E26740240
```

### On Meter Mainnet

```
Meter Contract Addresses
================================================================
Bridge:             0x7C6Fb3B4a23BD9b0c2874bEe4EF672C64e83838B
Erc20 Handler:      0x60f1ABAa3ED8A573c91C65A5b82AeC4BF35b77b8
Generic Handler:    0x89CA53Bf11d24D32A7aC3aDb7750868360c90590
```

### On BSC Mainnet

```
BSC Contract Addresses
================================================================
Bridge:             0x223fafbc2cA53A75CcfF5B2369128d3d1a828F36
Erc20 Handler:      0x5945241BBB68B4454bB67Bd2B069e74C09AC3D51
Generic Handler:    0x83Fc24eB56121FA2A05e0b5170E7310738425839
```

### On Ethereum Ropsten

```
ETH Ropsten Contract Addresses
================================================================
Bridge:             0x6fC272eD9B6B947a7858DF30D7DD2D8173306EA8
Erc20 Handler:      0xC56065ee94eD4d05360e130075Dd06DE55eE0916
Generic Handler:    0xBAb8402E278F45d51BB342525716611fE1090027
```

### On Meter Warringstakes Testnet

```
Meter Warringstakes Contract Address:
================================================================
Bridge:             0x4E68f5f704878e69AF9d58D5616168d69f1D03e4
Erc20 Handler:      0x73BBF74df1c58903132CD4aa0e268C79f10aB042
Generic Handler:    0x56f03E0B73fa6Ff6704CA399CE88282EDcF9FeEA
```

### On BSC Testnet

```
BSC Testnet Contract Addresses
================================================================
Bridge:             0xcCeA086cbb7DA6bA5eb004fAd435F9b7712bA80e
Erc20 Handler:      0xEc239B20C6d93CE22316F807F898d0C9fA67E3D6
Generic Handler:    0xb264Cf6be02f17BF638Cd59F63C68Ec3036b32b5
```

### On Moonbase Alpha Testnet

```
BSC Testnet Contract Addresses
================================================================
Bridge:             0xFC72F77e2f4fCcd2E4DEd30cF9d9eb806142505f
Erc20 Handler:      0xe4Fd0BC0601d1f4E042e93D28C6A429B26dF1457
Generic Handler:    0x26c61e08d6fd620420079ED4B90Ec4a99c6bCEaa
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
   |-- mainnet-configs.json (merged config for mainnet)
   |-- testnet-configs.json (merged config for testnet)

```
