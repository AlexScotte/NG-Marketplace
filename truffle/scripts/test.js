
const TreasureGuardian = artifacts.require("TreasureGuardian");
const GuardianStuff = artifacts.require("GuardianStuff");
const ForgeMaster = artifacts.require("ForgeMaster");
const AuctionHouse = artifacts.require("AuctionHouse");
const { BN } = require("web3-utils");

module.exports = async (deployer, network) => {


    var accounts = await web3.eth.getAccounts();
    var owner = accounts[0];
    var a1 = accounts[1];
    var a2 = accounts[2];
    var a3 = accounts[3];


    const treasureGuardianInstance = await TreasureGuardian.deployed();
    const auctionHouseInstance = await AuctionHouse.deployed();
    //  const guardianStuffInstance = await GuardianStuff.deployed();
    //  const ironForgeFactory = await ForgeMaster.deployed();

    var guardianStuff = await GuardianStuff.at(await treasureGuardianInstance.guardianStuff());

    console.log(owner);
    console.log(treasureGuardianInstance.address);
    console.log(guardianStuff.address);

    console.log(await treasureGuardianInstance.owner());
    console.log(await guardianStuff.owner());

    console.log((await guardianStuff.balanceOf(treasureGuardianInstance.address, 10)).toNumber());
    // console.log((await guardianStuff.balanceOf(treasureGuardianInstance.address, 20)).toNumber());

    // await guardianStuff.setApprovalForAll(owner, true, { from: a2 });
    // console.log(await guardianStuff.isApprovedForAll(treasureGuardianInstance.address, treasureGuardianInstance.address));
    // await guardianStuff.setApprovalForAll(owner, true, { from: a2 });
    // // await guardianStuff.setApprovalForAll(owner, true);


    // console.log(treasureGuardianInstance.owner());
    // console.log(treasureGuardianInstance.address);
    // console.log(auctionHouseInstance.address);

    // // //  await guardianStuff.safeTransferFrom(treasureGuardianInstance.address, a2, 10, 10, [], { from: owner });
    // await treasureGuardianInstance.safeTransferFrom(treasureGuardianInstance.address, a2, 10, 10, []);
    // console.log((await guardianStuff.balanceOf(treasureGuardianInstance.address, 10)).toNumber());
    // console.log((await guardianStuff.balanceOf(a2, 10)).toNumber());


    // await guardianStuff.setApprovalForAll(auctionHouseInstance.address, true, { from: a2 });
    // console.log("tezst");

    // let listingFee = await auctionHouseInstance.listingPrice();
    // listingFee = listingFee.toString();
    // console.log("listing fee: " + listingFee);

    // await auctionHouseInstance.listItem(10, web3.utils.toWei('1', 'ether'), 11, { from: a2, value: listingFee });
    // console.log((await guardianStuff.balanceOf(a2, 10)).toNumber());
    // console.log((await guardianStuff.balanceOf(auctionHouseInstance.address, 10)).toNumber());

    // console.log("achat");

    // let test = await auctionHouseInstance.getListedItems(false, false, false);
    // console.log(test);

    // await auctionHouseInstance.executeSale(0, { from: a3, value: web3.utils.toWei('1', 'ether') });
    // console.log((await guardianStuff.balanceOf(a2, 10)).toNumber());
    // console.log((await guardianStuff.balanceOf(a3, 10)).toNumber());

    // console.log("ttt");
    // await guardianStuff.setApprovalForAll(auctionHouseInstance.address, true, { from: a3 });
    // console.log("taaa");
    // console.log((await guardianStuff.balanceOf(a3, 10)).toNumber());
    // await auctionHouseInstance.listItem(10, 1, 11, { from: a3, value: listingFee });
    // console.log((await guardianStuff.balanceOf(a3, 10)).toNumber());

    // let tests = await auctionHouseInstance.getListedItems(false, false, false);
    // console.log(tests);

    console.log(a2);
    console.log((await guardianStuff.balanceOf(a2, 10)).toNumber());

};
