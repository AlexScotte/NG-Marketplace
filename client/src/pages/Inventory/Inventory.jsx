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
import { ChainID, ToFriendlyPrice, GetColorRarity, GetColorRarityWithoutTransparency } from "../../Utils/utils";
import ChangeChain from "../../components/ChangeChain";
import NotConnected from "../../components/NotConnected";
import logoWhite from "../../assets/ng-logo-white.png";
import TextField from '@mui/material/TextField';
import Web3 from "web3";

const Inventory = () => {

    const {
        state: {
            userConnected,
            currentChainID,
            currentAccount,
            deployBlock,
            currentBlock,
            auctionHouseContract,
            treasureGuardianAddress,
            treasureGuardianContract,
            guardianStuffContract,
            guardianTokenContract,
            guardianTokenDecimals,
            auctionHouseAddress
        },
    } = useEth();
    const item = {
        id: 0,
        image: "",
        name: "",
        itemID: "",
        rarity: "",
        set: "",
        class: "",
        description: "",
        amount: 0,
    };
    const [wrongChain, setWrongChain] = useState(true);
    const [ownedItems, setOwnedItems] = useState([]);
    const [guardianTokens, setGuardianTokens] = useState(0);
    const [chestItemCount, setChestItemCount] = useState(0);
    const [chestPrice, setChestPrice] = useState(0);
    const [selectedItem, setSelectedItem] = useState(item);
    const [priceValue, setPriceValue] = useState("");



    const [modalMesage, setModalMesage] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [open, setOpen] = useState(false);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const handleModalOpen = () => setOpen(true);
    const handleModalClose = () => setOpen(false);
    const handleDetailsModalOpen = () => setOpenDetailsModal(true);
    const handleDetailsModalClose = () => setOpenDetailsModal(false);

    const [ipfsUrl, setIpfsUrl] = useState("");


    useEffect(() => {

        console.log("Loading page inventory");
        if (userConnected) {

            const wrongChainID = currentChainID != ChainID.Local;
            setWrongChain(wrongChainID);
            if (!wrongChainID) {

                if (guardianTokenContract) {
                    getBalanceOfGuardiantToken();
                }

                if (treasureGuardianContract) {

                    getOldEvents();
                    getChestsPrice();
                    
                }

                if (auctionHouseContract && guardianStuffContract) {

                    getChestsCount();

                }
            }
        }


    }, [
        userConnected,
        currentAccount,
        currentChainID,
        auctionHouseContract,
        treasureGuardianContract,
        guardianStuffContract,
        guardianTokenContract
    ]);

    const getBalanceOfGuardiantToken = async () => {
        try {

            const tokenCount = await guardianTokenContract.methods.balanceOf(currentAccount).call();
            console.log("token: " + tokenCount);
            setGuardianTokens(tokenCount);
        }
        catch (error) {
            console.log(error.message);
        }
    }

    const getChestsCount = async () => {
        try {
            const chestItemID = await guardianStuffContract.methods.chestItemID().call();
            const chestItemCount = await guardianStuffContract.methods.balanceOf(currentAccount, chestItemID).call();
            console.log("Number of chest: " + chestItemCount);
            setChestItemCount(chestItemCount);
        }
        catch (error) {
            console.log(error.message);
        }
    }

    const getChestsPrice = async () => {
        try {
            const chestsPrice = await treasureGuardianContract.methods.chestPrice().call();
            console.log("Chest Price: " + chestsPrice);
            setChestPrice(chestsPrice);
        }
        catch (error) {
            console.log(error.message);
        }
    }

    const getOldEvents = async () => {

        let onStuffTransferedToEvents = await treasureGuardianContract.getPastEvents('onStuffTransferedTo', {
            fromBlock: deployBlock,
            toBlock: currentBlock
        });

        let ids = [];
        onStuffTransferedToEvents.map((event) => {

            if (event.returnValues.to.toUpperCase() == currentAccount.toUpperCase()) {

                ids = ids.concat(event.returnValues.ids);
            }
        });

        getOwnedItems(ids);
    };

    const getOwnedItems = async (ids) => {

        try {
            const addresses = ids.map(i => currentAccount);
            const balanceItems = await guardianStuffContract.methods.balanceOfBatch(addresses, ids).call();

            const items = await Promise.all(ids.map(async (itemID, index) => {

                // TODO: manage missing supply for this id 
                if (itemID != 0) {

                    if (balanceItems[index] > 0) {

                        const uri = await guardianStuffContract.methods.uri(0).call({ from: currentAccount });
                        const uriWithID = uri.replace("{id}", itemID);

                        
                            const meta = await axios.get(uriWithID);
                            // const meta = await axios.get("https://ipfs.io/ipfs/QmZWjLS4zDjZ6C64ZeSKHktcd1jRuqnQPx2gj7AqjFSU2d/1100.json");
                            // console.log("META:");
                            // console.log(index);
                            // console.log(meta.data);
                        return {
                            id: index,
                            image: "https://ipfs.io/ipfs/" + meta.data.image,
                            name: meta.data.name,
                            rarity: meta.data.rarity,
                            set: meta.data.set,
                            type: meta.data.type,
                            class: meta.data.class,
                            description: meta.data.description,
                            itemID: itemID,
                            amount: balanceItems[index]
                        };
                    }
                }
            }));
            
            setOwnedItems(items);
        }
        catch (error) {
            console.log(error.message);
        }

    }

    const handleOwnedItemClick = async (param, event) => {


        console.log(param)
        setSelectedItem(ownedItems[param.id]);
        handleDetailsModalOpen();
    };

    const onPriceChange = async (e) => {

        setPriceValue(e.target.value);
    };


    const handleBuyChestClick = async (param, event) => {

        if (parseInt(guardianTokens) < parseInt(chestPrice)) {

            setModalTitle("Not enough money !");
            setModalMesage("Sorry Guardian, you do not have enough money");
            handleModalOpen();
        }
        else {

            try {
                const price = Web3.utils.BN(await treasureGuardianContract.methods.chestPrice().call());
                console.log(price)
                ; console.log("Approve treasure guardian contract");
                await guardianTokenContract.methods.approve(treasureGuardianAddress, chestPrice).call({ from: currentAccount });
                await guardianTokenContract.methods.approve(treasureGuardianAddress, chestPrice).send({ from: currentAccount });
                console.log("Approve treasure succeeded");

                console.log("Buying chest ... ");
                await treasureGuardianContract.methods.buyChest(1).call({ from: currentAccount });
                await treasureGuardianContract.methods.buyChest(1).send({ from: currentAccount });

                const title = "Congratulations Guardian !";
                const message = "You can open the chest to retrieve the equipment inside";
                console.log(message);
                setModalTitle(title);
                setModalMesage(message);
                getChestsCount();
                getBalanceOfGuardiantToken();
                handleModalOpen();
            }
            catch (error) {
                setModalTitle("Error !");
                setModalMesage("An error occurred while buying a chest");
                handleModalOpen();


                console.log(error.message);
            }
        }
    };

    const handleOpenChestClick = async (param, event) => {
        if (chestItemCount > 0) {

            try {

                await treasureGuardianContract.methods.openChest().call({ from: currentAccount });
                await treasureGuardianContract.methods.openChest().send({ from: currentAccount });

                getOldEvents();
                getChestsCount();

                setModalTitle("Congratulations Guardian !");
                setModalMesage("You can find your stuff in your inventory");
                handleModalOpen();

            }
            catch (error) {
                setModalTitle("Error !");
                setModalMesage("An error occurred while opening your chest");
                handleModalOpen();
                console.log(error.message);
            }
        }
        else {
            setModalTitle("No Chest !");
            setModalMesage("Sorry Guardian, you do not have any chests");
        }

        handleModalOpen();
    };

    const handleListItem = async () => {

        if (parseInt(priceValue) <= 0) {

            setModalTitle("Incorrect price !");
            setModalMesage("Sorry Guardian, you need to specify a correct sell price");
            handleModalOpen();
        }
        else {

            try {

                console.log("Approve marketplace to manage our item");
                console.log(auctionHouseAddress);
                await guardianStuffContract.methods.setApprovalForAll(auctionHouseAddress, true).call({ from: currentAccount });
                await guardianStuffContract.methods.setApprovalForAll(auctionHouseAddress, true).send({ from: currentAccount });
                console.log("Approved");

                let listingFee = web3.utils.BN(await auctionHouseContract.methods.listingFee().call({ from: currentAccount }));
                console.log("listing fee: " + listingFee);

                console.log("Listing item");
                await auctionHouseContract.methods.listItem(selectedItem.itemID, web3.utils.toWei(priceValue.toString(), 'ether')).call({ from: currentAccount, value: listingFee });
                await auctionHouseContract.methods.listItem(selectedItem.itemID, web3.utils.toWei(priceValue.toString(), 'ether')).send({ from: currentAccount, value: listingFee });

                const title = "Congratulations Guardian !";
                const message = "You item is now available in the auction house";

                console.log(message);
                setModalTitle(title);
                setModalMesage(message);
                getChestsCount();
                getBalanceOfGuardiantToken();
                handleModalOpen();
            }
            catch (error) {
                setModalTitle("Error !");
                setModalMesage("An error occurred while buying a chest");
                handleModalOpen();


                console.log(error.message);
            }
        }
    }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'rgb(29, 28, 26)',
        border: '1px solid rgb(159, 140, 108)',
        boxShadow: 24,
        borderRadius: '2px',
        height: "10%",
        p: 2,
    }
    const detailStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'rgb(29, 28, 26)',
        border: '1px solid rgba(190, 167, 126, 0.314)',
        boxShadow: 24,
        borderRadius: '2px',
        height: "80%",
        p: 2,
    }
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

                                            <Modal
                                                open={open}
                                                onClose={handleModalClose}>

                                                {
                                                    <Box sx={style} className="modal-main-content">

                                                        <label className="modal-information-title generic-text-font1-uppercase generic-text-color">
                                                            {modalTitle}
                                                        </label>
                                                        <label className="modal-information-text generic-text-font generic-text-color" style={{ marginTop: '10px' }}>
                                                            {modalMesage}
                                                        </label>

                                                        <Button className="modal-submit" onClick={handleModalClose} variant="outlined"
                                                            sx={buttonStyle}>
                                                            Close
                                                        </Button>
                                                    </Box>

                                                }
                                            </Modal>


                                            <Modal
                                                open={openDetailsModal}
                                                onClose={handleDetailsModalClose}
                                                aria-labelledby="modal-modal-title"
                                                aria-describedby="modal-modal-description"
                                            >
                                                <Box sx={detailStyle} className="modal-main-content">
                                                    <div className="header-modal-container" direction="row" display="block" style={{ marginBottom: "5px" }} >
                                                        <label className="modal-details-text-title">
                                                            {selectedItem.name}
                                                        </label>
                                                    </div>

                                                    <div className="modal-picture-container" style={{ background: "radial-gradient(circle, " + GetColorRarity(selectedItem.rarity) + " 35%, rgba(235, 249, 1, 0) 100%)" }}>
                                                        <img src={selectedItem.image} />
                                                    </div>

                                                    <Stack direction="row" justifyContent="center" style={{ marginTop: "10px", marginBottom: "10px" }}>

                                                        <div>
                                                            <img src="https://nodeguardians.io/assets/divers/title-decoration.svg"
                                                                style={{ alignContent: "center", marginTop: "5px", marginRight: "5px" }} />
                                                        </div>


                                                        <label className="generic-text-font2 modal-details-text-title"
                                                            style={{ color: GetColorRarityWithoutTransparency(selectedItem.rarity) }}>
                                                            {selectedItem.rarity}
                                                        </label>


                                                        <img src="https://nodeguardians.io/assets/divers/title-decoration.svg"
                                                            style={{ alignContent: "center", rotate: "180deg", marginLeft: "10px" }} />


                                                    </Stack>


                                                    <Stack direction="row" style={{ marginBottom: "5px" }}>
                                                        <label className="generic-text-font2 generic-text-color-yellow modal-details-text"
                                                            style={{ marginRight: "5px" }}>
                                                            Class:
                                                        </label>
                                                        <label className="generic-text-font2 generic-text-color modal-details-text">
                                                            {selectedItem.class}
                                                        </label>
                                                    </Stack>

                                                    <Stack direction="row" style={{ marginBottom: "5px" }}>
                                                        <label className="generic-text-font2 generic-text-color-yellow modal-details-text"
                                                            style={{ marginRight: "5px" }}>
                                                            Set:
                                                        </label>
                                                        <label className="generic-text-font2 generic-text-color modal-details-text">
                                                            {selectedItem.set}
                                                        </label>
                                                    </Stack>

                                                    <Stack direction="row" style={{ marginBottom: "5px" }}>
                                                        <label className="generic-text-font2 generic-text-color-yellow modal-details-text"
                                                            style={{ marginRight: "5px" }}>
                                                            Type:
                                                        </label>
                                                        <label className="generic-text-font2 generic-text-color modal-details-text">
                                                            {selectedItem.type}
                                                        </label>
                                                    </Stack>

                                                    <div className="text-modal-container generic-text-font2 generic-text-color modal-details-text" style={{ marginTop: "10px" }}>
                                                        {selectedItem.description}
                                                    </div>



                                                    <Stack direction="row" textAlign="center" justifyContent="center">
                                                        <input type="number" sx={buttonStyle} value={priceValue}
                                                            onChange={onPriceChange} />
                                                    </Stack>

                                                    <Button className="modal-submit" sx={buttonStyle} onClick={handleListItem} variant="outlined">
                                                        Sell
                                                    </Button>


                                                </Box>

                                            </Modal>


                                            <Stack direction="row" height="100%" width="100%" border="1px solid red">
                                                <Stack direction="row" height="100%" width="50%" border="1px solid red">

                                                    {/* 
                                                    // TODO: Manage filters
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


                                                    </Box> */}

                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            // p: 1,
                                                            // m: 1,
                                                            // maxWidth: 300,
                                                            height: '70vh',
                                                            overflow: 'scroll',
                                                            alignContent: 'flex-start',
                                                            borderRadius: 1,
                                                        }}
                                                    >

                                                        {
                                                            ownedItems.map((item, index) => {
                                                                return (
                                                                    <div key={index}>
                                                                        <Box sx={{
                                                                            borderColor: 'rgba(190, 167, 126, 0.125)',
                                                                            background: 'linear-gradient(135deg, rgba(255, 255, 244, 0) 0%, ' + GetColorRarity(item.rarity) + ' 100%);'
                                                                        }}>

                                                                            <img onClick={() => handleOwnedItemClick((item))} style={{}} src={item.image} width='60px' height='60px' />
                                                                        </Box>
                                                                    </div>

                                                                );
                                                            })
                                                        }
                                                    </Box>


                                                </Stack>

                                                <Stack direction="row" height="100%" width="90%" border="1px solid red" justifyContent="center">
                                                    <Stack direction="column" height="100%" width="50%" border="1px solid red" justifyContent="center">

                                                        <Stack direction="row" sx={{ justifyContent: "center", marginBottom: "40px" }}>

                                                            <label className="generic-text-color-white generic-text-font2 inventory-text-info">
                                                                Chest Price: {ToFriendlyPrice(chestPrice, guardianTokenDecimals)}
                                                            </label>
                                                            <img style={{ height: "30px", marginTop: "5px" }} alt="logo" src={logoWhite} />
                                                        </Stack>

                                                        <div style={{ justifyContent: "center" }}>

                                                            <img style={{ width: "80%", marginBottom: "50px" }} src="https://nodeguardians.io/_next/image?url=%2Fassets%2Fchests%2Fchest.png&w=1800&q=75" />
                                                        </div>

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
                                                            <label className="generic-text-color-white generic-text-font2 inventory-text-info">{ToFriendlyPrice(guardianTokens, guardianTokenDecimals)}</label>
                                                            <img style={{ width: "40px" }} alt="logo" src={logoWhite} />
                                                        </Stack>
                                                        <Stack direction="row" sx={{ justifyContent: "end", marginTop: "10px" }}>
                                                            <label className="generic-text-color-white generic-text-font2 inventory-text-info">{chestItemCount}</label>
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