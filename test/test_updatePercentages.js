const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")
require("dotenv").config()

let owner, Lottery, VrfCoordinatorV2Mock, LOT

beforeEach(async () => {
    ;[owner, player1, player2, player3] = await ethers.getSigners()
    let lottery = await ethers.getContractFactory("Lottery")
    let vrfCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock")

    let LOTcoin = await ethers.getContractFactory("LOT")
    LOT = await LOTcoin.deploy()

    VrfCoordinatorV2Mock = await vrfCoordinatorV2Mock.deploy(0, 0)

    await VrfCoordinatorV2Mock.createSubscription()
    await VrfCoordinatorV2Mock.fundSubscription(1, ethers.utils.parseEther("7"))

    Lottery = await lottery.deploy(1, VrfCoordinatorV2Mock.address, process.env.KEY_HASH, LOT.address, 90, 10, 50)

    await Lottery.startLottery()
    await LOT.transfer(player1.address, BigNumber.from("500000000000000000000"))
    await LOT.connect(player1).approve(Lottery.address, BigNumber.from("50000000000000000000"))
})
describe("updatePercentages", function () {
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
            await LOT.transfer(player2.address, BigNumber.from("500000000000000000000"))
            await LOT.connect(player2).approve(Lottery.address, BigNumber.from("50000000000000000000"))
            await Lottery.connect(player1).participate()
            await Lottery.connect(player2).participate()
            await Lottery.endLottery()
            await VrfCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address)
            expect(await LOT.balanceOf(owner.address)).to.equal(BigNumber.from("4050000000000000000000"))
        })
    })
})

