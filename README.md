# Integrating a new ERC20 token to Meter Passport
This repository is created to simplify the process of adding new ERC20 tokens to [Meter Passport](https://passport.meter.io).  

Only the files under the data directory have to be modified manually.  Please submit a pull request to the files under the data directory only.  We will update the rest with the scripts.

The following files have to be changed:

1. token_mappings.csv
Create a new entry with resourceID
The resrouceID is used for identifying a token in Meter passport.  The naming convention for resrouceID is based on the ERC20 contract address of the asset in its origin network (for example Ethereum), with 01 as surfix (represent version number) and 0 as prefix to make the total length of the resource ID to be 32 bytes.  Please make sure all the letters in the address has to be lower case.

Adding ERC20 token addresses, name and decimals in various networks.  If you deploy your own token in different network, we recommend you to use the same private key and nonce as the contract in the original network.  This ensures the contract address the same as the original network and make it easier for the users to identify.  

2. Add the ERC20 handler contract address as the only minter for the new ERC20 tokens outside the home networks.  This allows Passport to mint a new token the destination network when a token is locked in the home network. Please do not mint new tokens outside the home network without going through the relayer, this may cause the number of circulating tokens unbalanced on both side of the bridge.

3. add 256x256 png logos under the new resrouce ID folder.  This logo will be used to display your tokens
