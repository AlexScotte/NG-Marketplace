require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const INFURA_ID = process.env.INFURA_ID || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // paths: {
  //   artifacts: "../frontend/src/contracts",
  // },

  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: `${ETHERSCAN_API_KEY}`,
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_ID}`,
      // accounts: [`0x${PRIVATE_KEY}`],
      accounts: {
        mnemonic: `${process.env.MNEMONIC}`,
      },
      chainId: 5,
    },
    mumbai: {
      network_id: 80001,
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_ID}`,
      accounts: {
        mnemonic: `${process.env.MNEMONIC}`,
      },
      chainId: 80001,
      gasPrice: 80000000000,
    },

    // TRUFFLE
    // goerli: {
    //   provider: function () {
    //     return new HDWalletProvider(
    //       {
    //         mnemonic: { phrase: `${process.env.MNEMONIC}` },
    //         providerOrUrl: `https://goerli.infura.io/v3/${process.env.INFURA_ID}`
    //       },
    //     )
    //   },
    //   network_id: 5,
    // },
    // mumbai: {
    //   provider: function () {
    //     return new HDWalletProvider(
    //       {
    //         mnemonic: { phrase: `${process.env.MNEMONIC}` },
    //         providerOrUrl: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_ID}`
    //       },
    //     )
    //   },
    //   network_id: 80001,
    // },
  },

  solidity: "0.8.18",
};
