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
describe("VRFv2 tests", function () {
  beforeEach(async () => {
    await Lottery.startLottery();
    await LOT.approve(Lottery.address, 50);
    await Lottery.participate();
  });

  it("Contract should request Random number successfully", async () => {
    await expect(Lottery.endLottery())
      .to.emit(Lottery, "RequestedRandomness")
      .withArgs(BigNumber.from(1));
  });

  it("Coordinator should successfully receive the request", async function () {
    await expect(Lottery.endLottery()).to.emit(
      VrfCoordinatorV2Mock,
      "RandomWordsRequested"
    );
  });

  it("Coordinator should fulfill Random Number request", async () => {
    let tx = await Lottery.endLottery();
    let { events } = await tx.wait();

    let [reqId] = events.filter((x) => x.event === "RequestedRandomness")[0]
      .args;

    await expect(
      VrfCoordinatorV2Mock.fulfillRandomWords(reqId, Lottery.address)
    ).to.emit(VrfCoordinatorV2Mock, "RandomWordsFulfilled");
  });

  it("Contract should receive Random Numbers", async () => {
    let tx = await Lottery.endLottery();
    let { events } = await tx.wait();

    let [reqId] = events.filter((x) => x.event === "RequestedRandomness")[0]
      .args;

    await expect(
      VrfCoordinatorV2Mock.fulfillRandomWords(reqId, Lottery.address)
    ).to.emit(Lottery, "ReceivedRandomness");
  });
});
