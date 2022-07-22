# Lottery
> Lottery contract with VRF2
> Contract is using VRFv2 for generating random numbers. Therefore, for the correct operation of the contract, it is necessary to create subscription on > https://vrf.chain.link/rinkeby for rinkeby testnet or https://vrf.chain.link/mainnet for mainnet, replenish the balance of LINK and add contract address as a consumer

## Table of Contents
* [General Info](#general-information)
* [Technologies Used](#technologies-used)
* [Features](#features)
* [Requirements For Initial Setup](#requirements)
* [Setup](#setup)
* [Contact](#contact)



## General Information
- Owner(admin) of the contract can start/end lottery
- Every user can participate and price of ticket is based on LOT ERC20 tokens. Each ticket represents itself an ERC721 token
- After owner end lottery, the winner will be picked using randomness from Chainlink VRFv2 Coordinator

 
## Technologies Used
- Chainlink VRFv2
- hh coverage
- slither
- docgen

## Features
- Trully random contract(Ideally for lottery)
- Ticket price is based LOT tokens
- The contract has been properly reviewed.

## Requirements For Initial Setup
- Install [NodeJS](https://nodejs.org/en/), should work with any node version below 16.16.0
- Install [Hardhat](https://hardhat.org/)

## Setup
### 1. Clone/Download the Repository
### 2. Install Dependencies:
```
$ cd lottery_file
$ npm install
```
### 3. .env environment variables required to set up

### 4. Run Tests
`$ npm run test`

### 5. Deploy to Rinkeby
`$ npm run deployLOT ` 
!!!Important!!! 
insert current token contract address into your environment variables

`
 $ npm run deployLottery
 `
### 6. Insert current contract addresses into package.json
![Example screenshot](./Screenshot7.png)

### 7. Verify contracts
`$ npm run verifyLOT `


 `
 $ npm run verifyLottery
 `




## Contact
Created by [@LESKOV](https://www.linkedin.com/in/ivan-lieskov-4b5664189/) - feel free to contact me!
