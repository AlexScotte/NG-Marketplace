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
import { ChainID, ToFriendlyPrice } from "../../Utils/utils";
import ChangeChain from "../../components/ChangeChain";
import NotConnected from "../../components/NotConnected";
import logoWhite from "../../assets/ng-logo-white.png";

const Inventory = () => {
    const array = [8, 4, 5, 6, 2, 4, 5, 6, 2, 4, 5, 6, 2, 4, 5, 6, 2, 4, 5, 6, 2, 4, 5, 6, 2, 4, 5, 6, 2];
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
            guardianTokenDecimals
        },
    } = useEth();

    const [wrongChain, setWrongChain] = useState(true);
    const [ownedItems, setOwnedItems] = useState([]);
    const [guardianTokens, setGuardianTokens] = useState(0);
    const [chestItemCount, setChestItemCount] = useState(0);
    const [chestPrice, setChestPrice] = useState(0);
    const [selectedItem, setSelectedItem] = useState("");

    const [modalMesage, setModalMesage] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [open, setOpen] = useState(false);
    const [inError, setInError] = useState(false);
    const handleModalOpen = () => setOpen(true);
    const handleModalClose = () => setOpen(false);

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

                    console.log("OOOOOOOOOOO");
                    getChestsCount();
                    // getOwnedItems();
                }
            }
        }


    }, [userConnected, currentAccount, currentChainID, auctionHouseContract, treasureGuardianContract, guardianStuffContract, guardianTokenContract]);

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


    // const getOldEvents = useCallback(
    //     async (eventName, stateName) => {
    //       let events = await contract.getPastEvents(eventName, {
    //         fromBlock: deployBlock,
    //         toBlock: currentBlock
    //       });
    //       if (eventName === 'ProposalRegistered') {
    //         events.map((event) => {
    //           return getProposalDescription(event);
    //         });
    //       }
    //       dispatch({
    //         type: actions.updateEvents,
    //         data: { events, stateName }
    //       });
    //     },
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    //     [contract]
    //   );



    const getOldEvents = async () => {

        let events = await treasureGuardianContract.getPastEvents('onStuffTransferedTo', {
            fromBlock: deployBlock,
            toBlock: currentBlock
        });

        events.map((event) => {
            console.log(event);
        });
    };


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

        if (parseInt(guardianTokens) < parseInt(chestPrice)) {

            setInError(true);
            setModalTitle("Not enough money !");
            setModalMesage("Sorry Guardian, you do not have enough money");
            handleModalOpen();
        }
        else {

            try {
                console.log("Approve treasure guardian contract");
                await guardianTokenContract.methods.approve(treasureGuardianAddress, chestPrice).call({ from: currentAccount });
                console.log("Approved");
                await guardianTokenContract.methods.approve(treasureGuardianAddress, chestPrice).send({ from: currentAccount });
                console.log("Approve treasure succeeded");

                console.log("Buying chest ... ");
                // await treasureGuardianContract.methods.buyChekst(1).call({ from: currentAccount });
                await treasureGuardianContract.methods.buyChest(1).send({ from: currentAccount });

                const title = "Congratulations Guardian !";
                const message = "You can open the chest to retrieve the equipment inside";

                setInError(false);
                console.log(message);
                setModalTitle(title);
                setModalMesage(message);
                getChestsCount();
                getBalanceOfGuardiantToken();
                handleModalOpen();
            }
            catch (error) {
                console.log("ttttttttttttt");
                setInError(true);
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

                setInError(false);

                const ttt = await guardianStuffContract.methods.owner().call({ from: currentAccount });
                console.log(ttt);
                await treasureGuardianContract.methods.openChest().call({ from: currentAccount });
                const test = await treasureGuardianContract.methods.openChest().send({ from: currentAccount });
                console.log(test);

                getChestsCount();

                setModalTitle("Congratulations Guardian !");
                setModalMesage("You can find your stuff in your inventory");
                handleModalOpen();

            }
            catch (error) {
                setInError(true);
                setModalTitle("Error !");
                setModalMesage("An error occurred while opening your chest");
                handleModalOpen();
                console.log(error.message);
            }
        }
        else {
            setInError(true);
            setModalTitle("No Chest !");
            setModalMesage("Sorry Guardian, you do not have any chests");
        }

        handleModalOpen();
    };

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
                                                    inError ?
                                                        (<>
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
                                                        </>) :
                                                        (<> </>)
                                                }
                                            </Modal>

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