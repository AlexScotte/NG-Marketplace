const ERC1155Token = artifacts.require("../contracts/Forge/GuardianStuff.sol");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");

const { expect } = require("chai");

contract("***** ERC1155 - Guardian Stuff Tests *****", (accounts) => {
  const account0 = accounts[0];
  const account1 = accounts[1];
  const account2 = accounts[2];
  let erc1155;

  describe("ERC1155 Token deployment", function () {
    beforeEach(async function () {
      erc1155 = await ERC1155Token.new({ from: account0 });
    });

    describe("Define URI of JSON file location", function () {
      it("...Should have an URI set after deployment", async () => {
        const receipt = await erc1155.uri(0, { from: account0 });
        expect(receipt).not.equal("");
        expect(receipt).not.equal(" ");
      });
    });

    describe("Creation of equipments stuff and chests", function () {
      beforeEach(async function () {
        await erc1155.forgeStuff(account0, { from: account0 });
        await erc1155.forgeChests(account0, { from: account0 });
      });

      it("...Should have created some item IDs", async () => {
        const receipt = await erc1155.getItemIDs({ from: account0 });
        expect(receipt.length).greaterThan(0);
      });

      it("...Should the address given in parameter owns all the equipments item", async () => {
        const receipt = await erc1155.getItemIDs({ from: account0 });

        const balanceItem1 = await erc1155.balanceOf(account0, receipt[0]);
        expect(BN(balanceItem1)).to.be.bignumber.greaterThan(BN(0));

        const balanceItem2 = await erc1155.balanceOf(account0, receipt[1]);
        expect(BN(balanceItem2)).to.be.bignumber.greaterThan(BN(0));
      });

      it("...Should the address given in parameter owns all the chests item", async () => {
        const chestItemID = await erc1155.chestItemID({ from: account0 });
        const balanceChests = await erc1155.balanceOf(account0, chestItemID);
        expect(BN(balanceChests)).to.be.bignumber.greaterThan(BN(0));
      });
    });
  });

  describe("ERC1155 Token management", function () {
    let itemIDs;
    let chestItemID;
    beforeEach(async function () {
      erc1155 = await ERC1155Token.new({ from: account0 });
      await erc1155.forgeStuff(account0, { from: account0 });
      await erc1155.forgeChests(account0, { from: account0 });
      itemIDs = await erc1155.getItemIDs({ from: account0 });
      chestItemID = await erc1155.chestItemID({ from: account0 });
    });

    it("...Should be able to transfer stuff item", async () => {
      await erc1155.safeTransferFrom(account0, account1, itemIDs[0], 1, [], {
        from: account0,
      });

      const a1Balance = await erc1155.balanceOf(account1, itemIDs[0], {
        from: account1,
      });

      expect(BN(a1Balance)).to.be.bignumber.greaterThan(BN(0));
    });

    it("...Should be able to transfer chest item", async () => {
      await erc1155.safeTransferFrom(account0, account1, chestItemID, 1, [], {
        from: account0,
      });

      const a1Balance = await erc1155.balanceOf(account1, chestItemID, {
        from: account1,
      });

      expect(BN(a1Balance)).to.be.bignumber.greaterThan(BN(0));
    });

    describe("Let someone else manage my items", function () {
      it("...Should not be able to transfer my items from another account without approval", async () => {
        await expectRevert(
          erc1155.safeTransferFrom(account0, account1, chestItemID, 1, [], {
            from: account1,
          }),
          "ERC1155: caller is not token owner or approved."
        );
      });

      it("...Should be able to give approval and transfer item from another user", async () => {
        await erc1155.setApprovalForAll(account1, true, { from: account0 });
        await erc1155.safeTransferFrom(account0, account2, itemIDs[0], 1, [], {
          from: account1,
        });
        const a2Balance = await erc1155.balanceOf(account2, itemIDs[0], {
          from: account2,
        });
        expect(BN(a2Balance)).to.be.bignumber.equal(BN(1));
      });
    });
  });
});
