const { network } = require("hardhat");
const contractFrontFolder = "../../frontend2/src/contracts";

async function main() {
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

  const treasureGuardianName = "TreasureGuardian";
  const TreasureGuardian = await ethers.getContractFactory(
    treasureGuardianName
  );
  const treasureGuardian = await TreasureGuardian.deploy();
  await treasureGuardian.deployed();

  console.log("Contract Deployed");
  console.log("Contract name:", treasureGuardianName);
  console.log("Contract address:", treasureGuardian.address);

  console.log("Create collection...");
  // Create ERC1155 collection
  await treasureGuardian.createCollection();
  console.log("Collection created !");

  // Deploy the Marketplace
  const auctionHouseName = "AuctionHouse";
  const AuctionHouse = await ethers.getContractFactory(auctionHouseName);
  const auctionHouse = await AuctionHouse.deploy(
    await treasureGuardian.guardianStuff()
  );
  await auctionHouse.deployed();

  console.log("Contract Deployed");
  console.log("Contract name:", auctionHouseName);
  console.log("Contract address:", auctionHouse.address);

  // Save the contract's artifacts and address in the FRONTEND directory
  await saveFrontendFiles(treasureGuardianName, treasureGuardian);
  await saveFrontendFiles(auctionHouseName, auctionHouse);
}

async function saveFrontendFiles(contractName, contract) {
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
  previousArtifact.networks[chainId].transactionHash =
    contract.deployTransaction.hash;
  previousArtifact.networks[chainId].blockNumber =
    contract.deployTransaction.blockNumber;

  artifact.networks = previousArtifact.networks;

  fs.writeFileSync(
    path.join(contractsDir, `${contractName}.json`),
    JSON.stringify(artifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
