import React, { useReducer, useCallback, useEffect } from "react";
import { reducer, actions, initialState } from "./state";
import EthContext from "./EthContext";
import {
  useAccount,
  useConnect,
  useNetwork,
  useSigner,
  useProvider,
} from "wagmi";
import { ChainID, GetExpectedChainIdWithEnv } from "../../Utils/utils";
import { ethers } from "ethers";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { connect, connectors } = useConnect();
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const provider = useProvider();
  const { data: signer } = useSigner();

  const initContract = useCallback(async () => {
    let loadingContractOK = false;
    let treasureGuardianContractProvider = "";
    let treasureGuardianContractSigner = "";
    let treasureGuardianAddress = "";

    let guardianStuffContractProvider = "";
    let guardianStuffContractSigner = "";

    let guardianTokenContractProvider = "";
    let guardianTokenContractSigner = "";
    let guardianTokenDecimals = "";

    let auctionHouseContractProvider = "";
    let auctionHouseContractSigner = "";
    let auctionHouseAddress = "";

    if (isConnected && chain) {
      // Load artifacts
      const [
        loadingArtifactsOK,
        // simpleStorageArtifact,
        // simpleStorage2Artifact,
        treasureGuardianArtifact,
        guardianStuffArtifact,
        guardianTokenArtifact,
        auctionHouseArtifact,
      ] = await loadArtifact();

      let deployBlock;
      let currentBlock;

      // Tresure guardian contract
      // simpleStorageAddress =
      //   simpleStorageArtifact.networks[chain?.id].address;
      // deployBlock = simpleStorageArtifact.networks[chain?.id].blockNumber;
      // currentBlock = await provider.getBlockNumber();

      // console.log("Treasure guardian address: " + simpleStorageAddress);

      // simpleStorageContract = new ethers.Contract(
      //   simpleStorageAddress,
      //   simpleStorageArtifact.abi,
      //   provider
      // );

      // let smartContractValue = await simpleStorageContract.retrieve();
      // console.log("value:" + smartContractValue);

      // const ctract = new ethers.Contract(
      //   simpleStorageAddress,
      //   simpleStorageArtifact.abi,
      //   signer
      // );

      // console.log("signer:" + signer);

      // let transaction = await ctract.store(6);
      // await transaction.wait();

      // let smartContractValue2 = await simpleStorageContract.retrieve();
      // console.log("value:" + smartContractValue2);

      try {
        if (loadingArtifactsOK) {
          // deployBlock = treasureGuardianArtifact.networks[chain?.id].blockNumber;
          // currentBlock = await provider.getBlockNumber();

          // Treasure guardian contracts
          // Provider
          treasureGuardianContractProvider = new ethers.Contract(
            treasureGuardianArtifact.networks[chain?.id].address,
            treasureGuardianArtifact.abi,
            provider
          );

          // Signer
          treasureGuardianContractSigner = new ethers.Contract(
            treasureGuardianArtifact.networks[chain?.id].address,
            treasureGuardianArtifact.abi,
            signer
          );

          // Guardian stuff contracts
          // Provider
          guardianStuffContractProvider = new ethers.Contract(
            guardianStuffArtifact.networks[chain?.id].address,
            guardianStuffArtifact.abi,
            provider
          );

          // Signer
          guardianStuffContractSigner = new ethers.Contract(
            guardianStuffArtifact.networks[chain?.id].address,
            guardianStuffArtifact.abi,
            signer
          );

          // Guardian token contracts
          // Provider
          guardianTokenContractProvider = new ethers.Contract(
            guardianTokenArtifact.networks[chain?.id].address,
            guardianTokenArtifact.abi,
            provider
          );

          // Signer
          guardianTokenContractSigner = new ethers.Contract(
            guardianTokenArtifact.networks[chain?.id].address,
            guardianTokenArtifact.abi,
            signer
          );

          // Auction house contracts
          // Provider
          auctionHouseContractProvider = new ethers.Contract(
            auctionHouseArtifact.networks[chain?.id].address,
            auctionHouseArtifact.abi,
            provider
          );

          // Signer
          auctionHouseContractSigner = new ethers.Contract(
            auctionHouseArtifact.networks[chain?.id].address,
            auctionHouseArtifact.abi,
            signer
          );

          loadingContractOK = true;
          console.log("Successfully loaded contracts");
        }
      } catch (error) {
        console.log("Error when loading contracts");
        console.log(error.message);
      }
    }

    dispatch({
      type: actions.init,
      data: {
        // deployBlock,
        // currentBlock,
        loadingContractOK,
        treasureGuardianContractProvider,
        treasureGuardianContractSigner,
        guardianStuffContractProvider,
        guardianStuffContractSigner,
        guardianTokenContractProvider,
        guardianTokenContractSigner,
        auctionHouseContractProvider,
        auctionHouseContractSigner,
      },
    });
  }, [isConnected, address, chain, provider, signer]);

  const loadArtifact = async () => {
    console.log("Loading artifacts");
    let loadingArtifactsOK = false;
    let treasureGuardianArtifact;
    let auctionHouseArtifact;
    let guardianStuffArtifact;
    let guardianTokenArtifact;

    if (chain?.id == GetExpectedChainIdWithEnv()) {
      try {
        // Treasure guardian artifacts
        treasureGuardianArtifact = require("../../contracts/TreasureGuardian.json");
        if (!treasureGuardianArtifact.networks[chain?.id]) {
          throw new Error(
            `Treasure guardian contract not deployed on ${chain?.id}`
          );
        }

        // Guardian stuff artifacts
        guardianStuffArtifact = require("../../contracts/GuardianStuff.json");
        if (!guardianStuffArtifact.networks[chain?.id])
          throw new Error(
            `Guardian stuff contract not deployed on ${chain?.id}`
          );

        // Guardian token artifacts
        guardianTokenArtifact = require("../../contracts/GuardianToken.json");
        if (!guardianTokenArtifact.networks[chain?.id])
          throw new Error(
            `Guardian token contract not deployed on ${chain?.id}`
          );

        // Auction house artifacts
        auctionHouseArtifact = require("../../contracts/AuctionHouse.json");
        if (!auctionHouseArtifact.networks[chain?.id])
          throw new Error(
            `Auction house contract not deployed on ${chain?.id}`
          );

        loadingArtifactsOK = true;
        console.log("Successfully loaded artifacts");
      } catch (error) {
        console.log("Error when loading artifacts");
        console.log(error.message);
      }
    }

    return [
      loadingArtifactsOK,
      treasureGuardianArtifact,
      guardianStuffArtifact,
      guardianTokenArtifact,
      auctionHouseArtifact,
    ];
  };

  useEffect(() => {
    console.log("Loading provider");
    console.log("User connected: " + isConnected);

    if (isConnected) {
      console.log("Current user address: " + address);
      console.log("Current chain ID: " + chain?.id);
      initContract();
    }
  }, [initContract]);

  const connectWallet = async () => {
    console.log("Try to connect wallet");
    console.log("Current account connected: " + address);

    // TODO: manage other connectors
    await connect({ connector: connectors[0] });
    initContract();
  };

  return (
    <EthContext.Provider
      value={{
        state,
        connectWallet,
      }}
    >
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
