const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const onlyOwnerMessage = "Ownable: caller is not the owner";

describe("***** Marketplace - Auction House Tests *****", () => {
  let owner = "";
  let account1 = "";
  let account2 = "";
  let treasure;
  let marketplace;
  let erc20Token;

  async function deployAuctionHouseFixture() {
    const [o, a1, a2] = await ethers.getSigners();

    // Deploy treasure guardian
    const TreasureGuardian = await ethers.getContractFactory(
      "TreasureGuardian"
    );
    const treasureGuardian = await TreasureGuardian.deploy();
    treasure = await treasureGuardian.deployed();

    // Create ERC1155 Collection
    await treasure.createCollection();

    // Get Factory contract
    const ForgeMaster = await ethers.getContractFactory("ForgeMaster");
    factory = ForgeMaster.attach(await treasure.factory());

    // Deploy ERC20 token
    const GuardianToken = await ethers.getContractFactory("GuardianToken");
    const gurdToken = await GuardianToken.deploy();
    erc20Token = await gurdToken.deployed();

    // Initialize treasure guardian with ERC20 token address
    await treasureGuardian.initialize(erc20Token.address);

    // Deploy marketplace with ERC1155 token address
    const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
    const auctionHouse = await AuctionHouse.deploy(
      await treasure.guardianStuff()
    );
    marketplace = await auctionHouse.deployed();

    owner = o;
    account1 = a1;
    account2 = a2;
  }

  describe("Marketplace test", function () {
    beforeEach(async function () {
      // Load contracts
      await loadFixture(deployAuctionHouseFixture);
    });

    describe("Deployment", function () {
      it("...Should marketplace token should be the one created by the factory", async () => {
        const collectionAddress = await factory.collectionAddress();
        const tokenAddr = await marketplace.tokenAddress();
        expect(tokenAddr).equal(collectionAddress);
      });
    });

    describe("Marketplace settings", function () {
      it("...Should owner be able to change the listing fee value", async () => {
        await marketplace.updatelistingFee(ethers.utils.parseEther("0.05"));
        const newListingFees = await marketplace.getlistingFee();
        expect(newListingFees).to.equal(ethers.utils.parseEther("0.05"));
      });
      it("...Should revert if trying to update fees with incorrect value", async () => {
        await expect(marketplace.updatelistingFee(0)).to.be.revertedWith(
          "New listing fee cannot be 0"
        );
      });
      it("...Should revert if it's not the owner trying to update fees", async () => {
        await expect(
          marketplace.connect(account1).updatelistingFee(0)
        ).to.be.revertedWith(onlyOwnerMessage);
      });
    });

    describe("Marketplace usage", function () {
      let erc1155Token;
      let itemIDs;
      beforeEach(async function () {
        // Get deployed ERC1155 token contract
        const GuardianStuff = await ethers.getContractFactory("GuardianStuff");
        erc1155Token = await GuardianStuff.attach(
          await treasure.guardianStuff()
        );

        itemIDs = await erc1155Token.getItemIDs();
      });

      describe("Listing an ERC1155", function () {
        it("...Should revert if the price is not correct", async () => {
          await treasure.safeTransferFrom(
            treasure.address,
            account1.address,
            itemIDs[0],
            10,
            []
          );
          await expect(
            marketplace.listItem(itemIDs[0], 0, {
              value: 0,
            })
          ).to.be.revertedWith("You need to pay listing fees");
        });
        it("...Should revert if listing fees are not correct", async () => {
          await expect(
            marketplace.listItem(itemIDs[0], ethers.utils.parseEther("1"), {
              value: 0,
            })
          ).to.be.revertedWith("You need to pay listing fees");
        });
        it("...Should revert if the user do not give allowance to the marketplace", async () => {
          await expect(
            marketplace.listItem(itemIDs[0], ethers.utils.parseEther("1"), {
              value: 0,
            })
          ).to.be.revertedWith("You need to pay listing fees");
        });
        it("...Should marketplace have one item after listing", async () => {
          await treasure.safeTransferFrom(
            treasure.address,
            account1.address,
            itemIDs[0],
            1,
            []
          );
          await erc1155Token
            .connect(account1)
            .setApprovalForAll(marketplace.address, true);
          await marketplace
            .connect(account1)
            .listItem(itemIDs[0], ethers.utils.parseEther("1"), {
              value: ethers.utils.parseEther("0.01"),
            });
          var receipt = await erc1155Token.balanceOf(
            marketplace.address,
            itemIDs[0]
          );
          expect(receipt).to.equal(1);
        });
        it("...Should generate an event when listing is done", async () => {
          await treasure.safeTransferFrom(
            treasure.address,
            account1.address,
            itemIDs[0],
            1,
            []
          );
          await erc1155Token
            .connect(account1)
            .setApprovalForAll(marketplace.address, true);

          expect(
            await marketplace
              .connect(account1)
              .listItem(itemIDs[0], ethers.utils.parseEther("1"), {
                value: ethers.utils.parseEther("0.01"),
              })
          ).to.emit(marketplace, "ItemListedSuccess");
        });

        describe("Cancel a listed ERC1155", function () {
          beforeEach(async () => {
            await treasure.safeTransferFrom(
              treasure.address,
              account1.address,
              itemIDs[0],
              1,
              []
            );
            await erc1155Token
              .connect(account1)
              .setApprovalForAll(marketplace.address, true);
            await marketplace
              .connect(account1)
              .listItem(itemIDs[0], ethers.utils.parseEther("1"), {
                value: ethers.utils.parseEther("0.01"),
              });
            // var receipt = await erc1155Token.balanceOf(
            //   marketplace.address,
            //   itemIDs[0]
            // );
            // expect(receipt).to.equal(1);
          });

          it("...Should revert if the item doesn't exist in the marketplace", async () => {
            await expect(
              marketplace.connect(account1).cancelSale(99999)
            ).to.be.revertedWith("Item not found in the marketplace");
          });

          it("...Should revert if it's not the seller that try to cancel the sale", async () => {
            await expect(
              marketplace.connect(account2).cancelSale(0)
            ).to.be.revertedWith("You are not the seller of the item");
          });

          it("...Should marketplace have no item after cancelling the only listed item", async () => {
            let receipt = await erc1155Token.balanceOf(
              marketplace.address,
              itemIDs[0]
            );
            expect(receipt).to.equal(1);

            await marketplace.connect(account1).cancelSale(0);

            receipt = await erc1155Token.balanceOf(
              marketplace.address,
              itemIDs[0]
            );
            expect(receipt).to.equal(0);
          });
        });
      });

      describe("Buying an ERC1155", function () {
        let itemIDs;
        const itemPrice = ethers.utils.parseEther("1");
        beforeEach(async function () {
          itemIDs = await erc1155Token.getItemIDs();

          await treasure.safeTransferFrom(
            treasure.address,
            account1.address,
            itemIDs[0],
            1,
            []
          );

          await erc1155Token
            .connect(account1)
            .setApprovalForAll(marketplace.address, true);

          var receipt = await marketplace
            .connect(account1)
            .listItem(itemIDs[0], itemPrice, {
              value: ethers.utils.parseEther("0.01"),
            });
        });

        it("...Should revert if the price not correct", async () => {
          await expect(
            marketplace.connect(account2).executeSale(0, { value: 0 })
          ).to.be.revertedWith("Insufficent price value for this item.");
        });

        it("...Should generate an event when buying an item", async () => {
          expect(
            await marketplace.connect(account2).executeSale(0, {
              value: itemPrice,
            })
          ).to.emit(marketplace, "ItemSoldSuccess");
        });

        it("...Should have one item after buying", async () => {
          await marketplace.connect(account2).executeSale(0, {
            value: itemPrice,
          });

          var receipt = await erc1155Token.balanceOf(
            account2.address,
            itemIDs[0]
          );
          expect(receipt).to.equal(1);
        });

        it("...Should the marketplace have no item after buying", async () => {
          await marketplace.connect(account2).executeSale(0, {
            value: itemPrice,
          });

          var receipt = await erc1155Token.balanceOf(
            marketplace.address,
            itemIDs[0]
          );
          expect(receipt).to.equal(0);
        });
      });
    });
  });
});
