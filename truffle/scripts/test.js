
const TreasureGuardian = artifacts.require("TreasureGuardian");
const Stuff = artifacts.require("Stuff");
const ForgeMaster = artifacts.require("ForgeMaster");
const AuctionHouse = artifacts.require("AuctionHouse");

module.exports = async (deployer, network) => {

    var accounts = await web3.eth.getAccounts();
    var owner = accounts[0];
    var a1 = accounts[1];
    var a2 = accounts[2];
    var a3 = accounts[3];


    const treasureGuardianInstance = await TreasureGuardian.deployed();
    const auctionHouseInstance = await AuctionHouse.deployed();
    //  const stuffInstance = await Stuff.deployed();
    //  const ironForgeFactory = await ForgeMaster.deployed();

    var stuff = await Stuff.at(await treasureGuardianInstance.stuff());

    console.log(owner);
    console.log(treasureGuardianInstance.address);
    console.log(stuff.address);

    console.log(await treasureGuardianInstance.owner());
    console.log(await stuff.owner());

    console.log((await stuff.balanceOf(treasureGuardianInstance.address, 10)).toNumber());
    // console.log((await stuff.balanceOf(treasureGuardianInstance.address, 20)).toNumber());

    // await stuff.setApprovalForAll(owner, true, { from: a2 });
    // console.log(await stuff.isApprovedForAll(treasureGuardianInstance.address, treasureGuardianInstance.address));
    // await stuff.setApprovalForAll(owner, true, { from: a2 });
    // // await stuff.setApprovalForAll(owner, true);


    // console.log(treasureGuardianInstance.owner());
    // console.log(treasureGuardianInstance.address);
    // console.log(auctionHouseInstance.address);

    // await stuff.safeTransferFrom(treasureGuardianInstance.address, a2, 10, 10, [], { from: owner });
    await treasureGuardianInstance.safeTransferFrom(treasureGuardianInstance.address, a2, 10, 10, []);
    console.log((await stuff.balanceOf(treasureGuardianInstance.address, 10)).toNumber());
    console.log((await stuff.balanceOf(a2, 10)).toNumber());



    // await stuff.setApprovalForAll(auctionHouseInstance.address, true);
    await stuff.setApprovalForAll(auctionHouseInstance.address, true, { from: a2 });
    // await stuff.setApprovalForAll(owner, true);
    // await treasureGuardianInstance.setApprovalForAll(owner, true);
    // await treasureGuardianInstance.setApprovalForAll(auctionHouseInstance.address, true);
    console.log("tezst");


    // await auctionHouseInstance.listItem(treasureGuardianInstance.address, 10, 1, 11);
    await auctionHouseInstance.listItem(10, 1, 11, { from: a2 });
    console.log((await stuff.balanceOf(treasureGuardianInstance.address, 10)).toNumber());
    console.log((await stuff.balanceOf(a2, 10)).toNumber());
    console.log((await stuff.balanceOf(auctionHouseInstance.address, 10)).toNumber());


    // await auctionHouseInstance.listItem(10, 1000, 1000, { from: treasureGuardianInstance.address });

};
