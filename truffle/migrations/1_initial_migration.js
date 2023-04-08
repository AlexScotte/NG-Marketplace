const TreasureGuardian = artifacts.require("TreasureGuardian");
const AuctionHouse = artifacts.require("AuctionHouse");

module.exports = async (deployer) => {

    await deployer.deploy(TreasureGuardian);
    var treasureGuardianInstance = await TreasureGuardian.deployed();
    await deployer.deploy(AuctionHouse, await treasureGuardianInstance.guardianStuff());
};
