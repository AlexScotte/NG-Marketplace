const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const onlyOwnerMessage = "Ownable: caller is not the owner";
const insufficientAlowance = "ERC20: insufficient allowance";

describe("***** guardianToken - Guardian Token Tests *****", function () {
  const name = "GUARDIAN";
  const symbol = "GURD";
  let erc20Token = "";
  let owner = "";
  let account1 = "";
  let account2 = "";

  async function deployGuardianTokenTokenFixture() {
    const [o, a1, a2] = await ethers.getSigners();
    const GuardianToken = await ethers.getContractFactory("GuardianToken");
    const guardianToken = await GuardianToken.deploy();
    erc20Token = await guardianToken.deployed();

    owner = o;
    account1 = a1;
    account2 = a2;
  }

  beforeEach(async () => {
    await loadFixture(deployGuardianTokenTokenFixture);
  });

  describe("guardianToken Token deployment", function () {
    describe("Should deployed the new token", function () {
      it("...Should token named GUARDIAN", async () => {
        const receipt = await erc20Token.name();
        expect(receipt).to.equal(name);
      });

      it("...Should token symbol be GURD", async () => {
        const receipt = await erc20Token.symbol();
        expect(receipt).equal(symbol);
      });

      it("...Should decimals be 18", async () => {
        const receipt = await erc20Token.decimals();
        expect(receipt).to.equal(18);
      });

      it("...Should other account have no token at deployment", async () => {
        const a1Balance = await erc20Token.balanceOf(account1.address);
        const a2Balance = await erc20Token.balanceOf(account2.address);

        expect(a1Balance).to.be.equal(0);
        expect(a2Balance).to.be.equal(0);
      });

      it("...Should revert if someone other than the owner try to mint", async () => {
        await expect(
          erc20Token.connect(account1).mint(account1.address)
        ).to.be.revertedWith(onlyOwnerMessage);
      });

      it("...Should have a token supply after owner minted", async () => {
        await erc20Token.mint(account1.address);
        const totalSupply = await erc20Token.totalSupply();

        expect(totalSupply).to.greaterThan(0);
      });

      it("...Should chosen address have the token supply after owner minted", async () => {
        await erc20Token.mint(account1.address);
        const totalSupply = await erc20Token.totalSupply();
        const a1Balance = await erc20Token.balanceOf(account1.address);

        expect(a1Balance).to.equal(totalSupply);
      });
    });
  });

  describe("guardianToken Token management", function () {
    beforeEach(async () => {
      await erc20Token.connect(owner).mint(account1.address);
    });

    it("...Should be able to transfer token", async () => {
      await erc20Token.connect(account1).transfer(account2.address, 99);

      const a2Balance = await erc20Token.balanceOf(account2.address);
      expect(a2Balance).to.equal(99);
    });

    describe("Let someone else manage my tokens", function () {
      it("...Should not be able to transfer token without approval", async () => {
        await expect(
          erc20Token
            .connect(owner)
            .transferFrom(account1.address, account2.address, 10)
        ).to.be.revertedWith(insufficientAlowance);
      });

      it("...Should be able to give approval and transfer a specified amount from another user", async () => {
        await erc20Token.connect(account1).approve(account2.address, 10);
        await erc20Token
          .connect(account2)
          .transferFrom(account1.address, owner.address, 10);
        const ownerBalance = await erc20Token
          .connect(account2)
          .balanceOf(owner.address);
        expect(ownerBalance).to.equal(10);
      });
      it("...Should not be able to transfer more than approved amount of token from another account", async () => {
        await erc20Token.approve(account1.address, 10);
        await expect(
          erc20Token
            .connect(account1)
            .transferFrom(owner.address, account2.address, 99)
        ).to.be.revertedWith(insufficientAlowance);
      });
    });
  });
});
