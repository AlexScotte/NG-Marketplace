// import EthProvider from "@/contexts/EthContext/EthProvider";
import "@/styles/globals.css";

import { WagmiConfig, createClient, configureChains } from "wagmi";
import { hardhat } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { EthProvider } from "../contexts/EthContext";
import Header from "@/components/Header";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";

const { chains, provider } = configureChains([hardhat], [publicProvider()]);

const client = createClient({
  autoConnect: false,
  connectors: [new MetaMaskConnector({ chains })],
  provider,
});

export default function App({ Component, pageProps }) {
  let theme = createTheme({
    typography: {
      h6: {
        fontFamily: "Lato",
        textTransform: "uppercase !important",
        color: "rgb(159, 140, 108)",
      },
      subtitle1: {
        fontFamily: "Cinzel",
        color: "rgb(142, 142, 142)",
      },
      body1: {
        fontWeight: 500,
      },
      button: {
        fontStyle: "italic",
      },
    },
  });
  theme = responsiveFontSizes(theme);

  return (
    <WagmiConfig client={client}>
      <EthProvider>
        <ThemeProvider theme={theme}>
          <Header />
          <Component {...pageProps} />
        </ThemeProvider>
      </EthProvider>
    </WagmiConfig>
  );
}
