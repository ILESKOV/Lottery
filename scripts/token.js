const hre = require("hardhat");
require("dotenv").config();

async function main() {
  let LOTcoin = await ethers.getContractFactory("LOTcoin");
  LOT = await LOTcoin.deploy();

  console.log("Token deployed to:", LOT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

