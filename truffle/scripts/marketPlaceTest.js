const TreasureGuardian = artifacts.require("TreasureGuardian");
const GuardianStuff = artifacts.require("GuardianStuff");
const ForgeMaster = artifacts.require("ForgeMaster");
const AuctionHouse = artifacts.require("AuctionHouse");
const { BN } = require("web3-utils");

module.exports = async (deployer, network) => {
  var accounts = await web3.eth.getAccounts();
  var owner = accounts[0];
  var account1 = accounts[1];
  var account2 = accounts[2];

  var itemId1 = 1110;
  var itemId2 = 1111;
  var itemId3 = 1112;
  var itemId4 = 1113;

  // // Get deployed contract
  const treasureGuardianInstance = await TreasureGuardian.deployed();
  const auctionHouseInstance = await AuctionHouse.deployed();
  //  const guardianStuffInstance = await guardianStuffInstance.deployed();
  var guardianStuffInstance = await GuardianStuff.at(
    await treasureGuardianInstance.guardianStuff()
  );

  // console.log(owner);
  // console.log(treasureGuardianInstance.address);
  // console.log(guardianStuffInstance.address);
  // console.log(await treasureGuardianInstance.owner());
  // console.log(await guardianStuffInstance.owner());

  console.log("Get balance of item 1 and 2");
  console.log(
    "Treasure balance: " +
      (
        await guardianStuffInstance.balanceOf(
          treasureGuardianInstance.address,
          itemId1
        )
      ).toNumber()
  );
  console.log(
    "Treasure balance: " +
      (
        await guardianStuffInstance.balanceOf(
          treasureGuardianInstance.address,
          itemId2
        )
      ).toNumber()
  );

  console.log("Transfert item 1 from the treasure contract to the account1");
  await treasureGuardianInstance.safeTransferFrom(
    treasureGuardianInstance.address,
    account1,
    itemId1,
    10,
    []
  );

  console.log("Get new balance of treasure contract and account1");
  console.log(
    "Treasure balance: " +
      (
        await guardianStuffInstance.balanceOf(
          treasureGuardianInstance.address,
          itemId1
        )
      ).toNumber()
  );
  console.log(
    "account1 balance: " +
      (await guardianStuffInstance.balanceOf(account1, itemId1)).toNumber()
  );

  console.log("Give approval to the marketplace to list items of account1");
  await guardianStuffInstance.setApprovalForAll(
    auctionHouseInstance.address,
    true,
    { from: account1 }
  );

  console.log("Get listing fees");
  let listingFee = await auctionHouseInstance.listingFee();
  console.log("fees: " + listingFee);
  console.log("List item to 1 ether");
  await auctionHouseInstance.listItem(itemId1, web3.utils.toWei("1", "ether"), {
    from: account1,
    value: listingFee,
  });

  console.log("Get new balance after listing");
  console.log(
    "account1 balance: " +
      (await guardianStuffInstance.balanceOf(account1, itemId1)).toNumber()
  );
  console.log(
    "marketplace balance: " +
      (
        await guardianStuffInstance.balanceOf(
          auctionHouseInstance.address,
          itemId1
        )
      ).toNumber()
  );

  console.log("Get listed items");
  let listedItems = await auctionHouseInstance.getListedItems();
  console.log(listedItems);

  console.log("Buying item");
  await auctionHouseInstance.executeSale(0, {
    from: account2,
    value: web3.utils.toWei("1", "ether"),
  });
  console.log("New balance after the sell");
  console.log(
    "account1 balance: " +
      (await guardianStuffInstance.balanceOf(account1, itemId1)).toNumber()
  );
  console.log(
    "account2 balance: " +
      (await guardianStuffInstance.balanceOf(account2, itemId1)).toNumber()
  );
  console.log(
    "marketplace balance: " +
      (
        await guardianStuffInstance.balanceOf(
          auctionHouseInstance.address,
          itemId1
        )
      ).toNumber()
  );

  console.log("Give approval to the market place to list item of account 2");
  await guardianStuffInstance.setApprovalForAll(
    auctionHouseInstance.address,
    true,
    { from: account2 }
  );
  console.log("Balance before listing");
  console.log(
    "account2 balance: " +
      (await guardianStuffInstance.balanceOf(account2, itemId1)).toNumber()
  );
  await auctionHouseInstance.listItem(itemId1, web3.utils.toWei("1", "ether"), {
    from: account2,
    value: listingFee,
  });
  console.log("New balance after listing");
  console.log(
    "account2 balance: " +
      (await guardianStuffInstance.balanceOf(account2, itemId1)).toNumber()
  );

  console.log("Get new listed items");
  let newListedItems = await auctionHouseInstance.getListedItems();
  console.log(newListedItems);
};
