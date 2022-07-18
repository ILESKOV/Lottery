const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(
    8029,
    process.env.VRF_COORDINATOR,
    process.env.KEY_HASH,
    process.env.LOT_ADDRESS
  );
  await lottery.deployed();

  console.log("Lottery deployed to:", lottery.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

