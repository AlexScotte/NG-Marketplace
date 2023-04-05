import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";
import { ChainID } from "../../Utils/utils";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  let accounts;
  let currentAccount;
  let currentChainID;
  const initProvider = useCallback(
    async () => {

      const userConnected = currentAccount && currentAccount != "" && currentAccount != undefined
      if (userConnected) {

        // console.log("INIIIIIIT");
        // const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        // console.log(web3);
        // accounts = await web3.eth.requestAccounts();
        // console.log("Accounts:   " + accounts);
        // console.log(accounts);
        // const networkID = await web3.eth.net.getId();
        // console.log(networkID);
        // const deployTransaction = await web3.eth.getTransaction(artifact.networks[networkID].transactionHash);
        // const deployBlock = deployTransaction.blockNumber;
        // const currentBlock = await web3.eth.getBlockNumber();
        // const { ABI } = artifact;
        // let address, contract;

        const [
          loadingArtifactsOK,
          treasureGuardianArtifact,
          stuffArtifact,
          auctionHouseArtifact,
          web3] = await loadArtifact();

        let treasureGuardianContract;
        let stuffContract;
        let auctionHouseContract;

        if (loadingArtifactsOK) {

          const networkID = await web3.eth.net.getId();
          const deployTransaction = await web3.eth.getTransaction(treasureGuardianArtifact.networks[networkID].transactionHash);
          const deployBlock = deployTransaction.blockNumber;
          const currentBlock = await web3.eth.getBlockNumber();
          try {
            // Tresure guardian contract
            const treasureGuardianAddress = treasureGuardianArtifact.networks[networkID].address;
            treasureGuardianContract = new web3.eth.Contract(treasureGuardianArtifact.abi, treasureGuardianAddress);

            // Stuff contract
            const stuffAddress = await treasureGuardianContract.methods.stuff().call();
            // const stuffAdress = stuffArtifact.networks[networkID].address;
            stuffContract = new web3.eth.Contract(stuffArtifact.abi, stuffAddress);

            // Auction house contract
            const auctionHouseAddress = auctionHouseArtifact.networks[networkID].address;
            auctionHouseContract = new web3.eth.Contract(auctionHouseArtifact.abi, auctionHouseAddress);

            console.log("Successfully loaded contracts");
          } catch (err) {
            console.log("Error when loading contracts");
            console.error(err);
          }
        }

        dispatch({
          type: actions.init,
          // data: { artifact, web3, accounts, networkID, contract, deployBlock, currentBlock }
          data: {
            userConnected,
            currentChainID,
            currentAccount,
            loadingArtifactsOK,
            treasureGuardianContract,
            stuffContract,
            auctionHouseContract
          }
        });
      }
    }, []);

  const loadArtifact = async () => {

    console.log("Loading page");
    let loadingArtifactsOK = false;
    let treasureGuardianArtifact;
    let auctionHouseArtifact;
    let stuffArtifact;
    let web3;

    if (currentChainID == ChainID.Local) {

      try {

        treasureGuardianArtifact = require("../../contracts/TreasureGuardian.json");
        stuffArtifact = require("../../contracts/Stuff.json");
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
      stuffArtifact,
      auctionHouseArtifact,
      web3];
  }

  // useEffect(() => {
  //   const tryInit = async () => {
  //     try {
  //       const artifact = require("../../contracts/TreasureGuardian.json");
  //       init(artifact);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   tryInit();
  // }, [init]);

  useEffect(() => {

    console.log("Loading page");

    const getCurrentInfos = async () => {
      currentAccount = await window.ethereum.request({ method: 'eth_accounts' });
      console.log("Current account: " + currentAccount);

      currentChainID = await window.ethereum.request({ method: 'eth_chainId' });
      console.log("Current chain ID: " + currentChainID);

      if (currentAccount) {
        initProvider(state.artifact);
      }
    }

    getCurrentInfos();
    // console.log("ETH:  " + window.ethereum);
    // console.log("IS CONNECTED:  " + window.ethereum.isConnected());

    window.ethereum.on('accountsChanged', onAccountChanged);
    window.ethereum.on('chainChanged', onChainIDChanged);

    return () => {

      console.log("Remove listener");
      window.ethereum.removeListener('accountsChanged', onAccountChanged);
      window.ethereum.removeListener('chainChanged', onChainIDChanged);
    };
  }, [initProvider, state.artifact]);

  const connectWallet = async () => {
    try {
      console.log("Try to connect wallet");
      console.log("Current account connected: " + currentAccount);
      console.log("Current chain ID: " + currentChainID);






      let artifact;

      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      initProvider(artifact);
    } catch (err) {

      console.log("Errrrrr");
      console.error(err.message);
      // console.error(err);
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
