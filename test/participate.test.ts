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
})
describe("participate() tests", function () {
    describe("negative tests", function () {
        it("should revert if lottery is 'CLOSED", async () => {
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await expect(Lottery.connect(player1).participate()).to.be.revertedWith("Wait until the next lottery")
        })

        it("should revert if lottery is in a state of 'CALCULATING_WINNER'", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await Lottery.connect(player1).participate()
            await Lottery.endLottery()
            await expect(Lottery.connect(player1).participate()).to.be.revertedWith("Wait until the next lottery")
        })

        it("should revert if allowance of player tokens for lottery contract is not enough", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("49000000000000000000"))
            await expect(Lottery.connect(player1).participate()).to.be.revertedWith("ERC20: insufficient allowance")
        })
    })

    describe("positive tests", function () {
        it("checks the state after lottery started is 'OPEN'", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await Lottery.connect(player1).participate()
            expect(await Lottery.currentLotteryState()).to.equal(0)
        })

        it("should success if allowance of player tokens for lottery contract is equal to ticket price", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            expect(await LOT.connect(player1).allowance(player1Wallet, Lottery.address)).to.equal(
                BigNumber.from("50000000000000000000")
            )
            await Lottery.connect(player1).participate()
            expect(await LOT.connect(player1).allowance(player1Wallet, Lottery.address)).to.equal(0)
            expect(await LOT.connect(player1).balanceOf(player1Wallet)).to.equal(
                BigNumber.from("450000000000000000000")
            )
        })

        it("should success if allowance of player tokens for lottery contract is higher than ticket price", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("100000000000000000000"))
            expect(await LOT.connect(player1).allowance(player1Wallet, Lottery.address)).to.equal(
                BigNumber.from("100000000000000000000")
            )
            await Lottery.connect(player1).participate()
            expect(await LOT.connect(player1).allowance(player1Wallet, Lottery.address)).to.equal(
                BigNumber.from("50000000000000000000")
            )
            expect(await LOT.connect(player1).balanceOf(player1Wallet)).to.equal(
                BigNumber.from("450000000000000000000")
            )
        })

        it("should allow to buy multiple lottery tickets per one lottery", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("100000000000000000000"))
            expect(await LOT.connect(player1).allowance(player1Wallet, Lottery.address)).to.equal(
                BigNumber.from("100000000000000000000")
            )
            await Lottery.connect(player1).participate()
            await Lottery.connect(player1).participate()
            expect(await LOT.connect(player1).allowance(player1Wallet, Lottery.address)).to.equal(0)
            expect(await LOT.connect(player1).balanceOf(player1Wallet)).to.equal(
                BigNumber.from("400000000000000000000")
            )
        })

        it("should change the balance of player tokens after player become a participant", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("100000000000000000000"))
            expect(await LOT.connect(player1).allowance(player1Wallet, Lottery.address)).to.equal(
                BigNumber.from("100000000000000000000")
            )
            await Lottery.connect(player1).participate()
            expect(await LOT.connect(player1).allowance(player1Wallet, Lottery.address)).to.equal(
                BigNumber.from("50000000000000000000")
            )
            expect(await LOT.connect(player1).balanceOf(player1Wallet)).to.equal(
                BigNumber.from("450000000000000000000")
            )
        })

        it("should increase number of tickets after the appearance of new participant", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await LOT.transfer(player2Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player2).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await Lottery.connect(player1).participate()
            expect(await Lottery.currentNumberOfTickets()).to.equal(1)
            await Lottery.connect(player2).participate()
            expect(await Lottery.currentNumberOfTickets()).to.equal(2)
        })

        it("should check userTickets mapping recorded new participant", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await LOT.transfer(player2Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player2).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await Lottery.connect(player1).participate()
            expect(await Lottery.getUserFromTicket(1)).to.equal(player1Wallet)
            await Lottery.connect(player2).participate()
            expect(await Lottery.getUserFromTicket(2)).to.equal(player2Wallet)
        })

        it("should check userTickets mapping recorded new participant", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await LOT.transfer(player2Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player2).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await Lottery.connect(player1).participate()
            expect(await Lottery.getUserFromTicket(1)).to.equal(player1Wallet)
            await Lottery.connect(player2).participate()
            expect(await Lottery.getUserFromTicket(2)).to.equal(player2Wallet)
        })

        it("should check lottery balance is increased after the appearance of new participant", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await LOT.transfer(player2Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player2).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await Lottery.connect(player1).participate()
            expect(await Lottery.getLotteryBalance()).to.equal(BigNumber.from("50000000000000000000"))
            await Lottery.connect(player2).participate()
            expect(await Lottery.getLotteryBalance()).to.equal(BigNumber.from("100000000000000000000"))
        })

        it("should check LotteryTicket NFT is generated for new participant", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await LOT.transfer(player2Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player2).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            expect(await Lottery.balanceOf(player1Wallet)).to.equal(0)
            expect(await Lottery.balanceOf(player2Wallet)).to.equal(0)
            await Lottery.connect(player1).participate()
            expect(await Lottery.balanceOf(player1Wallet)).to.equal(1)
            await Lottery.connect(player2).participate()
            expect(await Lottery.balanceOf(player2Wallet)).to.equal(1)
        })

        it("should check NewParticipant event is emited", async () => {
            await Lottery.startLottery()
            await LOT.transfer(player1Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await LOT.transfer(player2Wallet, BigNumber.from("500000000000000000000"))
            await LOT.connect(player2).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await expect(Lottery.connect(player1).participate())
                .to.emit(Lottery, "NewParticipant")
                .withArgs(player1Wallet, 1)
            await expect(Lottery.connect(player2).participate())
                .to.emit(Lottery, "NewParticipant")
                .withArgs(player2Wallet, 1)
        })
    })
})
