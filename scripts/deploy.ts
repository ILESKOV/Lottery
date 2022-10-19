import { ethers, run } from "hardhat"
import dotenv from "dotenv"
import { Lottery__factory, LOT__factory } from "../typechain-types"

dotenv.config()

const { SUBSCRIPTION_ID, VRF_COORDINATOR, KEY_HASH, PERCENT_WINNER, PERCENT_OWNER, TICKET_PRICE } = process.env

async function main() {
    const [signer] = await ethers.getSigners()

    const LOT = await new LOT__factory(signer).deploy()
    await LOT.deployed()

    console.log("LOT erc-20 token contract deployed to:", LOT.address)

    const Lottery = await new Lottery__factory(signer).deploy(
        SUBSCRIPTION_ID !== undefined ? SUBSCRIPTION_ID : 0,
        VRF_COORDINATOR !== undefined ? VRF_COORDINATOR : "",
        KEY_HASH !== undefined ? KEY_HASH : "",
        LOT.address !== undefined ? LOT.address : "",
        PERCENT_WINNER !== undefined ? PERCENT_WINNER : 0,
        PERCENT_OWNER !== undefined ? PERCENT_OWNER : 0,
        TICKET_PRICE !== undefined ? TICKET_PRICE : 0
    )

    await Lottery.deployed()

    console.log("Lottery contract deployed to:", Lottery.address)

    //Wait few block in order to verify successfully in one script
    await new Promise((f) => setTimeout(f, 60000))

    await run("verify:verify", {
        address: LOT.address,
        contract: "contracts/LOT.sol:LOT",
    })
    await run("verify:verify", {
        address: Lottery.address,
        contract: "contracts/Lottery.sol:Lottery",
        constructorArguments: [
            SUBSCRIPTION_ID,
            VRF_COORDINATOR,
            KEY_HASH,
            LOT.address,
            PERCENT_WINNER,
            PERCENT_OWNER,
            TICKET_PRICE,
        ],
    })
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
