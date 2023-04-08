const TreasureGuardian = artifacts.require("TreasureGuardian");
const AuctionHouse = artifacts.require("AuctionHouse");
const ForgeMaster = artifacts.require("ForgeMaster");

module.exports = async (deployer) => {

    // Deploy the escrow contract
    await deployer.deploy(TreasureGuardian);
    var treasureGuardianInstance = await TreasureGuardian.deployed();

    // Create ERC1155 collection
    await treasureGuardianInstance.createCollection();

    // Deploy the Marketplace
    await deployer.deploy(AuctionHouse, await treasureGuardianInstance.guardianStuff());
};
