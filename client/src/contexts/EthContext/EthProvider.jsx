import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  let accounts;
  let currentAccount;
  let currentChainID;
  const init = useCallback(
    async artifact => {
      // if (artifact) {


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
      // const { abi } = artifact;
      // let address, contract;
      try {
        // address = artifact.networks[networkID].address;
        // console.log(address);
        // contract = new web3.eth.Contract(abi, address);
      } catch (err) {
        console.error(err);
      }
      dispatch({
        type: actions.init,
        // data: { artifact, web3, accounts, networkID, contract, deployBlock, currentBlock }
        data: { currentChainID, currentAccount }
      });
      // }
    }, []);

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

      // Check current account and chain id and initialize in function of values

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
  }, [init, state.artifact]);

  const connectWallet = async () => {
    try {
      console.log("Try to connect wallet");
      // const artifact = require("../../contracts/TreasureGuardian.json");
      let artifact;
      // await window.ethereum.request({ method: 'eth_requestAccounts' });

      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      init(artifact);
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

    init(state.artifact);

  };

  const onAccountChanged = (newAccounts) => {

    console.log("Accounts changed");
    currentAccount = newAccounts[0];
    console.log("New current account: " + currentAccount);

    init(state.artifact);
  };


  return (
    <EthContext.Provider value={{
      state,
      connectWallet,
      dispatch
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
