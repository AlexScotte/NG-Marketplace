import React, { useEffect, useState } from "react";
import useEth from '../../contexts/EthContext/useEth';
import web3 from "web3";
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import axios from 'axios';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

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
        state: { userConnected, currentChainID, currentAccount, auctionHouseContract, stuffContract },
    } = useEth();

    useEffect(() => {

        console.log("Loading page auction house");

        if (userConnected) {

            // TODO: Check the chain id

            if (auctionHouseContract && stuffContract) {

                getListedItems();
            }
        }

    }, [currentAccount, currentChainID, auctionHouseContract, stuffContract]);

    const getListedItems = async () => {

        try {

            const uri = await stuffContract.methods.uri(0).call();
            setIpfsUrl(uri);
            console.log(uri);
            setIpfsUrl(ipfsUrl);

            let storedListedItems = await auctionHouseContract.methods.getListedItems(false, true, false).call();
            setListedItems([]);
            let index = 0;
            storedListedItems.map(async (storedListedItem) => {

                const test = uri.replace("{id}", storedListedItem.itemId);
                const meta = await axios.get("https://ipfs.io/ipfs/QmWHoeyafsznQ6QKqWvUUZ4scivKh8j4y4PMryk2w8nN4r/10.json");

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

                setListedItems(listedItems => [...listedItems, listedItem]);
                index++;

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
                    style={{ marginLeft: 16 }}>
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

    // const columns = [
    //     {
    //         field: 'id', headerName: 'Name',
    //         minWidth: 200,
    //         flex: 1,
    //         renderCell: renderNameCell
    //     },
    //     {
    //         field: 'firstName',
    //         headerName: 'Rarity',
    //         width: 130,
    //         flex: 1,
    //         renderCell: renderCells

    //     },
    //     {
    //         field: 'lastName',
    //         headerName: 'Time left',
    //         width: 130,
    //         flex: 1,
    //     },
    //     {
    //         field: 'age',
    //         headerName: 'Age',
    //         type: 'number',
    //         width: 90,
    //         flex: 1,
    //     },
    //     {
    //         field: 'fullName',
    //         headerName: 'Seller',
    //         description: 'This column has a value getter and is not sortable.',
    //         sortable: false,
    //         width: 160,
    //         flex: 1,
    //         valueGetter: (params) =>
    //             `${params.row.firstName || ''} ${params.row.lastName || ''}`,
    //     },
    //     {
    //         field: 'currentOffer',
    //         headerName: 'Current offer',
    //         width: 130,
    //         flex: 1,
    //     },
    //     {
    //         field: 'sellingPrice',
    //         headerName: 'Selling price',
    //         width: 130,
    //         flex: 1,
    //     },
    // ];


    const columns = [
        {
            field: 'designation',
            headerName: 'Designation',
            minWidth: 200,
            flex: 1,
            renderCell: renderDesignationCell
        },
        {
            field: 'itemID',
            headerName: 'ID',
            width: 130,
            flex: 1,
            renderCell: renderCells

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
        console.log("Row:");
        console.log(param);
        console.log(event);

        setSelectedItem(listedItems[param.id]);
        handleOpen();
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    }

    return (
        <div style={{ height: '70vh', width: '80%', justifyContent: 'center', alignItems: 'center' }}>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {selectedItem.owner}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                    </Typography>
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
        </div>

    )
}

export default AuctionHouse