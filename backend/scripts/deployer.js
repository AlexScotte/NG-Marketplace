const { kMaxLength } = require("buffer");
const { network } = require("hardhat");
const contractFrontFolder = "../../frontend/src/contracts";

module.exports = {
  deploy: async function () {
    // This is just a convenience check
    if (network.name === "hardhat") {
      console.warn(
        "You are trying to deploy a contract to the Hardhat Network, which" +
          "gets automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      );
    }

    // Ethers is available in the global scope
    const [deployer] = await ethers.getSigners();
    console.log(
      "Deploying the contracts with the account:",
      await deployer.getAddress()
    );
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Deploy TreasureGuardian
    const treasureGuardianName = "TreasureGuardian";
    const treasureGuardian = await this.deployContract(treasureGuardianName);

    // Deploy ERC20
    const guardianTokenName = "GuardianToken";
    const guardianToken = await this.deployContract(guardianTokenName);

    // Mint ERC20 for TreasureGuardian
    console.log(
      "Mint ERC20 tokens and give them to treasure guardian contract"
    );
    await guardianToken.mint(treasureGuardian.address);

    // Create ERC1155 collection with the factory
    const ForgeMaster = await ethers.getContractFactory("ForgeMaster");
    const forgeMaster = await ForgeMaster.deploy();
    await forgeMaster.deployed();

    console.log("Creating collection...");
    const txCreateCollection = await forgeMaster.createCollection(
      "Node Guardians Alyra Collection"
    );
    await txCreateCollection.wait();
    const erc1155CollectionAddr = await forgeMaster.collectionAddress();
    console.log("Collection created !");
    console.log(
      "Collection address: " + (await forgeMaster.collectionAddress())
    );
    console.log("Forging collection...");
    const txForgeCollection = await forgeMaster.forgeCollection(
      treasureGuardian.address
    );
    await txForgeCollection.wait();
    console.log("Collection forged !");

    // Initialize TreasureGuardian with ERC20 and ERC155 token address
    console.log("Initialize treasure guardian");
    var txTreasureInitialize = await treasureGuardian.initialize(
      guardianToken.address,
      erc1155CollectionAddr
    );
    await txTreasureInitialize.wait();

    // Get ERC1155 to save artifact in front file
    const guardianStuffName = "GuardianStuff";
    const guardianStuffAddress = await treasureGuardian.guardianStuff();
    const guardianStuff = await ethers.getContractAt(
      guardianStuffName,
      guardianStuffAddress
    );

    // Deploy the Marketplace
    const auctionHouseName = "AuctionHouse";
    const auctionHouse = await this.deployContract(
      auctionHouseName,
      guardianStuffAddress
    );

    // Save the contract's artifacts and address in the FRONTEND directory
    await this.saveFrontendFiles(treasureGuardianName, treasureGuardian);
    await this.saveFrontendFiles(guardianStuffName, guardianStuff);
    await this.saveFrontendFiles(guardianTokenName, guardianToken);
    await this.saveFrontendFiles(auctionHouseName, auctionHouse);

    return {
      treasureGuardian,
      guardianStuff,
      guardianToken,
      auctionHouse,
    };
  },

  deployContract: async function (contractName, args) {
    console.log("Deploying contract:", contractName);

    const Contract = await ethers.getContractFactory(contractName);
    let contract;
    if (args) {
      contract = await Contract.deploy(args);
    } else {
      contract = await Contract.deploy();
    }

    await contract.deployed();

    console.log("Contract Deployed");
    console.log("Contract name:", contractName);
    console.log("Contract address:", contract.address);

    return contract;
  },

  saveFrontendFiles: async function (contractName, contract) {
    const fs = require("fs");
    const path = require("path");

    const contractsDir = path.join(__dirname, contractFrontFolder);

    console.log("Front end contract directory: " + contractsDir);
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir);
    }

    const contractFilePath = path.join(contractsDir, `${contractName}.json`);
    const artifact = artifacts.readArtifactSync(contractName);
    const chainId = network.config.chainId;
    let previousArtifact;

    try {
      // Read contract adresses file
      const jsonString = fs.readFileSync(contractFilePath, "utf8");
      previousArtifact = JSON.parse(jsonString);
    } catch (err) {
      console.error("No previous artifact");
      previousArtifact = { networks: {} };
    }

    // Write contract's artifact and address in a file
    console.log(`Write ${contractName} artifact and address in a file`);
    if (!previousArtifact.hasOwnProperty("networks")) {
      previousArtifact.networks = {};
    }

    if (!previousArtifact.networks.hasOwnProperty(chainId)) {
      previousArtifact.networks[chainId] = {};
    }

    previousArtifact.networks[chainId].address = contract.address;
    if (contract.deployTransaction) {
      previousArtifact.networks[chainId].transactionHash =
        contract.deployTransaction.hash;
      previousArtifact.networks[chainId].blockNumber =
        contract.deployTransaction.blockNumber;
    }

    artifact.networks = previousArtifact.networks;

    fs.writeFileSync(
      path.join(contractsDir, `${contractName}.json`),
      JSON.stringify(artifact, null, 2)
    );
  },
};
