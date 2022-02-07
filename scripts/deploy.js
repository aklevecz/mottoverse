const hre = require("hardhat");

async function main() {
  const Mottoverse = await hre.ethers.getContractFactory("Mottoverse");
  const mottoverse = await Mottoverse.deploy();

  await mottoverse.deployed();

  console.log("Mottoverse deployed to:", mottoverse.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
