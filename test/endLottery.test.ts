import { expect } from "chai"
import { ethers } from "hardhat"
import { ContractFactory, Contract, Signer, BigNumber } from "ethers"

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

    await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
    await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
})
describe("endLottery() tests", function () {
    describe("negative tests", function () {
        it("impossible to end lottery that didn't started", async () => {
            await expect(Lottery.endLottery()).to.be.revertedWith("Can't end lottery yet")
        })

        it("impossible to end while state is already in 'CALCULATING_WINNER'", async () => {
            await Lottery.startLottery()
            await Lottery.connect(player1).participate()
            await Lottery.endLottery()
            await expect(Lottery.endLottery()).to.be.revertedWith("Can't end lottery yet")
        })

        it("should revert if number of ticket in current lottery is 0", async () => {
            await Lottery.startLottery()
            await expect(Lottery.endLottery()).to.be.revertedWith("Can't divide by zero")
        })
    })
    describe("positive tests", function () {
        it("checks the state after lottery ended is 'CALCULATING_WINNER'", async () => {
            await Lottery.startLottery()
            await Lottery.connect(player1).participate()
            await Lottery.endLottery()
            expect(await Lottery.currentLotteryState()).to.equal(2)
        })

        it("checks if endlottery called pickWinner()", async () => {
            expect(await Lottery.requestId()).to.equal(0)
            await Lottery.startLottery()
            await Lottery.connect(player1).participate()
            await Lottery.endLottery()
            expect(await Lottery.requestId()).to.equal(1)
        })

        it("should check NewParticipant event is emited", async () => {
            await Lottery.startLottery()
            await Lottery.connect(player1).participate()
            await expect(Lottery.endLottery()).to.emit(Lottery, "RequestedRandomness").withArgs(1)
        })
    })
})
