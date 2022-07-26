const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")
require("dotenv").config()

let owner, Lottery, VrfCoordinatorV2Mock, LOT

beforeEach(async () => {
    ;[owner, player1, player2, player3] = await ethers.getSigners()
    let lottery = await ethers.getContractFactory("Lottery")
    let vrfCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock")

    let LOTcoin = await ethers.getContractFactory("LOTcoin")
    LOT = await LOTcoin.deploy()

    VrfCoordinatorV2Mock = await vrfCoordinatorV2Mock.deploy(0, 0)

    await VrfCoordinatorV2Mock.createSubscription()
    await VrfCoordinatorV2Mock.fundSubscription(1, ethers.utils.parseEther("7"))

    Lottery = await lottery.deploy(1, VrfCoordinatorV2Mock.address, process.env.KEY_HASH, LOT.address)

    await Lottery.startLottery()
    await LOT.transfer(player1.address, 500)
    await LOT.connect(player1).approve(Lottery.address, 50)
})
describe("fulfillRandomWords", function () {
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
        expect(await Lottery.getlotteryWinner(1)).to.equal(player1.address)
    })

    it("check the userTickets mapping was updated", async () => {
        await Lottery.connect(player1).participate()
        await Lottery.endLottery()
        await VrfCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address)
        expect(await Lottery.getUserFromTicket(1)).to.equal(player1.address)
    })

    it("check that winner gets the prize", async () => {
        await LOT.transfer(player2.address, 500)
        await LOT.connect(player2).approve(Lottery.address, 50)
        await Lottery.connect(player1).participate()
        await Lottery.connect(player2).participate()
        await Lottery.endLottery()
        await VrfCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address)
        expect(await LOT.balanceOf(player2.address)).to.equal(540)
    })

    it("Check that owner have received a reward", async () => {
        await LOT.transfer(player2.address, 500)
        await LOT.connect(player2).approve(Lottery.address, 50)
        await Lottery.connect(player1).participate()
        await Lottery.connect(player2).participate()
        await Lottery.endLottery()
        await VrfCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address)
        expect(await LOT.balanceOf(owner.address)).to.equal(4010)
    })

    it("Check random word", async () => {
        await LOT.transfer(player2.address, 500)
        await LOT.connect(player2).approve(Lottery.address, 50)
        await Lottery.connect(player1).participate()
        await Lottery.connect(player2).participate()
        await Lottery.endLottery()
        await VrfCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address)
        expect(BigNumber.from((await Lottery.currentRandomWord())[0])).to.equal(
            BigNumber.from("78541660797044910968829902406342334108369226379826116161446442989268089806461")
        )
    })
})

