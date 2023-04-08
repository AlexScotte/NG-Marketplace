
const TreasureGuardian = artifacts.require("TreasureGuardian");
const GuardianToken = artifacts.require("GuardianToken");
const GuardianStuff = artifacts.require("GuardianStuff");

const { BN } = require("web3-utils");

module.exports = async (deployer, network) => {


    var accounts = await web3.eth.getAccounts();
    var owner = accounts[0];
    var a1 = accounts[1];
    var a2 = accounts[2];
    var a3 = accounts[3];
    const itemChestID = 0;


    const treasureGuardianInstance = await TreasureGuardian.deployed();
    var guardianStuff = await GuardianStuff.at(await treasureGuardianInstance.guardianStuff());
    var guardianTokenInstance = await GuardianToken.at(await treasureGuardianInstance.guardianToken());

    console.log("Guardian token address: " + await treasureGuardianInstance.guardianToken());
    console.log("Treasure token balance: " + (await guardianTokenInstance.balanceOf(treasureGuardianInstance.address)).toNumber());

    // Send reward to user1
    console.log("Send reward to user1");
    await treasureGuardianInstance.rewardGuardianWithToken(a1, 1500);
    console.log("User1 token balance after sending from treasure contract: " + (await guardianTokenInstance.balanceOf(a1)).toNumber());


    // Get chest price
    console.log("Get chest price");
    const chestPrice = (await treasureGuardianInstance.chestPrice()).toNumber();
    console.log("Chest price: " + chestPrice);


    // Approve treasure contract to use our token
    console.log("Approve treasure contract to use our token");
    await guardianTokenInstance.approve(treasureGuardianInstance.address, chestPrice, { from: a1 });

    // Buying chest
    console.log("Buying chest");
    await treasureGuardianInstance.buyChest(1, { from: a1 });
    // await treasureGuardianInstance.buyChest(1, { from: a1 });
    // await treasureGuardianInstance.buyChest(1, { from: a1 });
    // await treasureGuardianInstance.buyChest(1, { from: a1 });
    // await treasureGuardianInstance.buyChest(1, { from: a1 });
    console.log("Tresure token balance: " + (await guardianTokenInstance.balanceOf(treasureGuardianInstance.address)).toNumber());
    console.log("Tresure chest item balance: " + (await guardianStuff.balanceOf(treasureGuardianInstance.address, itemChestID)).toNumber());

    console.log("user1 token balance: " + (await guardianTokenInstance.balanceOf(a1)).toNumber());
    console.log("user1 chest item balance: " + (await guardianStuff.balanceOf(a1, itemChestID)).toNumber());
    console.log("Tresure chest item balance after sending to user1: " + (await guardianStuff.balanceOf(treasureGuardianInstance.address, itemChestID)).toNumber());

    // Opening chest
    console.log("Opening chest");
    let itemIDs = [];
    itemIDs = await treasureGuardianInstance.openChest({ from: a1 });

    for (let i = 0; i < itemIDs.length; i++) {
        console.log("Item ID looted: " + itemIDs[i]);
    }
};
