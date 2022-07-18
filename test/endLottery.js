const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
require("dotenv").config();

describe("Lottery", function () {
  let owner, Lottery, VrfCoordinatorV2Mock, LOT;

  beforeEach(async () => {
    [owner, player1, player2, player3] = await ethers.getSigners();
    let lottery = await ethers.getContractFactory("Lottery");
    let vrfCoordinatorV2Mock = await ethers.getContractFactory(
      "VRFCoordinatorV2Mock"
    );

    let LOTcoin = await ethers.getContractFactory("LOTcoin");
    LOT = await LOTcoin.deploy();

    VrfCoordinatorV2Mock = await vrfCoordinatorV2Mock.deploy(0, 0);

    await VrfCoordinatorV2Mock.createSubscription();
    await VrfCoordinatorV2Mock.fundSubscription(
      1,
      ethers.utils.parseEther("7")
    );

    Lottery = await lottery.deploy(
      1,
      VrfCoordinatorV2Mock.address,
      process.env.KEY_HASH,
      LOT.address
    );

    await LOT.transfer(player1.address, 500);
    await LOT.connect(player1).approve(Lottery.address, 50);
  });
  describe("end lottery", function () {
    it("impossible to end lottery that didn't started", async () => {
      await expect(Lottery.endLottery()).to.be.revertedWith(
        "Can't end lottery yet"
      );
    });

    it("impossible to end while state is already in 'CALCULATING_WINNER'", async () => {
      await Lottery.startLottery();
      await Lottery.connect(player1).participate();
      await Lottery.endLottery();
      await expect(Lottery.endLottery()).to.be.revertedWith(
        "Can't end lottery yet"
      );
    });

    it("should revert if number of ticket in current lottery is 0", async () => {
      await Lottery.startLottery();
      await expect(Lottery.endLottery()).to.be.revertedWith(
        "Can't divide by zero"
      );
    });

    it("checks the state after lottery ended is 'CALCULATING_WINNER'", async () => {
      await Lottery.startLottery();
      await Lottery.connect(player1).participate();
      await Lottery.endLottery();
      expect(await Lottery.currentLotteryState()).to.equal(2);
    });

    it("checks if endlottery called pickWinner()", async () => {
      expect(await Lottery.requestId()).to.equal(0);
      await Lottery.startLottery();
      await Lottery.connect(player1).participate();
      await Lottery.endLottery();
      expect(await Lottery.requestId()).to.equal(1);
    });

    it("should check NewParticipant event is emited", async () => {
      await Lottery.startLottery();
      await Lottery.connect(player1).participate();
      await expect(Lottery.endLottery())
        .to.emit(Lottery, "RequestedRandomness")
        .withArgs(1);
    });
  });
});
