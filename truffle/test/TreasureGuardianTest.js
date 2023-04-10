const Treasure = artifacts.require("../contracts/TreasureGuardian.sol");
const Factory = artifacts.require("../contracts/Forge/ForgeMaster.sol");
const ERC1155Token = artifacts.require("../contracts/Forge/GuardianStuff.sol");
const ERC20Token = artifacts.require("../contracts/Token/GuardianToken.sol");

const Stuff = artifacts.require("../contracts/Forge/Stuff.sol");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const { expect } = require("chai");

contract("***** Treasure Guardian Tests *****", (accounts) => {
  const account0 = accounts[0];
  const account1 = accounts[1];
  const account2 = accounts[2];
  const errorMessageOnlyOwner = "Ownable: caller is not the owner.";
  let treasure;

  describe("Deployment", function () {
    beforeEach(async function () {
      treasure = await Treasure.new({ from: account0 });
    });

    it("...Should have deploy the ERC20 Token", async () => {
      const receipt = await treasure.guardianToken({ from: account0 });
      expect(receipt).not.equal(ZERO_ADDRESS);
    });

    it("...Should have deploy the ERC1155 Factory ", async () => {
      const receipt = await treasure.factory({ from: account0 });
      expect(receipt).not.equal(ZERO_ADDRESS);
    });
  });

  describe("Create ERC155 items collection from treasure contract", function () {
    beforeEach(async function () {
      treasure = await Treasure.new({ from: account0 });
    });

    it("...Should not be able to create the collection if not owner of the treasure contract", async () => {
      await expectRevert(
        treasure.createCollection({ from: account1 }),
        errorMessageOnlyOwner
      );
    });

    it("...Should the owner of the factory be the treasure guardian contract", async () => {
      await treasure.createCollection({ from: account0 });

      const factoryAddr = await treasure.factory({ from: account0 });
      const factory = await Factory.at(factoryAddr);
      const owner = await factory.owner({ from: account0 });
      expect(treasure.address).equal(owner);
    });

    it("...Should items collection be created", async () => {
      await treasure.createCollection({ from: account0 });

      const erc1155Addr = await treasure.guardianStuff({ from: account0 });
      const erc1155 = await ERC1155Token.at(erc1155Addr);
      const itemIDs = await erc1155.getItemIDs({ from: account0 });
      expect(itemIDs.length).greaterThan(0);
    });
  });

  describe("Manage ERC20 from treasure contract", function () {
    let erc20Token;

    beforeEach(async function () {
      treasure = await Treasure.new({ from: account0 });
      await treasure.createCollection({ from: account0 });
      const erc20Addr = await treasure.guardianToken({ from: account0 });
      erc20Token = await ERC20Token.at(erc20Addr);
    });

    it("...Should treasure contract be able to send ERC20 token to another account", async () => {
      await treasure.rewardGuardianWithToken(account1, 10, { from: account0 });
      const balanceOfa1 = await erc20Token.balanceOf(account1, {
        from: account1,
      });
      expect(BN(balanceOfa1)).to.be.bignumber.equal(BN(10));
    });
  });

  describe("Manage ERC1155 from treasure contract", function () {
    let erc1155Token;
    let itemIDs;
    beforeEach(async function () {
      treasure = await Treasure.new({ from: account0 });
      await treasure.createCollection({ from: account0 });
      const erc1155Addr = await treasure.guardianStuff({ from: account0 });
      erc1155Token = await ERC1155Token.at(erc1155Addr);
      itemIDs = await erc1155Token.getItemIDs({ from: account0 });
    });

    it("...Should owner be able to transfer ERC1155 Token owned by treasure contract to another account", async () => {
      await treasure.safeTransferFrom(
        treasure.address,
        account1,
        itemIDs[0],
        10,
        [],
        {
          from: account0,
        }
      );
      const balanceOfa1 = await erc1155Token.balanceOf(account1, itemIDs[0], {
        from: account1,
      });
      expect(BN(balanceOfa1)).to.be.bignumber.equal(BN(10));
    });
  });

  describe("Manage exchange of ERC20 token to ER1155", function () {
    let erc1155Token;
    let erc20Token;
    let itemIDs;
    let chestPrice;
    let chestItemID;

    beforeEach(async function () {
      treasure = await Treasure.new({ from: account0 });
      await treasure.createCollection({ from: account0 });
      const erc20Addr = await treasure.guardianToken({ from: account0 });
      erc20Token = await ERC20Token.at(erc20Addr);
      const erc1155Addr = await treasure.guardianStuff({ from: account0 });
      erc1155Token = await ERC1155Token.at(erc1155Addr);

      await treasure.rewardGuardianWithToken(
        account1,
        web3.utils.toWei(BN(1500)),
        {
          from: account0,
        }
      );

      chestPrice = BN(await treasure.chestPrice());
      chestItemID = await erc1155Token.chestItemID();
    });

    describe("Buy ERC1155 Token chest against ERC20 Token", function () {
      it("...Should revert if no ERC20 approval ", async () => {
        await expectRevert(
          treasure.buyChest(1, {
            from: account1,
          }),
          "ERC20: insufficient allowance."
        );
      });

      it("...Should be able to exchange after ERC20 approval", async () => {
        await erc20Token.approve(treasure.address, chestPrice, {
          from: account1,
        });

        await treasure.buyChest(1, {
          from: account1,
        });

        const balanceOfa1 = await erc1155Token.balanceOf(
          account1,
          chestItemID,
          {
            from: account1,
          }
        );
        expect(BN(balanceOfa1)).to.be.bignumber.equal(BN(1));
      });
    });

    describe("Open ERC1155 Token chest and get other ERC1155 Token", function () {
      beforeEach(async function () {
        await erc20Token.approve(treasure.address, chestPrice, {
          from: account1,
        });

        await treasure.buyChest(1, {
          from: account1,
        });
      });

      it("...Should be able to open a chest item", async () => {
        await erc20Token.approve(treasure.address, chestPrice, {
          from: account1,
        });

        await erc1155Token.setApprovalForAll(treasure.address, true, {
          from: account1,
        });

        const receipt = await treasure.openChest({
          from: account1,
        });

        expectEvent(receipt, "onStuffTransferedTo", { to: account1 });
      });

      it("...Should revert if user has no more chest to open", async () => {
        await erc20Token.approve(treasure.address, chestPrice, {
          from: account1,
        });

        await erc1155Token.setApprovalForAll(treasure.address, true, {
          from: account1,
        });

        await treasure.openChest({
          from: account1,
        });

        await expectRevert(
          treasure.openChest({
            from: account1,
          }),
          "Sorry Guardian, you do not have any chest in your inventory"
        );
      });

      it("...Should revert if owner do not change correctly the items rate drop", async () => {
        await expectRevert(
          treasure.modifyDropRate(70, 30, 30, 30, 30, { from: account0 }),
          "Sum of the drop rate must be egal to 100"
        );
      });
    });
  });
});
