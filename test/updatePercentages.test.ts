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

    await Lottery.startLottery()
    await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
    await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
})

describe("updatePercentages() tests", function () {
    describe("negative tests", function () {
        it("revert if owner trying to set wrong percentages", async () => {
            await expect(Lottery.updatePercentages(101, 50)).to.be.revertedWith("Wrong percentages!")
        })
    })

    describe("negative tests", function () {
        it("percentage of winner updated successfully", async () => {
            await Lottery.updatePercentages(30, 70)
            expect((await Lottery.getPercentages())[0]).to.equal(BigNumber.from("30"))
        })

        it("percentage of owner updated successfully", async () => {
            await Lottery.updatePercentages(30, 70)
            expect((await Lottery.getPercentages())[1]).to.equal(BigNumber.from("70"))
        })

        it("Check that winner gets the prize after percentage changing", async () => {
            await Lottery.updatePercentages(50, 50)
            await LOT.transfer(player2Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player2).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await Lottery.connect(player1).participate()
            await Lottery.connect(player2).participate()
            await Lottery.endLottery()
            await VrfCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address)
            expect(await LOT.balanceOf(ownerWallet)).to.equal(BigNumber.from("4050000000000000000000"))
        })
    })
})
