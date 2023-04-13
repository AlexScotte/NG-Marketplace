const TreasureGuardian = artifacts.require("TreasureGuardian");
const GuardianToken = artifacts.require("GuardianToken");
const GuardianStuff = artifacts.require("GuardianStuff");

const { BN } = require("web3-utils");
// const { web3 } = require("web3");

module.exports = async (deployer, network) => {
  var accounts = await web3.eth.getAccounts();
  var owner = accounts[0];
  var a1 = accounts[1];
  var a2 = accounts[2];
  var a3 = accounts[3];
  const rewardQuest = 1500;

  const treasureGuardianInstance = await TreasureGuardian.deployed();
  var guardianStuffInstance = await GuardianStuff.at(
    await treasureGuardianInstance.guardianStuff()
  );
  var guardianTokenInstance = await GuardianToken.at(
    await treasureGuardianInstance.guardianToken()
  );

  console.log(
    "Guardian token address: " +
      (await treasureGuardianInstance.guardianToken())
  );
  let balanceOfBN = web3.utils.fromWei(
    BN(await guardianTokenInstance.balanceOf(treasureGuardianInstance.address)),
    "ether"
  );
  console.log("Treasure token balance: " + balanceOfBN);

  // Send reward to user1
  console.log("Send reward to user1");
  await treasureGuardianInstance.rewardGuardianWithToken(
    a1,
    web3.utils.toWei(BN(rewardQuest), "ether")
  );
  balanceOfBN = web3.utils.fromWei(
    BN(await guardianTokenInstance.balanceOf(a1))
  );
  console.log(
    "User1 token balance after sending from treasure contract: " + balanceOfBN
  );

  // Get chest price
  console.log("Get chest price");
  const chestPrice = BN(await treasureGuardianInstance.chestPrice());
  balanceOfBN = web3.utils.fromWei(chestPrice);
  console.log("Chest price: " + chestPrice);

  // Approve treasure contract to use our token
  console.log("Approve treasure contract to use our token");
  await guardianTokenInstance.approve(
    treasureGuardianInstance.address,
    chestPrice,
    { from: a1 }
  );

  const itemChestID = (await guardianStuffInstance.chestItemID()).toNumber();
  console.log(itemChestID);
  // Buying chest
  console.log("Buying chest");
  await treasureGuardianInstance.buyChest(1, { from: a1 });
  // await treasureGuardianInstance.buyChest(1, { from: a1 });
  // await treasureGuardianInstance.buyChest(1, { from: a1 });
  // await treasureGuardianInstance.buyChest(1, { from: a1 });
  // await treasureGuardianInstance.buyChest(1, { from: a1 });
  balanceOfBN = web3.utils.fromWei(
    BN(await guardianTokenInstance.balanceOf(treasureGuardianInstance.address))
  );
  console.log("Tresure token balance: " + balanceOfBN);
  console.log(
    "Tresure chest item balance: " +
      (
        await guardianStuffInstance.balanceOf(
          treasureGuardianInstance.address,
          itemChestID
        )
      ).toNumber()
  );

  balanceOfBN = web3.utils.fromWei(
    BN(await guardianTokenInstance.balanceOf(a1))
  );
  console.log("user1 token balance: " + balanceOfBN);
  console.log(
    "user1 chest item balance: " +
      (await guardianStuffInstance.balanceOf(a1, itemChestID)).toNumber()
  );
  console.log(
    "Treasure chest item balance after sending to user1: " +
      (
        await guardianStuffInstance.balanceOf(
          treasureGuardianInstance.address,
          itemChestID
        )
      ).toNumber()
  );

  // Opening chest
  console.log("Opening chest");
  let itemIDs = [];
  console.log("Approve to treasure guardian to take back the chest");
  await guardianStuffInstance.setApprovalForAll(
    treasureGuardianInstance.address,
    true,
    { from: a1 }
  );
  console.log("Open chest");
  itemIDs = await treasureGuardianInstance.openChest({ from: a1 });
  console.log(
    "user1 chest item balance after opening chest: " +
      (await guardianStuffInstance.balanceOf(a1, itemChestID)).toNumber()
  );
};
