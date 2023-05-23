// import EthProvider from "@/contexts/EthContext/EthProvider";
import "@/styles/globals.css";

import { WagmiConfig, createClient, configureChains } from "wagmi";
import { hardhat } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { EthProvider } from "../contexts/EthContext";
import Header from "@/components/Header";

const { chains, provider } = configureChains([hardhat], [publicProvider()]);

const client = createClient({
  autoConnect: false,
  connectors: [new MetaMaskConnector({ chains })],
  provider,
});

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig client={client}>
      <EthProvider>
        <Header />
        <Component {...pageProps} />
      </EthProvider>
    </WagmiConfig>
  );
}
