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
import { ChainID, ToFriendlyPrice, GetColorRarity, GetColorRarityWithoutTransparency, ToShortAddress } from "../../Utils/utils";
import ChangeChain from "../../components/ChangeChain";

const AuctionHouse = () => {

    const [open, setOpen] = useState(false);
    const handleModalOpen = () => setOpen(true);
    const handleModalClose = () => setOpen(false);

    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const handleDetailsModalOpen = () => setOpenDetailsModal(true);
    const handleDetailsModalClose = () => setOpenDetailsModal(false);

    const [modalTitle, setModalTitle] = useState("");
    const [modalMesage, setModalMesage] = useState("");


    const [listedItems, setListedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState("");
    const [ipfsUrl, setIpfsUrl] = useState("");
    const [wrongChain, setWrongChain] = useState(true);

    const item = {
        id: 0,
        listedId: 0,
        image: "",
        name: "",
        itemID: "",
        rarity: "",
        set: "",
        class: "",
        description: "",
        seller: "",
        buyer: "",
        price: "",
        currentlyListed: "",
        isSold: "",
    };

    const {
        state: {
            userConnected,
            currentChainID,
            currentAccount,
            auctionHouseContract,
            guardianStuffContract,
            guardianTokenDecimals,
        },
    } = useEth();

    useEffect(() => {

        console.log("Loading page auction house");

        const wrongChainID = currentChainID != ChainID.Local;
        setWrongChain(wrongChainID);
        if (!wrongChainID) {

            if (auctionHouseContract && guardianStuffContract) {

                getListedItems();
            }
        }
    }, [currentAccount, currentChainID, auctionHouseContract, guardianStuffContract]);

    let getListedItemsLoading = false;
    const getListedItems = async () => {

        if (getListedItemsLoading)
            return;

        getListedItemsLoading = true;
        try {

            const uri = await guardianStuffContract.methods.uri(0).call();
            setIpfsUrl(uri);
            console.log(uri);

            let storedListedItems = await auctionHouseContract.methods.getListedItems().call();
            console.log(storedListedItems);
            setListedItems(listedItems => []);
            console.log("empty ? :" + listedItems);
            storedListedItems.map(async (storedListedItem, index) => {

                console.log("item: " + index);
                console.log("item: " + storedListedItem.listedId);
                if (storedListedItem.isSold) {
                    return;
                }
                const uriWithID = uri.replace("{id}", storedListedItem.itemId);
                // console.log("Item metadata url: " + uriWithID);
                // const meta = await axios.get("https://ipfs.io/ipfs/QmZWjLS4zDjZ6C64ZeSKHktcd1jRuqnQPx2gj7AqjFSU2d/1103.json");
                const meta = await axios.get(uriWithID);

                let listedItem =
                {
                    id: index,
                    image: "https://ipfs.io/ipfs/" + meta.data.image,
                    name: meta.data.name,
                    rarity: meta.data.rarity,
                    set: meta.data.set,
                    type: meta.data.type,
                    class: meta.data.class,
                    description: meta.data.description,
                    listedID: storedListedItem.listedItemId,
                    itemID: storedListedItem.itemId,
                    seller: storedListedItem.seller,
                    buyer: storedListedItem.buyer,
                    price: storedListedItem.price,
                    currentlyListed: storedListedItem.currentlyListed,
                    isSold: storedListedItem.isSold,
                };
                const match = listedItems.find(x => x.id === listedItem.id);

                if (!match) {
                    setListedItems(listedItems => [...listedItems, listedItem]);
                }

                getListedItemsLoading = false;
            });
        } catch (error) {
            getListedItemsLoading = false;
            console.log(error.message);
        }
    }


    const renderDesignationCell = (params) => {
        return (
            <div style={{ display: "contents", alignContent: "center" }}>

                <Box sx={{
                    height: "50%",
                    borderColor: 'rgba(190, 167, 126, 0.125)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 244, 0) 0%, ' + GetColorRarity(params.row.rarity) + ' 100%);'
                }}>


                    <img src={params.row.image} height="100%" />
                </Box>

                <label
                    variant="contained"
                    color="primary"
                    fontFamily="Lato"
                    style={{ marginLeft: "10px" }}>
                    {params.row.name}
                </label>
            </div>
        )
    }

    const renderCells = (params) => {

        return (

            <Box sx={{}}>
                <label
                    variant="contained"
                    color="primary"
                    size="small"
                    style={{}}>
                    {params.value}
                </label>
            </Box>
        )
    }

    const columns = [
        {
            field: 'designation',
            headerName: 'Designation',
            minWidth: 300,
            flex: 1,
            renderCell: renderDesignationCell
        },
        {
            field: 'rarity',
            headerName: 'Rarity',
            width: 90,
            flex: 1,
        },
        {
            field: 'class',
            headerName: 'Class',
            width: 90,
            flex: 1,
        },
        // {
        //     field: 'owner',
        //     headerName: 'Owner',
        //     width: 130,
        //     flex: 1,
        // },
        {
            field: 'seller',
            headerName: 'Seller',
            width: 90,
            flex: 1,
            valueGetter: (params) =>
                `${ToShortAddress(params.value)}`,
        },
        // {
        //     field: 'deadline',
        //     headerName: 'Dead line',
        //     width: 130,
        //     flex: 1,
        // },
        // {
        //     field: 'currentOffer',
        //     headerName: 'Current offer',
        //     width: 130,
        //     flex: 1,
        // },
        {
            field: 'price',
            headerName: 'Price',
            // description: 'This column has a value getter and is not sortable.',
            width: 90,
            flex: 1,
            valueGetter: (params) =>
                `${ToFriendlyPrice(params.value, guardianTokenDecimals)}`,
        },

    ];

    const handleRowClick = async (param, event) => {

        setSelectedItem(listedItems[param.id]);
        handleDetailsModalOpen();
    };

    const handleBuyItem = async () => {

        if (selectedItem.seller.toUpperCase() === currentAccount.toUpperCase()) {

            setModalTitle("Error !");
            setModalMesage("Sorry Guardian, you cannot buy your own item");
            handleModalOpen();
        }
        else {

            try {

                console.log(selectedItem.itemId);
                const price = selectedItem.price.toString();
                console.log(price);
                // price already in ether
                console.log(price);
                await auctionHouseContract.methods.executeSale(0).send({ from: currentAccount, value: price });


                const title = "Congratulations Guardian !";
                const message = "You buy a new piece of equipement";
                setModalTitle(title);
                setModalMesage(message);
                await getListedItems();
                handleModalOpen();
            }
            catch (error) {
                setModalTitle("Error !");
                setModalMesage("An error occurred while buying the item");
                handleModalOpen();
                console.log(error);
            }
        }
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
                wrongChain ?
                    (
                        <>
                            <ChangeChain chain="Mumbai" />
                        </>
                    ) : (
                        <>

                            <div style={{
                                height: 'calc(100vh - 64px)', display: "grid",
                                gridTemplateColumns: "repeat(2, 80% 20%)",
                                gridGap: "15px",
                                padding: "20px",
                                position: "relative",
                                boxSizing: "border-box",
                                // , maxWidth: "1000px", margin: "20px, auto"
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
                                            <label className="generic-text-font2 generic-text-color-white modal-details-text">
                                                {ToFriendlyPrice(selectedItem.price, guardianTokenDecimals)}
                                            </label>
                                        </Stack>

                                        <Button className="modal-submit" sx={buttonStyle} onClick={handleBuyItem} variant="outlined">
                                            Buy
                                        </Button>


                                    </Box>

                                </Modal>

                                <DataGrid

                                    rows={listedItems}
                                    columns={columns}
                                    // pageSize={5}
                                    // rowsPerPageOptions={[5]}
                                    onRowClick={handleRowClick}
                                    // rowHeight={120}
                                    hideFooter
                                    hideFooterPagination
                                    hideFooterSelectedRowCount
                                    disableColumnMenu
                                    sx={{

                                        // Datagrid root style
                                        '&.MuiDataGrid-root': {
                                            borderRadius: '10px',
                                            border: "1px solid",
                                            borderColor: "rgb(51, 51, 51)",
                                            "&$tableRowSelected, &$tableRowSelected:hover": {
                                                backgroundColor: "rgb(190, 167, 126)"
                                            },
                                        },

                                        // Header style
                                        '& .MuiDataGrid-columnHeaders': {
                                            color: "rgb(190, 167, 126)",
                                            fontSize: 16,
                                            paddingLeft: '15px',
                                            border: 0,
                                            borderBottom: 1,
                                            borderColor: "rgb(71, 62, 47)",
                                            backgroundColor: "rgb(29, 28, 26)",
                                        },

                                        // Row style 
                                        '& .MuiDataGrid-row': {
                                            backgroundColor: 'rgb(6, 6, 6)',
                                            borderRadius: '15px',
                                            marginTop: '4px',
                                            marginLeft: '10px',
                                            marginRight: '40px',
                                            border: "1px solid",
                                            borderColor: "rgb(51, 51, 51)"
                                        },

                                        // Cells border bottom
                                        '& div div div div >.MuiDataGrid-cell': {
                                            borderBottom: 'none',
                                        },
                                        '& .MuiDataGrid-columnSeparator': {
                                            display: 'none',
                                        },

                                        // All cell style
                                        '& div[data-rowIndex][role="row"]:nth-of-type(n)': {
                                            color: "rgb(205, 205, 205)",
                                            fontSize: 18,
                                            //risky sizing code starts here
                                            minHeight: "60px !important",
                                            height: 60,
                                            fontFamily: "Lato",
                                            fontSize: "16px",
                                            // "&:hover": {
                                            //     backgroundColor: "purple"
                                            // },
                                            "&.Mui-selected": {
                                                backgroundColor: "rgba(29, 28, 26, 0.7)",
                                            },
                                            "& div": {
                                                minHeight: "60px !important",
                                                height: 60,
                                                lineHeight: "59px !important"
                                            }
                                        },

                                        // Remove selected border on cells
                                        '& .MuiDataGrid-cell:focus': {
                                            outline: ' none'
                                        },

                                        // Remove selected border on header cells
                                        "& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus":
                                        {
                                            outline: "none !important",
                                        },


                                        // '& .MuiDataGrid-virtualScrollerContent': {
                                        //     paddingBottom: 6, // to compensate space between rows
                                        //     boxSizing: 'content-box',
                                        // },

                                        // Arrow sort icon
                                        '.MuiDataGrid-sortIcon': {
                                            opacity: 'inherit !important',
                                            color: "rgb(190, 167, 126)"
                                        },

                                        // Data grid scrollbar
                                        '*::-webkit-scrollbar': {
                                            width: '6px',
                                            height: '6px'
                                        },
                                        '*::-webkit-scrollbar-track': {
                                            'borderRadius': '6px',
                                            'boxShadow': 'rgb(15, 15, 15) 0px 0px 6px inset;'
                                        },
                                        '*::-webkit-scrollbar-thumb': {

                                            'borderRadius': '6px',
                                            'boxShadow': 'rgb(146, 146, 146) 0px 0px 6px inset'
                                        },
                                    }}
                                />


                                {/* <div sx={{ backgroundColor: "red" }}>
                                    <label style={{ color: "white" }}>
                                        TEST
                                    </label>
                                </div> */}
                            </div>

                        </>
                    )}
        </div>

    )
}


export default AuctionHouse