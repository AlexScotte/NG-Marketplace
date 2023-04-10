// const GuardianToken = artifacts.require("../contracts/Token/GuardianToken.sol");
// const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
// const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");

// const { expect } = require("chai");

// contract("***** ERC20 - Guardian Token Tests *****", (accounts) => {
//   const account0 = accounts[0];
//   const account1 = accounts[1];
//   const account2 = accounts[2];
//  const name = "GUARDIAN";
//  const symbol = "GURD";
//   let erc20;

//   describe("ERC20 Token deployment", function () {
//     beforeEach(async function () {
//       erc20 = await GuardianToken.new({ from: account0 });
//     });

//     describe("Should deployed the new token", function () {
//       it("...Should token named GUARDIAN", async () => {
//         const receipt = await erc20.name({ from: account0 });
//         expect(receipt).equal(name);
//       });

//       it("...Should token symbol be GURD", async () => {
//         const receipt = await erc20.symbol({ from: account0 });
//         expect(receipt).equal(symbol);
//       });

//       it("...Should decimals be 18", async () => {
//         const receipt = await erc20.decimals({ from: account0 });
//         expect(receipt).to.be.bignumber.equal(BN(18));
//       });

//       it("...Should deployer have the token supply", async () => {
//         const totalSupply = await erc20.totalSupply({ from: account0 });
//         const a0Balance = await erc20.balanceOf(account0, { from: account0 });

//         expect(BN(a0Balance)).to.be.bignumber.equal(BN(totalSupply));
//       });

//       it("...Should other account have no token at deployment", async () => {
//         const a1Balance = await erc20.balanceOf(account1, { from: account1 });
//         const a2Balance = await erc20.balanceOf(account2, { from: account2 });

//         expect(BN(a1Balance)).to.be.bignumber.equal(BN(0));
//         expect(BN(a2Balance)).to.be.bignumber.equal(BN(0));
//       });
//     });
//   });

//   describe("ERC20 Token management", function () {
//     beforeEach(async function () {
//       erc20 = await GuardianToken.new({ from: account0 });
//     });

//     it("...Should be able to transfer token", async () => {
//       await erc20.transfer(account1, 99, { from: account0 });

//       const a1Balance = await erc20.balanceOf(account1, { from: account0 });
//       expect(BN(a1Balance)).to.be.bignumber.equal(BN(99));
//     });

//     describe("Let someone else manage my tokens", function () {
//       it("...Should not be able to transfer token without approval", async () => {
//         await expectRevert(
//           erc20.transferFrom(account0, account2, 10, { from: account1 }),
//           "ERC20: insufficient allowance."
//         );
//       });

//       it("...Should be able to give approval and transfer a specified amount from another user", async () => {
//         await erc20.approve(account1, 10, { from: account0 });
//         await erc20.transferFrom(account0, account2, 10, { from: account1 });
//         const a2Balance = await erc20.balanceOf(account2, { from: account2 });
//         expect(BN(a2Balance)).to.be.bignumber.equal(BN(10));
//       });
//       it("...Should not be able to transfer more than approved amount of token from another account", async () => {
//         await erc20.approve(account1, 10, { from: account0 });
//         await expectRevert(
//           erc20.transferFrom(account0, account2, 99, { from: account1 }),
//           "ERC20: insufficient allowance."
//         );
//       });
//     });
//   });
// });
