const TreasureGuardian = artifacts.require("TreasureGuardian");
const ForgeMaster = artifacts.require("ForgeMaster");
const GuardianStuff = artifacts.require("GuardianStuff");
const AuctionHouse = artifacts.require("AuctionHouse");

module.exports = async (deployer) => {

    await deployer.deploy(TreasureGuardian);
    var treasureGuardianInstance = await TreasureGuardian.deployed();
    // // deployer.deploy(ForgeMaster);
    // // deployer.deploy(ForgeFactory);
    await deployer.deploy(AuctionHouse, await treasureGuardianInstance.guardianStuff());
};
