# Token definitions for Meter Passport
## Integrating a new ERC20 token to Meter Passport
This repository is created to simplify the process of adding new ERC20 tokens to [Meter Passport](https://passport.meter.io).  

Projects could either use Meter team created ERC20 wrapped tokens or deploy their own ERC20 token contracts on the destination networks. If projects deploy their own contracts, please make sure to use include the minter burner extension of the open zepplin implementation like the [following](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol), passport uses the mint and burnFrom functions in the destination chain.

Once the tokens on the destination networks are created, please use the following instructions to submit the pull request for including your tokens in Meter Passport.

Only the files under the `data` directory have to be modified manually. Please submit a pull request to the files under the `data` directory only.  We will update the rest with the scripts.

The following files have to be changed:

1. `token_mappings.csv`
Create a new entry with `resourceID`
The resourceID is used for identifying a token in Meter passport. The naming convention for `resource ID` is based on the ERC20 contract address of the asset in its origin network (for example Ethereum), with 01 as surfix (represent version number) and 0 as prefix to make the total length of the resource ID to be 32 bytes.  Please make sure all the letters in the address has to be lower case.  You will also have to add ERC20 token addresses, name and decimals in various networks for your token. We could deploy a standard ERC20 wrapper token for you or you could deploy your own ERC20 contract.  If you deploy your own token in different network, we recommend you to use the same private key and nonce as the contract in the original network.  This ensures the contract address the same as the original network and make it easier for the users to identify.  

A sample resource ID for `USDT` on Ethereum network (token address: `0xdAC17F958D2ee523a2206206994597C13D831ec7`)

```
0000000000000000000000   dac17f958d2ee523a2206206994597c13d831ec7   01
<-----padding 0------>   <-----token address in lower case------>   <-suffix->
```

2. Add the ERC20 handler contract address as the only minter and burner for the new ERC20 tokens outside the home networks.  This allows Passport to mint a new token the destination network when a token is locked in the home network. Please do not mint new tokens outside the home network without going through the relayer, this may cause the number of circulating tokens unbalanced on both side of the bridge.

3. add 256x256 png logos under the new resource ID folder.  This logo will be used to display your tokens

4. If your token has none standard ERC20 features like different decimals, rebasing features and etc, please inquire in our [discord channel](https://discordapp.com/invite/WPjTpMG).

## The following are important contract addresses in various networks

### On Ethereum Mainnets

```
ETH Contract Addresses
================================================================
Bridge:             0x3267701115c58384e70897739f5bb1C258D620e7
Erc20 Handler:      0xde4fC7C3C5E7bE3F16506FcC790a8D93f8Ca0b40
Generic Handler:    0x517828d2549cEC09386f89a67E92825E26740240
```
### On Meter Mainnet

```
Meter Contract Addresses
================================================================
Bridge:             0x697349C119632bc6328167322AD658bD45D4341b
Erc20 Handler:      0x60f1ABAa3ED8A573c91C65A5b82AeC4BF35b77b8
Generic Handler:    0x89CA53Bf11d24D32A7aC3aDb7750868360c90590
```

### On BSC Mainnet

```
BSC Contract Addresses
================================================================
Bridge:             0x8bFc6203906549C7998624DA1c786D342e4BCD81
Erc20 Handler:      0x5945241BBB68B4454bB67Bd2B069e74C09AC3D51
Generic Handler:    0x83Fc24eB56121FA2A05e0b5170E7310738425839
```


### On Ethereum Ropsten

```
ETH Ropsten Contract Addresses
================================================================
Bridge:             0xf137D4391bb510a6bDd7F486980D5a3F8639A56E
Erc20 Handler:      0xC56065ee94eD4d05360e130075Dd06DE55eE0916
Generic Handler:    0xBAb8402E278F45d51BB342525716611fE1090027
```

### On Meter Warringstakes Testnet

```
Meter Warringstakes Contract Address:
================================================================
Bridge:             0x8411Abf226C67c566Ca53Db06F206174b2d908cd
Erc20 Handler:      0x73BBF74df1c58903132CD4aa0e268C79f10aB042
Generic Handler:    0x56f03E0B73fa6Ff6704CA399CE88282EDcF9FeEA
```

### On BSC Testnet

```
BSC Testnet Contract Addresses
================================================================
Bridge:             0xD58A75F1217E0e5c8776e5178dCe9050B3A82aC9
Erc20 Handler:      0xEc239B20C6d93CE22316F807F898d0C9fA67E3D6
Generic Handler:    0xb264Cf6be02f17BF638Cd59F63C68Ec3036b32b5
```
