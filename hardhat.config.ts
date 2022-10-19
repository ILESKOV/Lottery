import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-solhint"
import "@nomiclabs/hardhat-etherscan"
import "@typechain/hardhat"
import "solidity-coverage"
import "solidity-docgen"
import "hardhat-contract-sizer"

import * as dotenv from "dotenv"
import { HardhatUserConfig } from "hardhat/config"

dotenv.config()

const { GOERLI_API, MAINNET_API, PRIVATE_KEY, ETHERSCAN_KEY } = process.env

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.15",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    contractSizer: {
        alphaSort: false,
        disambiguatePaths: true,
        runOnCompile: true,
        strict: false,
        only: [],
    },
    networks: {
        hardhat: {
            initialBaseFeePerGas: 0,
        },
        goerli: {
            url: GOERLI_API,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
        },
        ethereum: {
            chainId: 1,
            url: MAINNET_API,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
        },
        polygon: {
            url: "https://rpc-mumbai.maticvigil.com" /*"https://polygon-rpc.com"*/,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_KEY,
    },
}

export default config
