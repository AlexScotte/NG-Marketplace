const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("***** Factory - Forge Master Tests *****", () => {
  const collectionName = "Node Guardian Alyra Collection";
  let owner = "";
  let account1 = "";
  let account2 = "";
  let factory = "";

  async function deployForgeMasterFixture() {
    const [o, a1, a2] = await ethers.getSigners();

    // Deploy factory contract
    const ForgeMaster = await ethers.getContractFactory("ForgeMaster");
    const forgeMaster = await ForgeMaster.deploy();
    await forgeMaster.deployed();

    factory = forgeMaster;
    owner = o;
    account1 = a1;
    account2 = a2;
  }

  describe("Collection deployment and creation", function () {
    beforeEach(async function () {
      await loadFixture(deployForgeMasterFixture);

      // Create ERC1155 token collection
      await factory.createCollection(collectionName);
    });

    it("...Should collection named as expected 'Node Guardian Alyra Collection'", async () => {
      const receipt = await factory.collectionName();
      expect(receipt).equal(collectionName);
    });

    it("...Should collection be correctly deployed at an address ", async () => {
      const receipt = await factory.collectionAddress();
      expect(receipt).not.equal(ZERO_ADDRESS);
    });
  });

  describe("Forge items collection from the factory", function () {
    beforeEach(async function () {
      await loadFixture(deployForgeMasterFixture);

      // Create ERC1155 token collection and create all items
      await factory.createCollection(collectionName);
      await factory.forgeCollection();
    });

    it("...Should ERC1155 token be created at collection address", async () => {
      const collectionAddress = await factory.collectionAddress();

      const GuardianStuff = await ethers.getContractFactory("GuardianStuff");
      const erc1155 = await GuardianStuff.attach(collectionAddress);
      const receipt = await erc1155.uri(0);
      expect(receipt).not.equal("");
      expect(receipt).not.equal(" ");
    });
  });
});
