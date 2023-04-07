import React, { useEffect, useState } from "react";
import web3 from "web3";
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import axios from 'axios';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'rgb(29, 28, 26)',
    border: '1px solid rgba(190, 167, 126, 0.314)',
    boxShadow: 24,
    borderRadius: '2px',
    p: 2,
}



export default function DetailsItems({ auctionHouseContract, currentAccount, selectedItem, }) {

    const handleBuyItem = async () => {

        try {

            const price = selectedItem.price.toString();
            await auctionHouseContract.methods.executeSale(0).send({ from: currentAccount, value: web3.utils.toWei(price, 'ether') });
            console.log(price);
            console.log(auctionHouseContract.methods);
            console.log(currentAccount);
        }
        catch (error) {
            console.log(error);
        }
    };


    <Box sx={style}>

        <Stack direction="row" display="block" >
            <label >
                Object details
            </label>

            <button color="red" >
                text
            </button>
        </Stack>

        <div style={{ alignContent: "center" }}>

            <img src={selectedItem.image} height="50%" width="50%" />
        </div>

        <Stack direction="row">

            <img src="https://nodeguardians.io/assets/divers/title-decoration.svg" height="50%" width="50%" />

            <label>
                {selectedItem.name}
            </label>


            <img src="https://nodeguardians.io/assets/divers/title-decoration.svg"
                style={{ alignContent: "center", rotate: "180deg" }}
                height="50%"
                width="50%" />


        </Stack>

        <Stack alignContent="center" textAlign="center">
            <label>
                Legendary
            </label>
        </Stack>

        <Stack direction="row">


            <label>
                {selectedItem.owner}
            </label>
        </Stack>

        <Stack direction="column">

            <label>
                Description:
            </label>
            <label>
                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
            </label>
        </Stack>


        <Stack direction="row" textAlign="center">
            <label>
                {selectedItem.price}
            </label>
        </Stack>

        <Button onClick={handleBuyItem} variant="outlined" style={{ border: '1px solid rgba(190, 167, 126, 0.5)', backgroundColor: 'rgb(29, 28, 26)', cursor: 'pointer', borderRadius: '5px', fontFamily: 'Cinzel, serif', fontWeight: '900' }}>Buy</Button>


    </Box>
}