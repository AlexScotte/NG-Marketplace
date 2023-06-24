import "@/styles/globals.css";

import { WagmiConfig, createClient, configureChains } from "wagmi";
import { hardhat, goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { EthProvider } from "../contexts/EthContext";
import Header from "@/components/Header";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";

const { chains, provider } = configureChains(
  [hardhat, goerli],
  [publicProvider()]
);

const client = createClient({
  autoConnect: false,
  connectors: [new MetaMaskConnector({ chains })],
  provider,
});

export default function App({ Component, pageProps }) {
  let theme = createTheme({
    button: {
      border: "1px solid rgb(109, 98, 76)",
      color: "rgb(241, 242, 242)",
      backgroundColor: "rgb(29, 28, 26)",
      cursor: "pointer",
      borderRadius: "5px",
      fontFamily: "Cinzel",
      fontWeight: "900",
    },
    typography: {
      h5: {
        fontFamily: "Cinzel",
        textTransform: "uppercase !important",
        color: "rgb(142, 142, 142)",
        textAlign: "center",
      },
      h6: {
        fontFamily: "Cinzel",
        textTransform: "uppercase !important",
        color: "rgb(159, 140, 108)",
        textAlign: "center",
      },
      subtitle1: {
        fontFamily: "Cinzel",
        color: "rgb(142, 142, 142)",
        textAlign: "center",
      },
      subtitle3: {
        fontFamily: "Cinzel",
        color: "rgb(142, 142, 142)",
      },
      subtitle4: {
        fontFamily: "Cinzel",
        color: "rgb(159, 140, 108)",
      },
      body1: {
        fontWeight: 500,
      },
    },
    "@global": {
      "*::-webkit-scrollbar": {
        width: "0.4em",
      },
      "*::-webkit-scrollbar-track": {
        "-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,0.00)",
      },
      "*::-webkit-scrollbar-thumb": {
        backgroundColor: "rgba(0,0,0,.1)",
        outline: "1px solid slategrey",
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
