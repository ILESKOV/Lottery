const hre = require("hardhat")
require("dotenv").config()
const { SUBSCRIPTION_ID, VRF_COORDINATOR, KEY_HASH, PERCENT_WINNER, PERCENT_OWNER, TICKET_PRICE } = process.env

async function main() {
    let lot = await ethers.getContractFactory("LOT")
    LOT = await lot.deploy()

    console.log("Token deployed to:", LOT.address)

    const Lottery = await hre.ethers.getContractFactory("Lottery")
    const lottery = await Lottery.deploy(
        SUBSCRIPTION_ID,
        VRF_COORDINATOR,
        KEY_HASH,
        LOT.address,
        PERCENT_WINNER,
        PERCENT_OWNER,
        TICKET_PRICE
    )

    console.log("Lottery deployed to:", lottery.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

