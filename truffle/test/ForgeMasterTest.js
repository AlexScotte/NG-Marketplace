// const Factory = artifacts.require("../contracts/Forge/ForgeMaster.sol");
// const ERC1155Token = artifacts.require("../contracts/Forge/GuardianStuff.sol");

// const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
// const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");

// const { expect } = require("chai");

// contract("***** Factory - Forge Master Tests *****", (accounts) => {
//   const account0 = accounts[0];
//   const account1 = accounts[1];
//   const account2 = accounts[2];
//   const collectionName = "Node Guardian Alyra Collection";

//   let factory;

//   describe("Collection deployment and creation", function () {
//     beforeEach(async function () {
//       factory = await Factory.new({ from: account0 });
//       await factory.createCollection(collectionName, { from: account0 });
//     });

//     it("...Should collection named as expected 'Node Guardian Alyra Collection'", async () => {
//       const receipt = await factory.collectionName({ from: account0 });
//       expect(receipt).equal(collectionName);
//     });

//     it("...Should collection be correctly deployed at an address ", async () => {
//       const receipt = await factory.collectionAddress.call({ from: account0 });
//       expect(receipt).not.equal(ZERO_ADDRESS);
//     });
//   });

//   describe("Forge items collection from the factory", function () {
//     beforeEach(async function () {
//       factory = await Factory.new({ from: account0 });
//       await factory.createCollection(collectionName, { from: account0 });
//       await factory.forgeCollection({ from: account0 });
//     });

//     it("...Should ERC1155 token be created at collection address", async () => {
//       const collectionAddress = await factory.collectionAddress.call({
//         from: account0,
//       });

//       const erc1155 = await ERC1155Token.at(collectionAddress);
//       const receipt = await erc1155.uri(0, { from: account0 });
//       expect(receipt).not.equal("");
//       expect(receipt).not.equal(" ");
//     });
//   });
// });
