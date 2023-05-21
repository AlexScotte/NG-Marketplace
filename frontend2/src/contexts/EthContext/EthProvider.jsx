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
import { ChainID } from "../../Utils/utils";
import { ethers } from "ethers";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { connect, connectors } = useConnect();
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const provider = useProvider();
  const { data: signer } = useSigner();

  const initContract = useCallback(async () => {
    if (isConnected && chain) {
      const [
        loadingArtifactsOK,
        simpleStorageArtifact,
        simpleStorage2Artifact,
        treasureGuardianArtifact,
        guardianStuffArtifact,
        guardianTokenArtifact,
        auctionHouseArtifact,
      ] = await loadArtifact();

      let treasureGuardianContract;
      let treasureGuardianAddress;
      let guardianStuffContract;
      let guardianTokenContract;
      let guardianTokenDecimals;
      let auctionHouseContract;
      let auctionHouseAddress;
      let deployBlock;
      let currentBlock;

      if (loadingArtifactsOK) {
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
        } catch (err) {}
      }
    }
  }, [isConnected, address, chain]);

  const loadArtifact = async () => {
    console.log("Loading page");
    let loadingArtifactsOK = false;
    let treasureGuardianArtifact;
    let auctionHouseArtifact;
    let guardianStuffArtifact;
    let guardianTokenArtifact;

    if (chain?.id == ChainID.HardhatLocal) {
      try {
        // // Check if the contract is deployed on the current chain
        // // exception if not
        // simpleStorageArtifact.networks[chain?.id].address;
        // simpleStorage2Artifact.networks[chain?.id].address;

        treasureGuardianArtifact = require("../../contracts/TreasureGuardian.json");
        // guardianStuffArtifact = require("../../contracts/GuardianStuff.json");
        // guardianTokenArtifact = require("../../contracts/GuardianToken.json");
        auctionHouseArtifact = require("../../contracts/AuctionHouse.json");
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
