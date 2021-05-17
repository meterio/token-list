# Token definitions for Meter Passport
## Integrating a new ERC20 token to Meter Passport
This repository is created to simplify the process of adding new ERC20 tokens to [Meter Passport](https://passport.meter.io).  

Projects could either use Meter team created ERC20 wrapped tokens or deploy their own ERC20 token contracts on the destination networks. If projects deploy their own contracts, please make sure to use include the minter burner extension of the open zepplin implementation like the [following] (https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol).

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
Bridge:             0x0682642d18ebb4bb5e759AF07A7DE4eADAE8E8c5
Erc20 Handler:      0xCCf4A9FdEE040782A6a37A65C986C23D964aad9D
Generic Handler:    0x30b7026e9E5b35C844F6B115Ab4558c3F7e7e3B1
```
### On Meter Mainnet

```
Meter Contract Addresses
================================================================
Bridge:             0x55dab796D3f98a5A4EDbF7eF4C5E9944B63e9e59
Erc20 Handler:      0x0D152F033DDF3920f445963d8e38a40105Ffbe4d
Generic Handler:    0x2f318898Ef6977BA02A72E20C0B1e9fb89947771
```

### On BSC Mainnet

```
BSC Contract Addresses
================================================================
Bridge:             0x39fCb6203cf870F5E37DcCabF99F9bC39108CA70
Erc20 Handler:      0xaB569cb439559B5484FBf11733Fc9CA0437DD84A
Generic Handler:    0x047B69380FD7257274361ED9BEc137Ddf0dfc75e
```


### On Ethereum Ropsten

```
ETH Ropsten Contract Addresses
================================================================
Bridge:             0xd7fb746e905f60e0f84F5eE545104A05066eCD86
Erc20 Handler:      0x5eb75e79CDa25AB88e4779aA00F1D5a95AC1352B
Generic Handler:    0x4CbbA9ea441cae4c07cB42549F3b2372c445CDd3
================================================================
```

### On Meter Warringstakes Testnet

```
Meter Warringstakes Contract Address:
================================================================
Bridge:             0xcC5A4195323CB835f22A9B7c6C5Cf6691D4419ec
Erc20 Handler:      0xf8A06b9E8B24Ea21E88930F9878C410334EE076f
Generic Handler:    0xb145C8E7EBbD692cFC495E6a5f414DF6f72503FA
```

### On BSC Testnet

```
BSC Testnet Contract Addresses
================================================================
Bridge:             0xa939D6a9E91ebD962f36bD0f7cf1c6C3C12c798f
Erc20 Handler:      0xD352C65Bcea484A5d10cB596CF80aBB846c6898F
Generic Handler:    0x8E61cC786AaFA0BFd13035a5b0b7A8CcdFB4CE12
```
