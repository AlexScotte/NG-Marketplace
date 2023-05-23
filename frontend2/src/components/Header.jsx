import { useState, useEffect } from "react";
import { AppBar, Box, Toolbar, Stack, Typography } from "@mui/material";
import { AccountBalanceWallet } from "@mui/icons-material";
import useEth from "../contexts/EthContext/useEth";
import { Pages, ToShortAddress } from "../Utils/utils";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function Header({}) {
  const { isConnected, address } = useAccount();

  const { connectWallet } = useEth();

  const [connectedWallet, setConnectedWallet] = useState("");

  useEffect(() => {
    if (isConnected) {
      setConnectedWallet(ToShortAddress(address));
    } else {
      setConnectedWallet("Connect wallet");
    }
  }, [isConnected, address]);

  const handleWalletClick = async () => {
    await connectWallet();
  };

  return (
    <Box sx={{ flexGrow: 1 }} height="100">
      <AppBar position="static" sx={{ bgcolor: "black" }} height="500">
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-start"
            >
              <Box component="div" sx={{ width: "200px" }}>
                <img
                  src="https://nodeguardians.io/assets/logo-white.svg"
                  sx={{ maxWidth: "100%" }}
                  alt="logo"
                  color="black"
                />
              </Box>
              <label className="item-menu-beta">Beta</label>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-start"
              spacing={4}
              width="100%"
              marginLeft="100px"
            >
              <Link className="item-menu" href="/Quests">
                Quests
              </Link>
              <Link className="item-menu" href="/Inventory">
                Inventory
              </Link>
              <Link className="item-menu" href="/AuctionHouse">
                Auction House
              </Link>
            </Stack>

            <Stack
              alignItems="center"
              justifyContent="flex-end"
              onClick={handleWalletClick}
              sx={{ cursor: "pointer" }}
            >
              <Typography className="header-text-wallet">
                {connectedWallet}
              </Typography>

              <div
                className="decoration-circle"
                style={{ height: "40px", width: "40px" }}
              >
                <div className="decoration-circle">
                  <AccountBalanceWallet className="icon" />
                </div>
              </div>
              <span className="decoration" />
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
