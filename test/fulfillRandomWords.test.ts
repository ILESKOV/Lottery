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

    const subscriptionId = await Lottery.getSubscriptionId()
    await VrfCoordinatorV2Mock.addConsumer(subscriptionId, Lottery.address)
    await Lottery.startLottery()
    await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
    await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
})
describe("fulfillRandomWords() tests", function () {
    it("check random word was created", async () => {
        await Lottery.connect(player1).participate()
        await Lottery.endLottery()
        expect(await Lottery.getLength()).to.equal(0)
        await VrfCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address)
        expect(await Lottery.getLength()).to.equal(1)
    })

    it("check the winner was selected", async () => {
        await Lottery.connect(player1).participate()
        await Lottery.endLottery()
        await VrfCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address)
        expect(await Lottery.getlotteryWinner(1)).to.equal(player1Wallet)
    })

    it("check the userTickets mapping was updated", async () => {
        await Lottery.connect(player1).participate()
        await Lottery.endLottery()
        await VrfCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address)
        expect(await Lottery.getUserFromTicket(1)).to.equal(player1Wallet)
    })

    it("check that winner gets the prize", async () => {
        await LOT.transfer(player2Wallet, BigNumber.from("500000000000000000000"))
        await LOT.connect(player2).approve(Lottery.address, BigNumber.from("50000000000000000000"))
        await Lottery.connect(player1).participate()
        await Lottery.connect(player2).participate()
        await Lottery.endLottery()
        await VrfCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address)
        expect(await LOT.balanceOf(player2Wallet)).to.equal(BigNumber.from("540000000000000000000"))
    })

    it("Check that owner have received a reward", async () => {
        await LOT.transfer(player2Wallet, BigNumber.from("500000000000000000000"))
        await LOT.connect(player2).approve(Lottery.address, BigNumber.from("50000000000000000000"))
        await Lottery.connect(player1).participate()
        await Lottery.connect(player2).participate()
        await Lottery.endLottery()
        await VrfCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address)
        expect(await LOT.balanceOf(ownerWallet)).to.equal(BigNumber.from("4010000000000000000000"))
    })

    it("Check random word", async () => {
        await LOT.transfer(player2Wallet, BigNumber.from("500000000000000000000"))
        await LOT.connect(player2).approve(Lottery.address, BigNumber.from("50000000000000000000"))
        await Lottery.connect(player1).participate()
        await Lottery.connect(player2).participate()
        await Lottery.endLottery()
        await VrfCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address)
        expect(BigNumber.from((await Lottery.currentRandomWord())[0])).to.equal(
            BigNumber.from("78541660797044910968829902406342334108369226379826116161446442989268089806461")
        )
    })
})
