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

import DetailsItems from "../../components/DetailsItem";

const AuctionHouse = () => {

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [listedItems, setListedItems] = useState([]);
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

    const {
        state: { userConnected, currentChainID, currentAccount, auctionHouseContract, guardianStuffContract },
    } = useEth();

    useEffect(() => {

        console.log("Loading page auction house");

        if (userConnected) {

            // TODO: Check the chain id

            if (auctionHouseContract && guardianStuffContract) {

                getListedItems();
            }
        }

    }, [currentAccount, currentChainID, auctionHouseContract, guardianStuffContract]);

    const getListedItems = async () => {

        try {

            const uri = await guardianStuffContract.methods.uri(0).call();
            setIpfsUrl(uri);
            console.log(uri);
            setIpfsUrl(ipfsUrl);

            let storedListedItems = await auctionHouseContract.methods.getListedItems(false, true, false).call();
            console.log(storedListedItems);
            listedItems = [];
            setListedItems([]);
            storedListedItems.map(async (storedListedItem, index) => {

                const test = uri.replace("{id}", storedListedItem.itemId);
                const meta = await axios.get("https://ipfs.io/ipfs/QmZWjLS4zDjZ6C64ZeSKHktcd1jRuqnQPx2gj7AqjFSU2d/1100.json");

                let listedItem =
                {
                    id: index,
                    image: "https://ipfs.io/ipfs/" + meta.data.image,
                    name: meta.data.name,
                    description: meta.data.description,
                    itemID: storedListedItem.itemId,
                    owner: storedListedItem.owner,
                    seller: storedListedItem.seller,
                    buyer: storedListedItem.buyer,
                    price: storedListedItem.price,
                    deadline: storedListedItem.deadline,
                    currentlyListed: storedListedItem.currentlyListed,
                    isSold: storedListedItem.isSold,
                };
                const match = listedItems.find(x => x.id === listedItem.id);

                if (!match) {
                    setListedItems(listedItems => [...listedItems, listedItem]);
                }


            });
        } catch (error) {
            console.log(error.message);
        }
    }


    const renderDesignationCell = (params) => {
        return (
            <div style={{ display: "contents", alignContent: "center" }}>
                <img src={params.row.image} height="80%" />

                <label
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ marginLeft: 16, fontSize: "12px" }}>
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
            minWidth: 200,
            flex: 1,
            renderCell: renderDesignationCell
        },
        {
            field: 'rarity',
            headerName: 'Rarity',
            width: 130,
            flex: 1,
        },
        {
            field: 'class',
            headerName: 'Class',
            width: 130,
            flex: 1,
        },
        {
            field: 'owner',
            headerName: 'Owner',
            width: 130,
            flex: 1,
        },
        {
            field: 'seller',
            headerName: 'Seller',
            width: 90,
            flex: 1,
        },
        {
            field: 'deadline',
            headerName: 'Dead line',
            width: 130,
            flex: 1,
        },
        {
            field: 'currentOffer',
            headerName: 'Current offer',
            width: 130,
            flex: 1,
        },
        {
            field: 'price',
            headerName: 'Price',
            // description: 'This column has a value getter and is not sortable.',
            width: 160,
            flex: 1,
            // valueGetter: (params) =>
            //     `${params.row.firstName || ''} ${params.row.lastName || ''}`,
        },

    ];

    const handleRowClick = async (param, event) => {

        setSelectedItem(listedItems[param.id]);
        handleOpen();
    };

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
        height: "80%",
        p: 2,
    }

    return (
        <div style={{
            height: 'calc(100vh - 64px)', display: "grid",
            gridTemplateColumns: "repeat(3, 70% 30%)",
            gridGap: "15px",
            padding: "20px",
            position: "relative",
            boxSizing: "border-box",
            // , maxWidth: "1000px", margin: "20px, auto"
        }}>

            {/* <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >



                <DetailsItems
                    auctionHouseContract={auctionHouseContract}
                    currentAccount={currentAccount}
                    selectedItem={selectedItem} />

            </Modal> */}

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className="modal-main-content">
                    <div className="header-modal-container" direction="row" display="block" >
                        <label>
                            Object details
                        </label>

                        <button className="close-bt" color="red" >
                            X
                        </button>
                    </div>

                    <div className="modal-picture-container">
                        <img src={selectedItem.image} />
                    </div>

                    <Stack direction="row">

                        <div>
                            <img src="https://nodeguardians.io/assets/divers/title-decoration.svg" />
                        </div>


                        <label>
                            {selectedItem.name}
                        </label>


                        <img src="https://nodeguardians.io/assets/divers/title-decoration.svg"
                            style={{ alignContent: "center", rotate: "180deg" }} />


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
                    <div className="generic-label-container"><span>title:</span> <span>value</span></div>
                    <div className="generic-label-container"><span>title:</span> <span>value</span></div>

                    <div className="text-modal-container">
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                    </div>



                    <Stack direction="row" textAlign="center">
                        <label>
                            {selectedItem.price}
                        </label>
                    </Stack>

                    <Button className="modal-submit" onClick={handleBuyItem} variant="outlined" style={{ border: '1px solid rgba(190, 167, 126, 0.5)', backgroundColor: 'rgb(29, 28, 26)', cursor: 'pointer', borderRadius: '5px', fontFamily: 'Cinzel, serif', fontWeight: '900' }}>Buy</Button>


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

            <div sx={{}}>

            </div>

        </div>

    )
}

export default AuctionHouse