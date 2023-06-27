const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const onlyOwnerMessage = "Ownable: caller is not the owner";
const insufficientAlowanceMessage = "ERC20: insufficient allowance";

describe("***** Treasure Guardian Tests *****", () => {
  let owner = "";
  let account1 = "";
  let account2 = "";
  let treasure = "";
  let erc20Token = "";
  let factory = "";

  async function deployContractsFixture() {
    const [o, a1, a2] = await ethers.getSigners();

    // Deploy Treasure guardian contract
    const TreasureGuardian = await ethers.getContractFactory(
      "TreasureGuardian"
    );
    const treasureGuardian = await TreasureGuardian.deploy();
    treasure = await treasureGuardian.deployed();

    // Deploy ERC20 token
    const GuardianToken = await ethers.getContractFactory("GuardianToken");
    const guardianToken = await GuardianToken.deploy();
    erc20Token = await guardianToken.deployed();

    // Deploy Factory contract
    const ForgeMaster = await ethers.getContractFactory("ForgeMaster");
    const forgeMaster = await ForgeMaster.deploy();
    factory = await forgeMaster.deployed();

    // Create ERC1155 Collection
    await forgeMaster.createCollection("Node Guardians Alyra Collection");
    const erc1155CollectionAddr = await forgeMaster.collectionAddress();
    await forgeMaster.forgeCollection(treasure.address);

    // Initialize treasure guardian contract with erc20 token address
    await treasureGuardian.initialize(
      erc20Token.address,
      erc1155CollectionAddr
    );
    owner = o;
    account1 = a1;
    account2 = a2;
  }

  beforeEach(async function () {
    await loadFixture(deployContractsFixture);
  });

  describe("Deployment", function () {
    it("...Should have deploy the ERC20 Token", async () => {
      const receipt = await treasure.guardianToken();
      expect(receipt).not.equal(ZERO_ADDRESS);
    });

    it("...Should have deploy the ERC1155 Factory ", async () => {
      const receipt = await treasure.guardianStuff();
      expect(receipt).not.equal(ZERO_ADDRESS);
    });
  });

  describe("Manage ERC20 from treasure contract", function () {
    beforeEach(async function () {
      await erc20Token.mint(treasure.address);
    });

    it("...Should treasure contract be able to send ERC20 token to another account", async () => {
      await treasure.rewardGuardianWithToken(account1.address, 10);
      const balanceOfa1 = await erc20Token
        .connect(account1)
        .balanceOf(account1.address);
      expect(balanceOfa1).to.be.equal(10);
    });
  });

  describe("Manage ERC1155 from treasure contract", function () {
    let erc1155Token;
    let itemIDs;
    beforeEach(async function () {
      const ERC1155Token = await ethers.getContractFactory("GuardianStuff");
      const erc1155Addr = await treasure.guardianStuff();
      erc1155Token = await ERC1155Token.attach(erc1155Addr);
      itemIDs = await erc1155Token.getItemIDs();
    });

    it("...Should owner be able to transfer ERC1155 Token owned by treasure contract to another account", async () => {
      await treasure.safeTransferFrom(
        treasure.address,
        account1.address,
        itemIDs[0],
        10,
        []
      );
      const balanceOfa1 = await erc1155Token
        .connect(account1)
        .balanceOf(account1.address, itemIDs[0]);
      expect(balanceOfa1).to.be.equal(10);
    });
  });

  describe("Manage exchange of ERC20 token to ER1155", function () {
    let erc1155Token;
    let itemIDs;
    let chestPrice;
    let chestItemID;

    beforeEach(async function () {
      const ERC1155Token = await ethers.getContractFactory("GuardianStuff");
      const erc1155Addr = await treasure.guardianStuff();
      erc1155Token = await ERC1155Token.attach(erc1155Addr);
      itemIDs = await erc1155Token.getItemIDs();

      await erc20Token.mint(treasure.address);

      await treasure.rewardGuardianWithToken(
        account1.address,
        ethers.utils.parseEther("1500")
      );

      chestPrice = await treasure.chestPrice();
      chestItemID = await erc1155Token.chestItemID();
    });

    describe("Buy ERC1155 Token chest against ERC20 Token", function () {
      it("...Should revert if no ERC20 approval ", async () => {
        await expect(treasure.connect(account1).buyChest(1)).to.be.revertedWith(
          insufficientAlowanceMessage
        );
      });

      it("...Should be able to exchange after ERC20 approval", async () => {
        await erc20Token
          .connect(account1)
          .approve(treasure.address, chestPrice);

        await treasure.connect(account1).buyChest(1);

        const balanceOfa1 = await erc1155Token
          .connect(account1)
          .balanceOf(account1.address, chestItemID);
        expect(balanceOfa1).to.be.equal(1);
      });
    });

    describe("Open ERC1155 Token chest and get other ERC1155 Token", function () {
      beforeEach(async function () {
        await erc20Token
          .connect(account1)
          .approve(treasure.address, chestPrice);

        await treasure.connect(account1).buyChest(1);
      });

      it("...Should be able to open a chest item", async () => {
        await erc20Token
          .connect(account1)
          .approve(treasure.address, chestPrice);

        await erc1155Token
          .connect(account1)
          .setApprovalForAll(treasure.address, true);

        await expect(await treasure.connect(account1).openChest()).to.emit(
          treasure,
          "onStuffTransferedTo"
        );
      });

      it("...Should revert if user has no more chest to open", async () => {
        await erc20Token
          .connect(account1)
          .approve(treasure.address, chestPrice);

        await erc1155Token
          .connect(account1)
          .setApprovalForAll(treasure.address, true);

        await treasure.connect(account1).openChest();

        await expect(treasure.connect(account1).openChest()).to.be.revertedWith(
          "Sorry Guardian, you do not have any chest in your inventory."
        );
      });

      it("...Should revert if owner do not change correctly the items rate drop", async () => {
        await expect(
          treasure.modifyDropRate(70, 30, 30, 30, 30)
        ).to.be.revertedWith("Sum of the drop rate must be egal to 100");
      });
    });
  });
});
