import { expect } from "chai"
import { ethers } from "hardhat"
import { ContractFactory, Contract, Signer, BigNumber } from "ethers"

import * as dotenv from "dotenv"
dotenv.config()

const utils = ethers.utils
const contractName = "Lottery"
const tokenName = "LOT"
const mockName = "VRFCoordinatorV2Mock"
let contractFactory: ContractFactory
let mockedContractFactory: ContractFactory
let LOTcoin: ContractFactory
let Lottery: Contract
let VrfCoordinatorV2Mock: Contract
let LOT: Contract
let owner: Signer
let player1: Signer
let player2: Signer
let player3: Signer
let ownerWallet: string
let player1Wallet: string
let player2Wallet: string
let player3Wallet: string

beforeEach(async () => {
    ;[owner, player1, player2, player3] = await ethers.getSigners()

    ownerWallet = await owner.getAddress()
    player1Wallet = await player1.getAddress()
    player2Wallet = await player2.getAddress()
    player3Wallet = await player3.getAddress()

    contractFactory = await ethers.getContractFactory(contractName, owner)
    mockedContractFactory = await ethers.getContractFactory(mockName, owner)

    LOTcoin = await ethers.getContractFactory(tokenName, owner)
    LOT = await LOTcoin.deploy()

    VrfCoordinatorV2Mock = await mockedContractFactory.deploy(0, 0)

    await VrfCoordinatorV2Mock.createSubscription()
    await VrfCoordinatorV2Mock.fundSubscription(1, utils.parseEther("7"))

    Lottery = await contractFactory.deploy(
        1,
        VrfCoordinatorV2Mock.address,
        process.env.KEY_HASH,
        LOT.address,
        90,
        10,
        50
    )
})
describe("VRFv2 tests", function () {
    beforeEach(async () => {
        await Lottery.startLottery()
        await LOT.approve(Lottery.address, utils.parseEther("50"))
        await Lottery.participate()
    })

    it("Contract should request Random number successfully", async () => {
        await expect(Lottery.endLottery()).to.emit(Lottery, "RequestedRandomness").withArgs(BigNumber.from(1))
    })

    it("Coordinator should successfully receive the request", async function () {
        await expect(Lottery.endLottery()).to.emit(VrfCoordinatorV2Mock, "RandomWordsRequested")
    })

    it("Coordinator should fulfill Random Number request", async () => {
        let tx = await Lottery.endLottery()
        let { events } = await tx.wait()

        let [reqId] = events.filter((x: any) => x.event === "RequestedRandomness")[0].args

        await expect(VrfCoordinatorV2Mock.fulfillRandomWords(reqId, Lottery.address)).to.emit(
            VrfCoordinatorV2Mock,
            "RandomWordsFulfilled"
        )
    })

    it("Contract should receive Random Numbers", async () => {
        let tx = await Lottery.endLottery()
        let { events } = await tx.wait()

        let [reqId] = events.filter((x: any) => x.event === "RequestedRandomness")[0].args

        await expect(VrfCoordinatorV2Mock.fulfillRandomWords(reqId, Lottery.address)).to.emit(
            Lottery,
            "ReceivedRandomness"
        )
    })
})
