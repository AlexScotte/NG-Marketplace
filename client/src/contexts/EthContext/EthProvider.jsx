import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";
import { ChainID } from "../../Utils/utils";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  let currentAccount;
  let currentChainID;
  const initProvider = useCallback(
    async () => {

      const userConnected = currentAccount && currentAccount != "" && currentAccount != undefined
      if (userConnected) {

        const [
          loadingArtifactsOK,
          treasureGuardianArtifact,
          guardianStuffArtifact,
          guardianTokenArtifact,
          auctionHouseArtifact,
          web3] = await loadArtifact();

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

          const networkID = await web3.eth.net.getId();
          const deployTransaction = await web3.eth.getTransaction(treasureGuardianArtifact.networks[networkID].transactionHash);
          deployBlock = deployTransaction.blockNumber;
          currentBlock = await web3.eth.getBlockNumber();
          try {
            // Tresure guardian contract
            treasureGuardianAddress = treasureGuardianArtifact.networks[networkID].address;
            console.log("Treasure guardian address: " + treasureGuardianAddress);
            treasureGuardianContract = new web3.eth.Contract(treasureGuardianArtifact.abi, treasureGuardianAddress);

            // Guardian Stuff contract
            const guardianStuffAddress = await treasureGuardianContract.methods.guardianStuff().call();
            guardianStuffContract = new web3.eth.Contract(guardianStuffArtifact.abi, guardianStuffAddress);
            console.log("Guardian stuff address: " + guardianStuffAddress);

            // Guardian Token contract
            const guardianTokenAddress = await treasureGuardianContract.methods.guardianToken().call();
            guardianTokenContract = new web3.eth.Contract(guardianTokenArtifact.abi, guardianTokenAddress);
            guardianTokenDecimals = await guardianTokenContract.methods.decimals().call();
            console.log("Guardian token address: " + guardianTokenAddress);

            // Auction house contract
            auctionHouseAddress = auctionHouseArtifact.networks[networkID].address;
            auctionHouseContract = new web3.eth.Contract(auctionHouseArtifact.abi, auctionHouseAddress);
            console.log("Successfully loaded contracts");
          } catch (err) {
            console.log("Error when loading contracts");
            console.error(err.message);
          }
        }

        dispatch({
          type: actions.init,
          data: {
            userConnected,
            currentChainID,
            currentAccount,
            deployBlock,
            currentBlock,
            loadingArtifactsOK,
            treasureGuardianAddress,
            treasureGuardianContract,
            guardianStuffContract,
            guardianTokenContract,
            guardianTokenDecimals,
            auctionHouseContract,
            auctionHouseAddress
          }
        });
      }
      else {
        dispatch({
          type: actions.init,
          data: {
            userConnected,
            currentChainID,
            currentAccount
          }
        });
      }
    }, []);

  const loadArtifact = async () => {

    console.log("Loading page");
    let loadingArtifactsOK = false;
    let treasureGuardianArtifact;
    let auctionHouseArtifact;
    let guardianStuffArtifact;
    let guardianTokenArtifact;
    let web3;

    if (currentChainID == ChainID.Mumbai) {

      try {

        treasureGuardianArtifact = require("../../contracts/TreasureGuardian.json");
        guardianStuffArtifact = require("../../contracts/GuardianStuff.json");
        guardianTokenArtifact = require("../../contracts/GuardianToken.json");
        auctionHouseArtifact = require("../../contracts/AuctionHouse.json");
        web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        loadingArtifactsOK = true;
        console.log("Successfully loaded artifacts");
      }
      catch (error) {

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
      web3];
  }

  useEffect(() => {

    console.log("Loading page");

    const getCurrentInfos = async () => {
      var accounts = await window.ethereum.request({ method: 'eth_accounts' });
      currentAccount = accounts[0];
      console.log("Current account: " + currentAccount);

      currentChainID = await window.ethereum.request({ method: 'eth_chainId' });
      console.log("Current chain ID: " + currentChainID);

      if (currentAccount) {
        initProvider();
      }
    }

    getCurrentInfos();

    window.ethereum.on('accountsChanged', onAccountChanged);
    window.ethereum.on('chainChanged', onChainIDChanged);

    return () => {

      console.log("Remove listener");
      window.ethereum.removeListener('accountsChanged', onAccountChanged);
      window.ethereum.removeListener('chainChanged', onChainIDChanged);
    };
  }, [initProvider]);

  const connectWallet = async () => {
    try {
      console.log("Try to connect wallet");
      console.log("Current account connected: " + currentAccount);
      console.log("Current chain ID: " + currentChainID);

      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      initProvider();
    } catch (error) {

      console.error(error.message);
    }
  };

  const onChainIDChanged = (newChainID) => {

    console.log("Chain changed");
    currentChainID = newChainID;
    console.log("New chain ID:" + currentChainID);

    initProvider();

  };

  const onAccountChanged = (newAccounts) => {

    console.log("Accounts changed");
    currentAccount = newAccounts[0];
    console.log("New current account: " + currentAccount);

    initProvider();
  };


  return (
    <EthContext.Provider value={{
      state,
      connectWallet,
      initProvider,
      dispatch
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
