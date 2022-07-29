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
})
describe("update ticket price tests", function () {
    it("Successfully updates ticket price", async () => {
        expect(await Lottery.getTicketPrice()).to.equal(BigNumber.from("50000000000000000000"))
        await expect(Lottery.updateTicketPrice(10))
            .to.emit(Lottery, "ParticipationFeeUpdated")
            .withArgs(BigNumber.from("10000000000000000000"))
        expect(await Lottery.getTicketPrice()).to.equal(BigNumber.from("10000000000000000000"))
    })
})
