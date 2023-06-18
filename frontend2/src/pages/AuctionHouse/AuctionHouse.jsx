import React, { useEffect, useState } from "react";
import { DataGrid, GridFooter, GridFooterContainer } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Image from "next/image";
import axios from "axios";
import useEth from "../../contexts/EthContext/useEth";
import {
  ChainID,
  ToFriendlyPrice,
  GetColorRarity,
  GetColorRarityWithoutTransparency,
  ToShortAddress,
  GetCoinIconWithEnv,
} from "../../Utils/utils";
import ChangeChain from "../../components/ChangeChain";
import NotConnected from "../../components/NotConnected";
import { useAccount, useNetwork } from "wagmi";
import Tooltip from "@mui/material/Tooltip";
import soldIcon from "../../assets/Sold.png";

const AuctionHouse = () => {
  const {
    state: {
      loadingContractOK,
      treasureGuardianContractProvider,
      treasureGuardianContractSigner,
      guardianStuffContractProvider,
      guardianStuffContractSigner,
      guardianTokenContractProvider,
      guardianTokenContractSigner,
      auctionHouseContractProvider,
      auctionHouseContractSigner,
    },
  } = useEth();

  const { isConnected, address: userAccount } = useAccount();
  const { chain } = useNetwork();
  const [open, setOpen] = useState(false);
  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);
  const [guardianTokenDecimals, setGuardianTokenDecimals] = useState(0);

  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const handleDetailsModalOpen = () => setOpenDetailsModal(true);
  const handleDetailsModalClose = () => setOpenDetailsModal(false);

  const [modalTitle, setModalTitle] = useState("");
  const [modalMesage, setModalMesage] = useState("");

  const [listedItems, setListedItems] = useState([]);
  const [filteredListedItems, setFilteredListedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [wrongChain, setWrongChain] = useState(true);
  const Filters = {
    Sales: 0,
    MySales: 1,
    Sold: 2,
  };
  const [currentFilter, setCurrentFilter] = useState(Filters.Sales);

  useEffect(() => {
    console.log("Loading page auction house");

    if (isConnected) {
      const wrongChainID = chain?.id != ChainID.HardhatLocal;
      setWrongChain(wrongChainID);
      if (!wrongChainID && loadingContractOK) {
        getListedItems();
      }
    }
  }, [isConnected, chain, loadingContractOK]);

  /* Get all listed items on the marketplace */
  const getListedItems = async () => {
    try {
      const uri = await guardianStuffContractProvider.uri(0);
      console.log(uri);

      console.log("Get all listed items");
      const storedListedItems =
        await auctionHouseContractProvider.getListedItems();

      const decimals = await guardianTokenContractProvider.decimals();
      setGuardianTokenDecimals(decimals);

      const items = await Promise.all(
        storedListedItems.map(async (storedListedItem, index) => {
          const uriWithID = uri.replace("{id}", storedListedItem.itemId);
          // console.log("Item metadata url: " + uriWithID);
          // const meta = await axios.get("https://ipfs.io/ipfs/QmZWjLS4zDjZ6C64ZeSKHktcd1jRuqnQPx2gj7AqjFSU2d/1103.json");
          const meta = await axios.get(uriWithID);

          return {
            id: index,
            image: "https://ipfs.io/ipfs/" + meta.data.image,
            name: meta.data.name,
            rarity: meta.data.rarity,
            set: meta.data.set,
            type: meta.data.type,
            class: meta.data.class,
            description: meta.data.description,
            listedItemId: storedListedItem.listedItemId,
            itemID: storedListedItem.itemId,
            seller: storedListedItem.seller,
            buyer: storedListedItem.buyer,
            price: storedListedItem.price,
            currentlyListed: storedListedItem.currentlyListed,
            isSold: storedListedItem.isSold,
          };
        })
      );

      setListedItems(items);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    handleFilterClick(currentFilter);
  }, [listedItems]);

  const handleRowClick = async (param) => {
    const selectedItem = listedItems.find((item) => item.id == param.id);
    setSelectedItem(selectedItem);
    handleDetailsModalOpen();
  };

  /* Buy item */
  const handleBuyItem = async () => {
    if (selectedItem.seller.toUpperCase() === userAccount.toUpperCase()) {
      setModalTitle("Error !");
      setModalMesage("Sorry Guardian, you cannot buy your own item");
      handleModalOpen();
    } else {
      try {
        console.log("Buy in progress");
        await auctionHouseContractSigner.executeSale(
          selectedItem.listedItemId,
          { value: selectedItem.price }
        );

        const title = "Congratulations Guardian !";
        const message = "You buy a new piece of equipement";
        setModalTitle(title);
        setModalMesage(message);
        await getListedItems();
        handleModalOpen();
        handleDetailsModalClose();
      } catch (error) {
        setModalTitle("Error !");
        setModalMesage("An error occurred while buying the item");
        handleModalOpen();
        console.log(error);
      }
    }
  };

  /* Cancel sale */
  const handleCancelSale = async () => {
    if (selectedItem.seller.toUpperCase() != userAccount.toUpperCase()) {
      setModalTitle("Error !");
      setModalMesage(
        "Sorry Guardian, you cannot this sale because you do not created it"
      );
      handleModalOpen();
    } else {
      try {
        // price already in ether
        console.log("Cancel sale in progress");
        await auctionHouseContractSigner.cancelSale(selectedItem.listedItemId);

        const title = "Congratulations Guardian !";
        const message = "The sale has been canceled";
        setModalTitle(title);
        setModalMesage(message);
        await getListedItems();
        handleModalOpen();
        handleDetailsModalClose();
      } catch (error) {
        setModalTitle("Error !");
        setModalMesage("An error occurred while buying the item");
        handleModalOpen();
        console.log(error);
      }
    }
  };

  const handleFilterClick = (filter) => {
    console.log("Filter clicked: " + filter);

    let filteredItems = listedItems;
    switch (filter) {
      // All listed item not sold
      case Filters.Sales:
        filteredItems = listedItems.filter((i) => !i.isSold);

      default:
        break;

      // Current user sales
      case Filters.MySales:
        filteredItems = listedItems.filter(
          (i) => i.seller == userAccount && !i.isSold
        );
        break;

      // All items sold
      case Filters.Sold:
        filteredItems = listedItems.filter((i) => i.isSold);
        break;
    }

    setFilteredListedItems(filteredItems);
    setCurrentFilter(filter);
  };

  const renderDesignationCell = (params) => {
    return (
      <Stack style={{ display: "contents", alignContent: "center" }}>
        <Box
          sx={{
            borderColor: "rgba(190, 167, 126, 0.125)",
            background:
              "linear-gradient(135deg, rgba(255, 255, 244, 0) 0%, " +
              GetColorRarity(params.row.rarity) +
              " 100%);",
            height: "90%",
            marginTop: "5px",
          }}
        >
          <img
            src={params.row.image}
            height="90%"
            style={{ marginTop: "5px" }}
          />
        </Box>

        <label
          variant="contained"
          color="primary"
          fontFamily="Lato"
          style={{ marginLeft: "10px" }}
        >
          {params.row.name}
        </label>
      </Stack>
    );
  };

  const renderRarityCell = (params) => {
    return (
      <label
        variant="contained"
        fontFamily="Lato"
        style={{
          color: GetColorRarityWithoutTransparency(params.row.rarity),
        }}
      >
        {params.row.rarity}
      </label>
    );
  };

  const renderPriceCell = (params) => {
    return (
      <Stack direction="row" justifyContent="center" alignContent="center">
        <label
          variant="contained"
          color="primary"
          fontFamily="Lato"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          {ToFriendlyPrice(params.value, guardianTokenDecimals)}
        </label>

        <img src={GetCoinIconWithEnv()} height="20px" width="20px" />
      </Stack>
    );
  };

  const columns = [
    {
      field: "designation",
      headerName: "Designation",
      //   minWidth: 300,
      width: "50px",
      flex: 2,
      renderCell: renderDesignationCell,
    },
    {
      field: "rarity",
      headerName: "Rarity",
      width: 90,
      flex: 1,
      renderCell: renderRarityCell,
    },
    {
      field: "class",
      headerName: "Class",
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
      field: "seller",
      headerName: "Seller",
      width: 90,
      flex: 1,
      valueGetter: (params) => `${ToShortAddress(params.value)}`,
    },
    {
      field: "buyer",
      headerName: "Buyer",
      width: 90,
      flex: 1,
      valueGetter: (params) => `${ToShortAddress(params.value)}`,
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
      field: "price",
      headerName: "Price",
      width: 90,
      flex: 1,
      renderCell: renderPriceCell,
    },
  ];

  const customFooter = () => {
    return (
      <GridFooterContainer
        sx={{
          borderTop: "none", // To delete double border.
        }}
      >
        {/* Add what you want here */}
        <Stack direction="row" width="100%" marginBottom="-0px">
          <Tooltip title="All listed items">
            <Box
              marginLeft="5px"
              onClick={() => handleFilterClick(Filters.Sales)}
            >
              <Typography
                variant="subtitle1"
                className={
                  "mp-filter-sales " +
                  (currentFilter === Filters.Sales
                    ? "mp-filter-sales-selected"
                    : "")
                }
              >
                Sales
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="User current sales">
            <Box onClick={() => handleFilterClick(Filters.MySales)}>
              <Typography
                variant="subtitle1"
                className={
                  "mp-filter-sales " +
                  (currentFilter === Filters.MySales
                    ? "mp-filter-sales-selected"
                    : "")
                }
              >
                My sales
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="All items sold">
            <Box onClick={() => handleFilterClick(Filters.Sold)}>
              <Typography
                variant="subtitle1"
                className={
                  "mp-filter-sales " +
                  (currentFilter === Filters.Sold
                    ? "mp-filter-sales-selected"
                    : "")
                }
              >
                Sold
              </Typography>
            </Box>
          </Tooltip>
        </Stack>
        <GridFooter
          sx={{
            borderTop: "none", // To delete double border.
          }}
        />
      </GridFooterContainer>
    );
  };

  return (
    <div className="div-full-screen">
      {isConnected ? (
        <>
          {wrongChain ? (
            <>
              <ChangeChain chain="Mumbai" chainID={ChainID.HardhatLocal} />
            </>
          ) : (
            <>
              {/* INFORMATIONS MODAL  */}
              <Modal open={open} onClose={handleModalClose}>
                {
                  <Box className="modal-main-content">
                    <Typography variant="h6">{modalTitle}</Typography>
                    <Typography variant="subtitle1">{modalMesage}</Typography>

                    <Button
                      className="generic-button modal-submit"
                      onClick={handleModalClose}
                      variant="outlined"
                    >
                      Close
                    </Button>
                  </Box>
                }
              </Modal>

              {/* ITEM DETAILS MODAL */}
              <Modal open={openDetailsModal} onClose={handleDetailsModalClose}>
                <Box className="modal-details-content" height="90%">
                  <Stack height="100%" justifyContent="space-between">
                    <Stack height="100%" overflow="auto">
                      <div
                        className="header-modal-container"
                        direction="row"
                        display="block"
                        style={{ marginBottom: "5px" }}
                      >
                        <Typography variant="subtitle1">
                          {selectedItem.name}
                        </Typography>
                      </div>

                      <div
                        style={{
                          textAlign: "center",
                          background:
                            "radial-gradient(circle, " +
                            GetColorRarity(selectedItem.rarity) +
                            " 35%, rgba(235, 249, 1, 0) 100%)",
                        }}
                      >
                        <img src={selectedItem.image} width="30%" />
                      </div>

                      <Stack
                        direction="row"
                        justifyContent="center"
                        style={{ marginTop: "10px", marginBottom: "10px" }}
                      >
                        <img
                          src="https://nodeguardians.io/assets/divers/title-decoration.svg"
                          style={{
                            alignContent: "center",
                            marginRight: "5px",
                          }}
                        />

                        <Typography
                          variant="subtitle1"
                          style={{
                            color: GetColorRarityWithoutTransparency(
                              selectedItem.rarity
                            ),
                          }}
                        >
                          {selectedItem.rarity}
                        </Typography>

                        <img
                          src="https://nodeguardians.io/assets/divers/title-decoration.svg"
                          style={{
                            alignContent: "center",
                            rotate: "180deg",
                            marginLeft: "10px",
                          }}
                        />
                      </Stack>

                      <Stack direction="row" marginBottom="5px">
                        <Typography variant="subtitle4" marginRight="5px">
                          Class:
                        </Typography>
                        <Typography variant="subtitle3">
                          {selectedItem.class}
                        </Typography>
                      </Stack>

                      <Stack direction="row" marginBottom="5px">
                        <Typography variant="subtitle4" marginRight="5px">
                          Set:
                        </Typography>
                        <Typography variant="subtitle3">
                          {selectedItem.set}
                        </Typography>
                      </Stack>

                      <Stack direction="row" marginBottom="5px">
                        <Typography
                          variant="subtitle4"
                          style={{ marginRight: "5px" }}
                        >
                          Type:
                        </Typography>
                        <Typography variant="subtitle3">
                          {selectedItem.type}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="subtitle3"
                        marginTop="5px"
                        marginBottom="5px"
                      >
                        {selectedItem.description}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      textAlign="center"
                      justifyContent="center"
                    >
                      <Stack
                        direction="row"
                        textAlign="center"
                        justifyContent="center"
                        marginBottom="10px"
                      >
                        <Typography variant="h6">
                          {ToFriendlyPrice(
                            selectedItem.price,
                            guardianTokenDecimals
                          )}
                        </Typography>

                        <img
                          style={{
                            height: "25px",
                            width: "25px",
                            marginTop: "3px",
                            marginLeft: "10px",
                          }}
                          src={GetCoinIconWithEnv()}
                        />
                      </Stack>
                    </Stack>

                    {currentFilter == Filters.Sold ? (
                      <>
                        {
                          <Image
                            alt="me"
                            src={soldIcon}
                            style={{
                              position: "absolute",
                              bottom: "20px",
                              right: "50px",
                              width: "95px",
                              height: "auto",
                              alignSelf: "center",
                            }}
                          />
                        }
                      </>
                    ) : (
                      <>
                        {selectedItem.seller?.toUpperCase() ===
                        userAccount?.toUpperCase() ? (
                          <>
                            <Button
                              className="generic-button"
                              onClick={handleCancelSale}
                              variant="outlined"
                            >
                              Cancel sale
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              className="generic-button"
                              onClick={handleBuyItem}
                              variant="outlined"
                            >
                              Buy
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </Stack>
                </Box>
              </Modal>

              <DataGrid
                rows={filteredListedItems}
                columns={columns}
                columnVisibilityModel={{
                  buyer: currentFilter == Filters.Sold,
                }}
                // pageSize={5}
                // rowsPerPageOptions={[5]}
                onRowClick={handleRowClick}
                // hideFooter
                hideFooterPagination
                hideFooterSelectedRowCount
                disableColumnMenu
                components={{
                  Footer: customFooter,
                  NoRowsOverlay: () => (
                    <Stack
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                      backgroundColor="rgb(29, 28, 26)"
                      // backgroundColor="transparent"
                    >
                      <Typography variant="h5">No items</Typography>
                    </Stack>
                  ),
                }}
                sx={{
                  // Datagrid root style
                  "&.MuiDataGrid-root": {
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: "rgb(51, 51, 51)",
                    "&$tableRowSelected, &$tableRowSelected:hover": {
                      backgroundColor: "rgb(190, 167, 126)",
                    },
                  },

                  // Header style
                  "& .MuiDataGrid-columnHeaders": {
                    color: "rgb(190, 167, 126)",
                    fontSize: 16,
                    paddingLeft: "15px",
                    border: 0,
                    borderBottom: 1,
                    borderColor: "rgb(71, 62, 47)",
                    backgroundColor: "rgb(29, 28, 26)",
                  },

                  // Row style
                  "& .MuiDataGrid-row": {
                    backgroundColor: "rgb(6, 6, 6)",
                    borderRadius: "15px",
                    marginTop: "4px",
                    marginLeft: "10px",
                    marginRight: "40px",
                    border: "1px solid",
                    borderColor: "rgb(51, 51, 51)",
                  },

                  // Cells border bottom
                  "& div div div div >.MuiDataGrid-cell": {
                    borderBottom: "none",
                  },
                  "& .MuiDataGrid-columnSeparator": {
                    display: "none",
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
                    "&:hover": {
                      backgroundColor: "rgba(29, 28, 26, 0.7)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(29, 28, 26, 0.7)",
                    },
                  },

                  // Remove selected border on cells
                  "& .MuiDataGrid-cell:focus": {
                    outline: " none",
                  },

                  // Remove selected border on header cells
                  "& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus":
                    {
                      outline: "none !important",
                    },

                  // Arrow sort icon
                  ".MuiDataGrid-sortIcon": {
                    opacity: "inherit !important",
                    color: "rgb(190, 167, 126)",
                  },

                  // Data grid scrollbar
                  "*::-webkit-scrollbar": {
                    width: "6px",
                    height: "6px",
                  },
                  "*::-webkit-scrollbar-track": {
                    borderRadius: "6px",
                    boxShadow: "rgb(15, 15, 15) 0px 0px 6px inset;",
                  },
                  "*::-webkit-scrollbar-thumb": {
                    borderRadius: "6px",
                    boxShadow: "rgb(146, 146, 146) 0px 0px 6px inset",
                  },
                }}
              />
            </>
          )}
        </>
      ) : (
        <>
          <NotConnected />
        </>
      )}
    </div>
  );
};

export default AuctionHouse;
