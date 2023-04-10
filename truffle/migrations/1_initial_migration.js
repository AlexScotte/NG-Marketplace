const TreasureGuardian = artifacts.require("TreasureGuardian");
const AuctionHouse = artifacts.require("AuctionHouse");
const ForgeMaster = artifacts.require("ForgeMaster");

module.exports = async (deployer, network, accounts) => {
  //   Deploy the treasure contract
  await deployer.deploy(TreasureGuardian);
  var treasureGuardianInstance = await TreasureGuardian.deployed();

  // Create ERC1155 collection
  await treasureGuardianInstance.createCollection();

  // Deploy the Marketplace
  await deployer.deploy(
    AuctionHouse,
    await treasureGuardianInstance.guardianStuff()
  );

  // Send 10 elements of the ERC115 token ID 1100 to check if all is OK
  await treasureGuardianInstance.safeTransferFrom(
    treasureGuardianInstance.address,
    accounts[2],
    1110,
    10,
    [],
    { from: accounts[0] }
  );
};
