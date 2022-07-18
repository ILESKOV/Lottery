const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
require("dotenv").config();

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
  await VrfCoordinatorV2Mock.fundSubscription(1, ethers.utils.parseEther("7"));

  Lottery = await lottery.deploy(
    1,
    VrfCoordinatorV2Mock.address,
    process.env.KEY_HASH,
    LOT.address
  );
});
describe("updateSubscriptionId tests", function () {
  it("Successfully updates subscription Id", async () => {
    expect(await Lottery.getSubscriptionId()).to.equal(1);
    await expect(Lottery.updateSubscriptionId(2))
      .to.emit(Lottery, "SubscriptionChanged")
      .withArgs(2);
    expect(await Lottery.getSubscriptionId()).to.equal(2);
  });
});
