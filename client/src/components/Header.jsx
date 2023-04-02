import { useState, useEffect } from 'react';
import { AppBar, Box, Button, Toolbar, Typography, Tabs, Tab, TabPanel } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import useEth from '../contexts/EthContext/useEth';
import { useNavigate } from "react-router-dom";

export default function Header({ currentTab }) {
    const [tab, setTab] = useState(0);
    const navigate = useNavigate();

    function handleClick() {
        navigate("/quest");
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

    const handleChange = (() => {

    });

    return (
        <Box sx={{ flexGrow: 1 }} height="100">
            <AppBar position="static" sx={{ bgcolor: "black" }} height="500">
                <Toolbar>
                    <Box component="div" >
                        {<img src="https://nodeguardians.io/assets/logo-white.svg" alt="logo" width="400" color='black' />}
                    </Box>
                    <p fontWeight="400" fontFamily="Lato" fontStyle="normal" className="sc-b6e59fd5-0 fBKgLm sc-4bd5e3e4-1 ioWyuq">Beta</p>

                    <Button onClick={handleClick}>
                        <p className="textStyle">Quests</p>
                    </Button>

                    <Button onClick={() => setTab(2)}>
                        <p className="textStyle">Inventory</p>
                    </Button>

                    <Button onClick={() => setTab(3)}>
                        <p className="textStyle">Marketplace</p>
                    </Button>

                    <AccountBalanceWallet color="#b8a27b" sx={{ color: "#b8a27b" }} />
                </Toolbar>
            </AppBar>
        </Box>
    );
}