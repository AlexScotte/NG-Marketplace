import { useState, useEffect } from 'react';
import { AppBar, Box, Button, Toolbar, Typography, Tabs, Tab, TabPanel } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import useEth from '../contexts/EthContext/useEth';
import { useNavigate } from "react-router-dom";
import { Pages, ToShortAddress } from "../Utils/utils";

export default function Header({ }) {
    const navigate = useNavigate();
    const [connectedWallet, setConnectedWallet] = useState("");

    const {
        state: { userConnected, currentAccount },
        connectWallet
    } = useEth();

    useEffect(() => {

        if (userConnected) {
            setConnectedWallet(ToShortAddress(currentAccount));
        }
        else {
            setConnectedWallet("Connect wallet");
        }

    }, [userConnected, currentAccount]);



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
                        <label className='generic-text-font2-uppercase generic-text-color-yellow item-menu-beta' >Beta</label>
                    </div>

                    <div style={{ translate: '-25%' }}>
                        <button className='item-menu generic-text-color' onClick={() => handleNavigation(Pages.Quests)}>
                            Quests
                        </button>

                        <button className='item-menu generic-text-color' onClick={() => handleNavigation(Pages.Inventory)}>
                            Inventory
                        </button>

                        <button className='item-menu generic-text-color' onClick={() => handleNavigation(Pages.Marketplace)}>
                            Auction House
                        </button>
                    </div>

                    <div>

                        <div style={{ cursor: "pointer" }} onClick={handleWalletClick}>
                            <label className='header-text-wallet generic-text-font2-uppercase generic-text-color-white' style={{ cursor: "pointer" }}>
                                {connectedWallet}
                            </label>

                            <span className='decoration' />

                            <div className='decoration-circle' style={{ height: "40px", width: "40px" }}>
                                <div className='decoration-circle'>

                                    <AccountBalanceWallet className='icon' sx={{ fontSize: "20px" }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Toolbar>
            </AppBar>
        </Box>
    );
}