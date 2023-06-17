async function main() {
  [owner, a1, a2, a3] = await ethers.getSigners();
  const rewardQuest = 1500;

  const deployer = require("./deployer");
  const { treasureGuardian, guardianStuff, guardianToken, auctionHouse } =
    await deployer.deploy();

  console.log("******************************");
  console.log("Contract deployed, start adding data");

  let balanceOfGuardiantToken = await guardianToken.balanceOf(
    treasureGuardian.address
  );
  console.log(
    "Treasure ERC20 token balance: " + balanceOfGuardiantToken.toString()
  );

  // Send reward to user1
  console.log("Send ERC20 rewards to user1: " + a1.address);
  await treasureGuardian.rewardGuardianWithToken(
    a1.address,
    ethers.utils.parseEther(rewardQuest.toString())
  );
  console.log("Rewards sent to user1");

  // User1 token balance after sending from treasure contract
  balanceOfGuardiantToken = await guardianToken.balanceOf(a1.address);
  console.log(
    "User1 ERC20 token balance after sending from treasure contract: " +
      balanceOfGuardiantToken
  );

  // Get chest price
  console.log("Get chest price");
  const chestPrice = await treasureGuardian.chestPrice();
  console.log("Chest price: " + chestPrice.toString());

  // Approve treasure contract to use User1 token
  console.log("Approve treasure contract to use User1 token");
  await guardianToken.connect(a1).approve(treasureGuardian.address, chestPrice);
  console.log("Approved");

  const itemChestID = await guardianStuff.chestItemID();
  console.log("ERC1155 chest ID: " + itemChestID);

  // Buying 2 chests
  console.log("Buying 1 chest");
  await treasureGuardian.connect(a1).buyChest(1);
  console.log("Chests bought");

  console.log(
    "Tresure ERC20 token balance: " +
      (await guardianToken.balanceOf(treasureGuardian.address))
  );
  console.log(
    "Tresure ERC1155 chest item balance: " +
      (await guardianStuff.balanceOf(treasureGuardian.address, itemChestID))
  );

  console.log(
    "User1 ERC20 token balance: " + (await guardianToken.balanceOf(a1.address))
  );
  console.log(
    "User1 ERC1155 chest item balance: " +
      (await guardianStuff.balanceOf(a1.address, itemChestID))
  );

  // Opening chest
  console.log("Opening 1 chest for User1");
  let itemIDs = [];
  console.log("Approve treasure guardian to take back the chest");
  await guardianStuff
    .connect(a1)
    .setApprovalForAll(treasureGuardian.address, true);
  console.log("Openning chest");
  itemIDs = await treasureGuardian.connect(a1).openChest();
  console.log(
    "User1 ERC1155 chest item balance after opening chest: " +
      (await guardianStuff.balanceOf(a1.address, itemChestID)).toNumber()
  );
  console.log(
    "Tresure ERC1155 chest item balance: " +
      (await guardianStuff.balanceOf(treasureGuardian.address, itemChestID))
  );

  const itemId1 = 1110;
  const itemId2 = 1111;
  const itemId3 = 1112;
  const itemId4 = 1113;

  console.log(
    "ERC1155 item 1 balance in Treasure: " +
      (await guardianStuff.balanceOf(treasureGuardian.address, itemId1))
  );

  console.log(
    "ERC1155 item 2 balance in Treasure: " +
      (await guardianStuff.balanceOf(treasureGuardian.address, itemId2))
  );

  console.log(
    "Transfert one ERC1155 item 1 from the treasure contract to the User2"
  );
  await treasureGuardian.safeTransferFrom(
    treasureGuardian.address,
    a2.address,
    itemId1,
    1,
    []
  );

  console.log(
    "New ERC1155 item 1 balance in Treasure: " +
      (await guardianStuff.balanceOf(treasureGuardian.address, itemId1))
  );

  console.log(
    "ERC1155 item 1 User2 balance: " +
      (await guardianStuff.balanceOf(a2.address, itemId1)).toNumber()
  );

  console.log("Give approval to the marketplace to list items of User2");
  await guardianStuff.connect(a2).setApprovalForAll(auctionHouse.address, true);

  console.log("Get listing fees");
  let listingFee = await auctionHouse.listingFee();
  console.log("fees: " + listingFee);
  console.log(
    "Marketplace balance before listing: " +
      (await auctionHouse.auctionHouseFunds())
  );

  console.log("User2 list item to 1 ether");
  await auctionHouse
    .connect(a2)
    .listItem(itemId1, ethers.utils.parseEther("1"), {
      value: listingFee,
    });

  console.log(
    "Marketplace balance after listing: " +
      (await auctionHouse.auctionHouseFunds())
  );

  console.log(
    "ERC1155 item 1 User2 balance: " +
      (await guardianStuff.balanceOf(a2.address, itemId1)).toNumber()
  );

  console.log(
    "ERC1155 item 1 Marketplace balance: " +
      (await guardianStuff.balanceOf(auctionHouse.address, itemId1)).toNumber()
  );

  console.log("Get listed items on the marketplace: ");
  let listedItems = await auctionHouse.getListedItems();
  console.log(listedItems);

  console.log("Buying item from User1");
  await auctionHouse.connect(a1).executeSale(0, {
    value: ethers.utils.parseEther("1"),
  });
  console.log("New balance of ERC1155 item 1 after the sale");
  console.log(
    "User1 balance: " + (await guardianStuff.balanceOf(a1.address, itemId1))
  );
  console.log(
    "User2 balance: " + (await guardianStuff.balanceOf(a2.address, itemId1))
  );
  console.log(
    "Marketplace balance: " +
      (await guardianStuff.balanceOf(auctionHouse.address, itemId1))
  );

  console.log("Give approval to the market place to list item of User1");
  await guardianStuff.connect(a1).setApprovalForAll(auctionHouse.address, true);
  console.log("Balance before listing");
  console.log(
    "User1 balance: " + (await guardianStuff.balanceOf(a1.address, itemId1))
  );
  console.log(
    "Marketplace balance: " +
      (await guardianStuff.balanceOf(auctionHouse.address, itemId1))
  );
  await auctionHouse
    .connect(a1)
    .listItem(itemId1, ethers.utils.parseEther("1"), {
      value: listingFee,
    });
  console.log("New balance after listing");
  console.log(
    "User1 balance: " + (await guardianStuff.balanceOf(a2.address, itemId1))
  );
  console.log(
    "Marketplace balance: " +
      (await guardianStuff.balanceOf(auctionHouse.address, itemId1))
  );
  console.log("Get new listed items");
  let newListedItems = await auctionHouse.getListedItems();
  console.log(newListedItems);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
