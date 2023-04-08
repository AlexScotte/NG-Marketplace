import React, { useEffect, useState } from "react";
import useEth from '../../contexts/EthContext/useEth';
import web3 from "web3";
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import axios from 'axios';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ChainID } from "../../Utils/utils";
import ChangeChain from "../../components/ChangeChain";
import NotConnected from "../../components/NotConnected";
import logoWhite from "../../assets/ng-logo-white.png";

const Inventory = () => {
    const array = [8, 4, 5, 6, 2, 4, 5, 6, 2, 4, 5, 6, 2, 4, 5, 6, 2, 4, 5, 6, 2, 4, 5, 6, 2, 4, 5, 6, 2];
    const {
        state: { userConnected, currentChainID, currentAccount, auctionHouseContract, guardianStuffContract },
    } = useEth();

    const [wrongChain, setWrongChain] = useState(true);
    const [ownedItems, setOwnedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState("");

    const [ipfsUrl, setIpfsUrl] = useState("");

    const item = {
        id: 0,
        image: "",
        name: "",
        itemID: "",
        rarity: "",
        set: "",
        class: "",
        description: "",
        owner: "",
        seller: "",
        buyer: "",
        price: "",
        deadline: "",
        currentlyListed: "",
        isSold: "",
    };


    useEffect(() => {

        console.log("Loading page inventory");

        if (userConnected) {

            setWrongChain(currentChainID != ChainID.Mumbai);
            if (!wrongChain) {

                if (auctionHouseContract && guardianStuffContract) {

                    getOwnedItems();
                }
            }
        }


    }, [currentAccount, currentChainID, auctionHouseContract, guardianStuffContract]);

    const getOwnedItems = async () => {

        // let transferEvents = await guardianStuffContract.getPastEvents('TransferSingle', { fromBlock: 0, toBlock: 'latest' });
        // console.log(transferEvents);

        const ids = await guardianStuffContract.methods.getTokenIDs().call();
        console.log(ids);

        const addresses = ids.map(i => currentAccount);
        const items = await guardianStuffContract.methods.balanceOfBatch(addresses, ids).call();
        console.log(items);
        console.log(ownedItems.length);
        setOwnedItems([]);
        console.log(ownedItems.length);
        ids.map(async (id, index) => {

            if (items[index] > 0) {

                const meta = await axios.get("https://ipfs.io/ipfs/QmZWjLS4zDjZ6C64ZeSKHktcd1jRuqnQPx2gj7AqjFSU2d/1100.json");
                let ownedItem =
                {
                    id: index,
                    image: "https://ipfs.io/ipfs/" + meta.data.image,
                    name: meta.data.name,
                    description: meta.data.description,
                    itemID: id,
                    // owner: storedListedItem.owner,
                    // seller: storedListedItem.seller,
                    // buyer: storedListedItem.buyer,
                    // price: storedListedItem.price,
                    // deadline: storedListedItem.deadline,
                    // currentlyListed: storedListedItem.currentlyListed,
                    // isSold: storedListedItem.isSold,
                };

                setOwnedItems(listedItems => [...listedItems, ownedItem]);
            }
        });

        // transferEvents.map(async (event) => {

        //     if (event.returnValues.to == "")
        //         console.log(transferEvents);

        // }

        // try {

        //     const uri = await guardianStuffContract.methods.uri(0).call();
        //     setIpfsUrl(uri);
        //     console.log(uri);
        //     setIpfsUrl(ipfsUrl);

        //     let storedListedItems = await auctionHouseContract.methods.getListedItems(false, true, false).call();
        //     setListedItems([]);
        //     let index = 0;
        //     storedListedItems.map(async (storedListedItem) => {

        //         const test = uri.replace("{id}", storedListedItem.itemId);
        //         const meta = await axios.get("https://ipfs.io/ipfs/QmWHoeyafsznQ6QKqWvUUZ4scivKh8j4y4PMryk2w8nN4r/10.json");

        //         let listedItem =
        //         {
        //             id: index,
        //             image: "https://ipfs.io/ipfs/" + meta.data.image,
        //             name: meta.data.name,
        //             description: meta.data.description,
        //             itemID: storedListedItem.itemId,
        //             owner: storedListedItem.owner,
        //             seller: storedListedItem.seller,
        //             buyer: storedListedItem.buyer,
        //             price: storedListedItem.price,
        //             deadline: storedListedItem.deadline,
        //             currentlyListed: storedListedItem.currentlyListed,
        //             isSold: storedListedItem.isSold,
        //         };

        //         setListedItems(listedItems => [...listedItems, listedItem]);
        //         index++;

        //     });
        // } catch (error) {
        //     console.log(error.message);
        // }
    }

    const handleOwnedItemClick = async (param, event) => {

        setSelectedItem(ownedItems[param.id]);
        console.log(param);
        // handleOpen();
    };


    const handleBuyChestClick = async (param, event) => {

    };

    const handleOpenChestClick = async (param, event) => {

    };

    const buttonStyle = {
        border: '1px solid rgb(109, 98, 76)',
        color: 'rgb(241, 242, 242)',
        backgroundColor: 'rgb(29, 28, 26)',
        cursor: 'pointer',
        borderRadius: '5px',
        fontFamily: 'Cinzel, serif',
        fontWeight: '900',
        width: "120px",
        '&:hover': {
            backgroundColor: 'rgb(39, 36, 32)',
            color: 'rgb(190, 167, 125)',
            borderColor: 'rgb(190, 167, 125)'
        }
    }

    return (

        <div>

            {
                userConnected ? (
                    <>
                        {
                            wrongChain ?
                                (
                                    <>
                                        <ChangeChain chain="Mumbai" />
                                    </>
                                ) : (
                                    <>

                                        <div style={{
                                            height: 'calc(100vh - 64px)', display: "grid",
                                            // gridTemplateColumns: "repeat(3, 70% 30%)",
                                            gridGap: "15px",
                                            padding: "20px 40px",
                                            position: "relative",
                                            boxSizing: "border-box",
                                            width: "100%",
                                        }}>

                                            <Stack direction="row" height="100%" width="100%" border="1px solid red">
                                                <Stack direction="row" height="100%" width="50%" border="1px solid red">

                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            // p: 1,
                                                            // m: 1,
                                                            bgcolor: 'blue',
                                                            maxWidth: 60,
                                                            alignContent: 'flex-start',
                                                            borderRadius: 1,
                                                        }}
                                                    >
                                                        <img style={{}} src="https://ipfs.io/ipfs/QmWKAJ8EZEjNp6DShjiFh4sY7Eo8mcMqKaGHKr9cUMfuYK/Axes/2.png" width='60px' height='60px' />
                                                        <img style={{}} src="https://ipfs.io/ipfs/QmWKAJ8EZEjNp6DShjiFh4sY7Eo8mcMqKaGHKr9cUMfuYK/Axes/2.png" width='60px' height='60px' />
                                                        <img style={{}} src="https://ipfs.io/ipfs/QmWKAJ8EZEjNp6DShjiFh4sY7Eo8mcMqKaGHKr9cUMfuYK/Axes/2.png" width='60px' height='60px' />
                                                        <img style={{}} src="https://ipfs.io/ipfs/QmWKAJ8EZEjNp6DShjiFh4sY7Eo8mcMqKaGHKr9cUMfuYK/Axes/2.png" width='60px' height='60px' />


                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            // p: 1,
                                                            // m: 1,
                                                            bgcolor: 'red',
                                                            // maxWidth: 300,
                                                            height: '70vh',
                                                            overflow: 'scroll',
                                                            alignContent: 'flex-start',
                                                            borderRadius: 1,
                                                        }}
                                                    >

                                                        {
                                                            // ownedItems.map((item) => {
                                                            //     return (
                                                            //         <img onClick={() => handleOwnedItemClick((item))} style={{}} src={item.image} width='60px' height='60px' />

                                                            //     );
                                                            // })

                                                            [1, 2, 3, 4, 5, 6, 7, 8].map((item) => {
                                                                return (
                                                                    <img onClick={() => handleOwnedItemClick((item))} style={{}} src={item.image} width='60px' height='60px' />

                                                                );
                                                            })
                                                        }
                                                    </Box>


                                                </Stack>

                                                <Stack direction="row" height="100%" width="90%" border="1px solid red" justifyContent="center">
                                                    <Stack direction="column" height="100%" width="50%" border="1px solid red" justifyContent="center">

                                                        <img style={{ width: "80%", marginBottom: "50px", justifyContent: "center" }} src="https://nodeguardians.io/_next/image?url=%2Fassets%2Fchests%2Fchest.png&w=1800&q=75" />

                                                        <Stack direction="row" height="40px" width="100%" justifyContent="center">
                                                            <Button onClick={handleOpenChestClick} variant="outlined" style={{ marginRight: "20px" }}
                                                                sx={buttonStyle}>
                                                                Open Chest
                                                            </Button>

                                                            <Button onClick={handleBuyChestClick} variant="outlined"
                                                                sx={buttonStyle}>
                                                                Buy Chest
                                                            </Button>
                                                        </Stack>

                                                    </Stack>
                                                </Stack>

                                                <Stack direction="row" height="100%" width="10%" border="1px solid red">
                                                    <Stack direction="column" border="1px solid red">
                                                        <Stack direction="row" sx={{ justifyContent: "end" }}>
                                                            <label className="generic-text-color-white generic-text-font2 inventory-text-info">1500</label>
                                                            <img style={{ width: "40px" }} alt="logo" src={logoWhite} />
                                                        </Stack>
                                                        <Stack direction="row" sx={{ justifyContent: "end", marginTop: "10px" }}>
                                                            <label className="generic-text-color-white generic-text-font2 inventory-text-info">1000</label>
                                                            <img style={{ width: "40px" }} src="https://nodeguardians.io/_next/image?url=%2Fassets%2Fchests%2Fchest.png&w=1800&q=75" />
                                                        </Stack>
                                                    </Stack>
                                                </Stack>
                                            </Stack>

                                        </div>
                                    </>
                                )
                        }
                    </>
                ) : (
                    <>
                        <NotConnected />
                    </>
                )
            }
        </div >

    )
}

export default Inventory