const Marketplace = artifacts.require("../contracts/AuctionHouse.sol");
const Treasure = artifacts.require("../contracts/TreasureGuardian.sol");
const Factory = artifacts.require("../contracts/Forge/ForgeMaster.sol");
const ERC1155Token = artifacts.require("../contracts/Forge/GuardianStuff.sol");
const ERC20Token = artifacts.require("../contracts/Token/GuardianToken.sol");

const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const { expect } = require("chai");

contract("***** Marketplace - Auction House Tests *****", (accounts) => {
  const account0 = accounts[0];
  const account1 = accounts[1];
  const account2 = accounts[2];
  const errorMessageOnlyOwner = "Ownable: caller is not the owner.";
  let treasure;
  let marketplace;
  let erc1155Token;
  let collectionAddress;

  describe("Marketplace test", function () {
    beforeEach(async function () {
      treasure = await Treasure.new({ from: account0 });
      await treasure.createCollection();
      const factoryAddr = await treasure.factory({ from: account0 });
      const factory = await Factory.at(factoryAddr);
      collectionAddress = await factory.collectionAddress({ from: account0 });

      marketplace = await Marketplace.new(await treasure.guardianStuff(), {
        from: account0,
      });
    });

    describe("Deployment", function () {
      it("...Should marketplace token should be the one created by the factory", async () => {
        const tokenAddr = await marketplace.tokenAddress({ from: account0 });
        expect(tokenAddr).equal(collectionAddress);
      });
    });

    describe("Marketplace settings", function () {
      it("...Should owner be able to change the listing fee value", async () => {
        await marketplace.updatelistingFee(web3.utils.toWei("0.05"), {
          from: account0,
        });
        const newListingFees = await marketplace.getlistingFee();
        expect(BN(newListingFees)).to.be.bignumber.equal(
          BN(web3.utils.toWei("0.05"))
        );
      });
      it("...Should revert if trying to update fees with incorrect value", async () => {
        await expectRevert(
          marketplace.updatelistingFee(0, { from: account0 }),
          "New listing fee cannot be 0"
        );
      });
      it("...Should revert if it's not the owner trying to update fees", async () => {
        await expectRevert(
          marketplace.updatelistingFee(0, { from: account1 }),
          " Ownable: caller is not the owner."
        );
      });
    });

    describe("Marketplace usage", function () {
      let itemIDs;
      beforeEach(async function () {
        const tokenAddr = await treasure.guardianStuff({ from: account0 });
        erc1155Token = await ERC1155Token.at(tokenAddr);
        itemIDs = await erc1155Token.getItemIDs({ from: account0 });
      });

      describe("Listing an ERC1155", function () {
        it("...Should revert if the price is not correct", async () => {
          await treasure.safeTransferFrom(
            treasure.address,
            account1,
            itemIDs[0],
            10,
            [],
            { from: account0 }
          );
          await expectRevert(
            marketplace.listItem(itemIDs[0], 0, {
              from: account0,
              value: 0,
            }),
            "You need to pay listing fees."
          );
        });
        it("...Should revert if listing fees are not correct", async () => {
          await expectRevert(
            marketplace.listItem(itemIDs[0], web3.utils.toWei("1"), {
              from: account0,
              value: 0,
            }),
            "You need to pay listing fees."
          );
        });
        it("...Should revert if the user do not give allowance to the marketplace", async () => {
          await expectRevert(
            marketplace.listItem(itemIDs[0], web3.utils.toWei("1"), {
              from: account0,
              value: 0,
            }),
            "You need to pay listing fees."
          );
        });
        it("...Should marketplace have one item after listing", async () => {
          await treasure.safeTransferFrom(
            treasure.address,
            account1,
            itemIDs[0],
            1,
            [],
            { from: account0 }
          );
          await erc1155Token.setApprovalForAll(marketplace.address, true, {
            from: account1,
          });
          await marketplace.listItem(itemIDs[0], web3.utils.toWei("1"), {
            from: account1,
            value: web3.utils.toWei("0.01"),
          });
          var receipt = await erc1155Token.balanceOf(
            marketplace.address,
            itemIDs[0]
          );
          expect(BN(receipt)).to.be.bignumber.equal(BN(1));
        });
        it("...Should generate an event when listing is done", async () => {
          await treasure.safeTransferFrom(
            treasure.address,
            account1,
            itemIDs[0],
            1,
            [],
            { from: account0 }
          );
          await erc1155Token.setApprovalForAll(marketplace.address, true, {
            from: account1,
          });
          var receipt = await marketplace.listItem(
            itemIDs[0],
            web3.utils.toWei("1"),
            {
              from: account1,
              value: web3.utils.toWei("0.01"),
            }
          );
          expectEvent(receipt, "ItemListedSuccess", { seller: account1 });
        });
      });

      describe("Buying an ERC1155", function () {
        let itemIDs;
        const itemPrice = web3.utils.toWei("1");
        beforeEach(async function () {
          const tokenAddr = await treasure.guardianStuff({ from: account0 });
          erc1155Token = await ERC1155Token.at(tokenAddr);
          itemIDs = await erc1155Token.getItemIDs({ from: account0 });

          await treasure.safeTransferFrom(
            treasure.address,
            account1,
            itemIDs[0],
            1,
            [],
            { from: account0 }
          );

          await erc1155Token.setApprovalForAll(marketplace.address, true, {
            from: account1,
          });

          var receipt = await marketplace.listItem(itemIDs[0], itemPrice, {
            from: account1,
            value: web3.utils.toWei("0.01"),
          });
        });

        it("...Should revert if the price not correct", async () => {
          await expectRevert(
            marketplace.executeSale(0, { from: account2, value: 0 }),
            "Insufficent price value for this item."
          );
        });

        it("...Should generate an event when buying an item", async () => {
          var receipt = await marketplace.executeSale(0, {
            from: account2,
            value: itemPrice,
          });

          expectEvent(receipt, "ItemSoldSuccess", { buyer: account2 });
        });

        it("...Should have one item after buying", async () => {
          await marketplace.executeSale(0, {
            from: account2,
            value: itemPrice,
          });

          var receipt = await erc1155Token.balanceOf(account2, itemIDs[0]);
          expect(BN(receipt)).to.be.bignumber.equal(BN(1));
        });

        it("...Should the marketplace have no item after buying", async () => {
          await marketplace.executeSale(0, {
            from: account2,
            value: itemPrice,
          });

          var receipt = await erc1155Token.balanceOf(
            marketplace.address,
            itemIDs[0]
          );
          expect(BN(receipt)).to.be.bignumber.equal(BN(0));
        });
      });
    });
  });
});
