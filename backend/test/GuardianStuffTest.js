const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const callerNotApprovedMessage =
  "ERC1155: caller is not token owner or approved";

describe("***** ERC1155 - Guardian Stuff Tests *****", () => {
  let owner = "";
  let account1 = "";
  let account2 = "";
  let erc1155Token = "";

  async function deployGuardianStuffTokenFixture() {
    const [o, a1, a2] = await ethers.getSigners();

    // Deploy ERC20 Token contract
    const GuardianStuff = await ethers.getContractFactory("GuardianStuff");
    const guardianStuff = await GuardianStuff.deploy();
    erc1155Token = await guardianStuff.deployed();

    owner = o;
    account1 = a1;
    account2 = a2;
  }

  beforeEach(async () => {
    await loadFixture(deployGuardianStuffTokenFixture);
  });

  describe("ERC1155 Token deployment", function () {
    describe("Define URI of JSON file location", function () {
      it("...Should have an URI set after deployment", async () => {
        const receipt = await erc1155Token.uri(0);
        expect(receipt).not.equal("");
        expect(receipt).not.equal(" ");
      });
    });

    describe("Creation of equipments stuff and chests", function () {
      beforeEach(async function () {
        // Create ERC1155 Token items
        await erc1155Token.forgeStuff(owner.address);
        await erc1155Token.forgeChests(owner.address);
      });

      it("...Should have created some item IDs", async () => {
        const receipt = await erc1155Token.getItemIDs();
        expect(receipt.length).to.greaterThan(0);
      });

      it("...Should the address given in parameter owns all the equipments item", async () => {
        const receipt = await erc1155Token.getItemIDs();

        const balanceItem1 = await erc1155Token.balanceOf(
          owner.address,
          receipt[0]
        );
        expect(balanceItem1).to.greaterThan(0);

        const balanceItem2 = await erc1155Token.balanceOf(
          owner.address,
          receipt[1]
        );
        expect(balanceItem2).to.greaterThan(0);
      });

      it("...Should the address given in parameter owns all the chests item", async () => {
        const chestItemID = await erc1155Token.chestItemID();
        const balanceChests = await erc1155Token.balanceOf(
          owner.address,
          chestItemID
        );
        expect(balanceChests).to.greaterThan(0);
      });
    });
  });

  describe("ERC1155 Token management", function () {
    let itemIDs;
    let chestItemID;
    beforeEach(async function () {
      await erc1155Token.forgeStuff(owner.address);
      await erc1155Token.forgeChests(owner.address);
      itemIDs = await erc1155Token.getItemIDs();
      chestItemID = await erc1155Token.chestItemID();
    });

    it("...Should be able to transfer stuff item", async () => {
      await erc1155Token.safeTransferFrom(
        owner.address,
        account1.address,
        itemIDs[0],
        1,
        []
      );

      const a1Balance = await erc1155Token
        .connect(account1)
        .balanceOf(account1.address, itemIDs[0]);

      expect(a1Balance).to.greaterThan(0);
    });

    it("...Should be able to transfer chest item", async () => {
      await erc1155Token.safeTransferFrom(
        owner.address,
        account1.address,
        chestItemID,
        1,
        []
      );

      const a1Balance = await erc1155Token
        .connect(account1)
        .balanceOf(account1.address, chestItemID);

      expect(a1Balance).to.greaterThan(0);
    });

    describe("Let someone else manage my items", function () {
      it("...Should not be able to transfer my items from another account without approval", async () => {
        await expect(
          erc1155Token
            .connect(account1)
            .safeTransferFrom(
              owner.address,
              account1.address,
              chestItemID,
              1,
              []
            )
        ).to.be.revertedWith(callerNotApprovedMessage);
      });

      it("...Should be able to give approval and transfer item from another user", async () => {
        await erc1155Token.setApprovalForAll(account1.address, true);
        await erc1155Token
          .connect(account1)
          .safeTransferFrom(owner.address, account2.address, itemIDs[0], 1, []);
        const a2Balance = await erc1155Token
          .connect(account2)
          .balanceOf(account2.address, itemIDs[0]);
        expect(a2Balance).to.equal(1);
      });
    });
  });
});
