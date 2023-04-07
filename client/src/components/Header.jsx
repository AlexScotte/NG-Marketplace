import { useState, useEffect } from 'react';
import { AppBar, Box, Button, Toolbar, Typography, Tabs, Tab, TabPanel } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import useEth from '../contexts/EthContext/useEth';
import { useNavigate } from "react-router-dom";
import { Pages } from "../Utils/utils";

export default function Header({ }) {
    const navigate = useNavigate();

    const {
        state: { accounts },
        connectWallet
    } = useEth();

    function handleNavigation(page) {

        console.log(page);
        switch (page) {
            case Pages.Quests:
                navigate("/quests");
                break;
            case Pages.Inventory:
                navigate("/inventory");
                break;
            case Pages.Marketplace:
                navigate("/auction-house");
                break;
        }
    }
    // const {
    //   state: { accounts },
    //   tryInit
    // } = useEth();
    // const [address, setAddress] = useState('');

    // useEffect(() => {
    //   if (accounts) {
    //     let _address = accounts[0];

    //     setAddress(_address.substring(0, 5) + '...' + _address.substring(_address.length - 4));
    //   }
    // }, [accounts]);

    // useEffect(() => {
    //   if (window.ethereum && window.ethereum.isConnected()) {
    //     tryInit();
    //   }
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    // useEffect(() => {
    //     if (window.ethereum && window.ethereum.isConnected()) {
    //         tryInit();
    //     }
    // }, []);

    const handleWalletClick = (() => {

        connectWallet();
    });

    return (
        <Box sx={{ flexGrow: 1 }} height="100">
            <AppBar position="static" sx={{ bgcolor: "black" }} height="500">
                <Toolbar sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>

                        <Box component="div" sx={{ width: "200px" }}>
                            <img src="https://nodeguardians.io/assets/logo-white.svg" sx={{ maxWidth: "100%" }} alt="logo" color='black' />
                        </Box>
                        <label fontWeight="400" fontFamily="Lato" fontStyle="normal" color="#b8a27b">Beta</label>
                    </div>

                    <div>
                        <button className='item-menu' onClick={() => handleNavigation(Pages.Quests)}>
                            <label  >Quests</label>
                        </button>

                        <button className='item-menu' onClick={() => handleNavigation(Pages.Inventory)}>
                            <label>Inventory</label>
                        </button>

                        <button className='item-menu' onClick={() => handleNavigation(Pages.Marketplace)}>
                            <label>Marketplace</label>
                        </button>
                    </div>

                    <div>
                        <AccountBalanceWallet color="#b8a27b" sx={{ color: "#b8a27b", cursor: "pointer" }} onClick={handleWalletClick} />
                    </div>
                </Toolbar>
            </AppBar>
        </Box>
    );
}