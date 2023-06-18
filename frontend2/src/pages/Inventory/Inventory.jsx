import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import axios from "axios";
import {
  ChainID,
  ToFriendlyPrice,
  GetColorRarity,
  GetColorRarityWithoutTransparency,
  GetCoinIconWithEnv,
  GetExpectedChainIdWithEnv,
  GetExpectedChainNameWithEnv,
} from "../../Utils/utils";
import useEth from "../../contexts/EthContext/useEth";
import ChangeChain from "../../components/ChangeChain";
import NotConnected from "../../components/NotConnected";
import logoWhite from "../../assets/ng-logo-white.png";
import { ethers } from "ethers";
import { useAccount, useNetwork } from "wagmi";
import Tooltip from "@mui/material/Tooltip";
import Image from "next/image";
import allArmorIcon from "../../assets/all-armor.svg";
import headArmorIcon from "../../assets/head-armor.svg";
import bodyArmorIcon from "../../assets/body-armor.svg";
import handsArmorIcon from "../../assets/hand-armor.svg";
import legsArmorIcon from "../../assets/leg-armor.svg";
import weaponLeftIcon from "../../assets/shield.svg";
import weaponRightIcon from "../../assets/weapon-right.svg";
const Inventory = () => {
  const {
    state: {
      deployBlock,
      currentBlock,
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

  const { isConnected, address: userAccount } = useAccount();
  const { chain } = useNetwork();

  const [wrongChain, setWrongChain] = useState(true);
  const [ownedItems, setOwnedItems] = useState([]);
  const [filteredOwnedItems, setFilteredOwnedItems] = useState([]);
  const [guardianTokens, setGuardianTokens] = useState(0);
  const [guardianTokenDecimals, setGuardianTokenDecimals] = useState(0);
  const [chestItemCount, setChestItemCount] = useState(0);
  const [chestPrice, setChestPrice] = useState(0);
  const [selectedItem, setSelectedItem] = useState(item);
  const [priceValue, setPriceValue] = useState("");
  const Filters = {
    All: "all",
    Head: "head",
    Body: "body",
    Hands: "hands",
    Legs: "legs",
    WeaponRight: "weapon right",
    WeaponLeft: "weapon left",
  };
  const [currentFilter, setCurrentFilter] = useState(Filters.All);

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
    if (isConnected) {
      const wrongChainID = chain?.id != GetExpectedChainIdWithEnv();
      setWrongChain(wrongChainID);
      if (!wrongChainID && loadingContractOK) {
        getBalanceOfGuardiantToken();
        getChestsPrice();
        getChestsCount();
        getOwnedItems();
      }
    }
  }, [isConnected, chain, loadingContractOK]);

  const getBalanceOfGuardiantToken = async () => {
    try {
      const tokenCount = await guardianTokenContractProvider.balanceOf(
        userAccount
      );
      console.log("Number of guardian tokens: " + tokenCount);
      setGuardianTokens(tokenCount);

      const decimals = await guardianTokenContractProvider.decimals();
      setGuardianTokenDecimals(decimals);
    } catch (error) {
      console.log(error.message);
    }
  };

  const getChestsCount = async () => {
    try {
      const chestItemID = await guardianStuffContractProvider.chestItemID();
      const chestItemCount = await guardianStuffContractProvider.balanceOf(
        userAccount,
        chestItemID
      );
      console.log("Number of chest: " + chestItemCount);
      setChestItemCount(chestItemCount);
    } catch (error) {
      console.log(error.message);
    }
  };

  const getChestsPrice = async () => {
    try {
      const chestsPrice = await treasureGuardianContractProvider.chestPrice();
      console.log("Chest Price: " + chestsPrice);
      setChestPrice(chestsPrice);
    } catch (error) {
      console.log(error.message);
    }
  };

  const getOwnedItems = async () => {
    try {
      const ids = await guardianStuffContractProvider.getItemIDs();
      const addresses = ids.map((i) => userAccount);
      const balanceItems = await guardianStuffContractProvider.balanceOfBatch(
        addresses,
        ids
      );

      const items = await Promise.all(
        ids.map(async (itemID, index) => {
          // TODO: manage missing supply for this id
          if (itemID != 0) {
            if (balanceItems[index] > 0) {
              const uri = await guardianStuffContractProvider.uri(0);
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
                amount: balanceItems[index],
              };
            } else {
              // User do not owned this item id (item not dropped, listing, etc)
              return {
                id: -1,
              };
            }
          }
        })
      );
      const userItems = items.filter((i) => i.id != -1);
      setOwnedItems(userItems);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    handleFilterClick(currentFilter);
  }, [ownedItems]);

  const handleOwnedItemClick = async (param) => {
    console.log("Click on item");
    console.log(param);
    const selectedItem = ownedItems.find((item) => item.id == param.id);
    setSelectedItem(selectedItem);
    handleDetailsModalOpen();
  };

  const handleFilterClick = async (param) => {
    console.log("Filter clicked: " + param);
    if (param == "all") {
      setFilteredOwnedItems(ownedItems);
    } else {
      const filteredItems = ownedItems.filter(
        (i) => i.type.toLowerCase() == param
      );
      setFilteredOwnedItems(filteredItems);
    }
    setCurrentFilter(param);
  };

  const onPriceChange = async (e) => {
    if (!isNaN(e.target.value)) {
      setPriceValue(e.target.value);
    }
  };

  const handleBuyChestClick = async () => {
    if (parseInt(guardianTokens) < parseInt(chestPrice)) {
      setModalTitle("Not enough money !");
      setModalMesage("Sorry Guardian, you do not have enough money");
      handleModalOpen();
    } else {
      try {
        // Check current allowance
        console.log("Check current allowance");
        const currentAllowance = await guardianTokenContractProvider.allowance(
          userAccount,
          treasureGuardianContractProvider.address
        );

        if (parseInt(currentAllowance) < parseInt(chestPrice)) {
          // If not enough allowance, request to user
          console.log("Not enough allowance, requesting user...");

          const transaction = await guardianTokenContractSigner.approve(
            treasureGuardianContractProvider.address,
            chestPrice
          );
          await transaction.wait();
          console.log("Allowance granted !");
        } else {
          console.log("Enough allowance already granted !");
        }

        console.log("Buying chest ... ");

        // TODO: Improve - Allow to buy several chest
        const transaction = await treasureGuardianContractSigner.buyChest(1);
        await transaction.wait();

        const title = "Congratulations Guardian !";
        const message =
          "You can open the chest to retrieve the equipment inside";
        console.log(message);
        setModalTitle(title);
        setModalMesage(message);
        getChestsCount();
        getOwnedItems();
        getBalanceOfGuardiantToken();
        handleModalOpen();
      } catch (error) {
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
        console.log("Check approval for treasure guardian");
        const isApproved = await guardianStuffContractProvider.isApprovedForAll(
          userAccount,
          treasureGuardianContractProvider.address
        );

        if (!isApproved) {
          console.log("Approve treasure guardian to take back the chest");
          const transaction =
            await guardianStuffContractSigner.setApprovalForAll(
              treasureGuardianContractProvider.address,
              true
            );
          await transaction.wait();
          console.log("Approved");
        } else {
          console.log("Already approved");
        }

        const transaction = await treasureGuardianContractSigner.openChest({
          gasLimit: 500000,
        });
        await transaction.wait();
        getChestsCount();
        getOwnedItems();

        setModalTitle("Congratulations Guardian !");
        setModalMesage("You can find your stuff in your inventory");
        handleModalOpen();
      } catch (error) {
        setModalTitle("Error !");
        setModalMesage("An error occurred while opening your chest");
        handleModalOpen();
        console.log(error.message);
      }
    } else {
      setModalTitle("No Chest !");
      setModalMesage("Sorry Guardian, you do not have any chests");
    }

    handleModalOpen();
    handleFilterClick(currentFilter);
  };

  const handleListItem = async () => {
    if (!priceValue || ethers.utils.parseEther(priceValue).toString() <= 0) {
      setModalTitle("Incorrect price !");
      setModalMesage(
        "Sorry Guardian, you need to specify a correct sell price"
      );
      handleModalOpen();
    } else {
      try {
        console.log("Approve marketplace to manage our items");

        const isApproved = await guardianStuffContractProvider.isApprovedForAll(
          userAccount,
          auctionHouseContractProvider.address
        );

        if (!isApproved) {
          const transaction =
            await guardianStuffContractSigner.setApprovalForAll(
              auctionHouseContractProvider.address,
              true
            );
          await transaction.wait();
          console.log("Approved");
        } else {
          console.log("Already approved");
        }

        console.log("Get marketplace listing fees");
        const listingFees = await auctionHouseContractProvider.listingFee();
        console.log("Listing fees: " + listingFees.toString());

        console.log("Listing item on the marketplace");
        const transaction = await auctionHouseContractSigner.listItem(
          selectedItem.itemID,
          ethers.utils.parseEther(priceValue),
          { value: listingFees }
        );
        await transaction.wait();

        const title = "Congratulations Guardian !";
        const message = "You item is now available in the auction house";

        console.log(message);
        setModalTitle(title);
        setModalMesage(message);
        getChestsCount();
        getBalanceOfGuardiantToken();
        setSelectedItem("");
        getOwnedItems();
        handleModalOpen();
        handleDetailsModalClose();
      } catch (error) {
        setModalTitle("Error !");
        setModalMesage("An error occurred while buying a chest");
        handleModalOpen();

        console.log(error.message);
      }
    }
  };

  return (
    <div className="div-full-screen">
      {isConnected ? (
        <>
          {wrongChain ? (
            <>
              <ChangeChain
                chain={GetExpectedChainNameWithEnv()}
                chainID={GetExpectedChainIdWithEnv()}
              />
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

                    <Stack>
                      <Stack
                        direction="row"
                        textAlign="center"
                        justifyContent="center"
                        marginTop="10px"
                        marginBottom="10px"
                      >
                        <input
                          type="number"
                          className="item-details-input"
                          onChange={onPriceChange}
                        />

                        <img
                          style={{
                            width: "30px",
                            height: "30px",
                            marginLeft: "10px",
                            marginTop: "0px",
                          }}
                          src={GetCoinIconWithEnv()}
                        />
                      </Stack>

                      <Button
                        className="generic-button"
                        onClick={handleListItem}
                        variant="outlined"
                      >
                        Sell
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Modal>

              <Stack
                className="div-full-screen"
                direction="row"
                justifyContent="center"
              >
                {/* INVENTORY ITEMS */}
                <Stack
                  direction="row"
                  height="100%"
                  width="60%"
                  justifyContent="center"
                >
                  {/* Items filters */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      width: 60,
                      height: 60,
                      alignContent: "flex-start",
                      borderRadius: 1,
                    }}
                  >
                    {/* No filter */}
                    <Tooltip title="All items">
                      <Box
                        className={
                          "filter-inventory-box " +
                          (currentFilter === Filters.All
                            ? "filter-inventory-box-selected"
                            : "")
                        }
                      >
                        <Image
                          alt="me"
                          src={allArmorIcon}
                          className="filter-inventory-icon"
                          onClick={() => handleFilterClick(Filters.All)}
                        />
                      </Box>
                    </Tooltip>

                    {/* Head Filter */}
                    <Tooltip title="Head">
                      <Box
                        className={
                          "filter-inventory-box " +
                          (currentFilter === Filters.Head
                            ? "filter-inventory-box-selected"
                            : "")
                        }
                      >
                        <Image
                          alt="me"
                          src={headArmorIcon}
                          className="filter-inventory-icon"
                          onClick={() => handleFilterClick(Filters.Head)}
                        />
                      </Box>
                    </Tooltip>
                    {/* Body Filter */}
                    <Tooltip title="Body">
                      <Box
                        className={
                          "filter-inventory-box " +
                          (currentFilter === Filters.Body
                            ? "filter-inventory-box-selected"
                            : "")
                        }
                      >
                        <Image
                          alt="me"
                          src={bodyArmorIcon}
                          className="filter-inventory-icon"
                          onClick={() => handleFilterClick(Filters.Body)}
                        />
                      </Box>
                    </Tooltip>

                    {/* Hands Filter */}
                    <Tooltip title="Hands">
                      <Box
                        className={
                          "filter-inventory-box " +
                          (currentFilter === Filters.Hands
                            ? "filter-inventory-box-selected"
                            : "")
                        }
                      >
                        <Image
                          alt="me"
                          src={handsArmorIcon}
                          className="filter-inventory-icon"
                          onClick={() => handleFilterClick(Filters.Hands)}
                        />
                      </Box>
                    </Tooltip>

                    {/* Legs Filter */}
                    <Tooltip title="Legs">
                      <Box
                        className={
                          "filter-inventory-box " +
                          (currentFilter === Filters.Legs
                            ? "filter-inventory-box-selected"
                            : "")
                        }
                      >
                        <Image
                          alt="me"
                          src={legsArmorIcon}
                          className="filter-inventory-icon"
                          onClick={() => handleFilterClick(Filters.Legs)}
                        />
                      </Box>
                    </Tooltip>

                    {/* Weapon Right Filter */}
                    <Tooltip title="Weapon right">
                      <Box
                        className={
                          "filter-inventory-box " +
                          (currentFilter === Filters.WeaponRight
                            ? "filter-inventory-box-selected"
                            : "")
                        }
                      >
                        <Image
                          alt="me"
                          src={weaponRightIcon}
                          className="filter-inventory-icon"
                          onClick={() => handleFilterClick(Filters.WeaponRight)}
                        />
                      </Box>
                    </Tooltip>

                    {/* Weapon Left Filter */}
                    <Tooltip title="Weapon left">
                      <Box
                        className={
                          "filter-inventory-box " +
                          (currentFilter === Filters.WeaponLeft
                            ? "filter-inventory-box-selected"
                            : "")
                        }
                      >
                        <Image
                          alt="me"
                          src={weaponLeftIcon}
                          className="filter-inventory-icon"
                          onClick={() => handleFilterClick(Filters.WeaponLeft)}
                        />
                      </Box>
                    </Tooltip>
                  </Box>

                  {/* Owned items */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      height: "100%",
                      width: "100%",
                      alignContent: "flex-start",
                      borderRadius: 1,
                      border: "1px solid rgb(190, 167, 126)",
                      overflow: "auto",
                    }}
                  >
                    {filteredOwnedItems.map((item, index) => {
                      return (
                        <Box
                          key={index}
                          sx={{
                            borderColor: "rgba(190, 167, 126, 0.125)",
                            background:
                              "linear-gradient(135deg, rgba(255, 255, 244, 0) 0%, " +
                              GetColorRarity(item.rarity) +
                              " 100%);",
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              width: "60px",
                              height: "60px",
                            }}
                          >
                            <img
                              onClick={() => handleOwnedItemClick(item)}
                              style={{ position: "absolute" }}
                              src={item.image}
                              width="60px"
                              height="60px"
                            />

                            <Typography
                              variant="subtitle1"
                              style={{
                                position: "absolute",
                                zIndex: "1",
                                right: "5px",
                                bottom: "0",
                              }}
                            >
                              {item.amount.toString()}
                            </Typography>
                          </div>
                        </Box>
                      );
                    })}
                  </Box>
                </Stack>

                {/* CHEST OPEN/BUY */}
                <Stack
                  direction="row"
                  height="100%"
                  width="90%"
                  justifyContent="center"
                >
                  <Stack direction="column" justifyContent="center">
                    <Stack
                      direction="row"
                      justifyContent="center"
                      alignItems="center"
                      marginBottom="20px"
                    >
                      <Typography variant="h5">
                        Chest Price:{" "}
                        {ToFriendlyPrice(chestPrice, guardianTokenDecimals)}
                      </Typography>
                      <Image
                        style={{
                          height: "35%",
                          width: "auto",
                          marginLeft: "5px",
                        }}
                        alt="logo"
                        src={logoWhite}
                      />
                    </Stack>

                    <Stack justifyContent="center" marginLeft="50px">
                      <img
                        style={{ width: "80%", marginBottom: "50px" }}
                        src="https://nodeguardians.io/_next/image?url=%2Fassets%2Fchests%2Fchest.png&w=1800&q=75"
                      />
                    </Stack>

                    <Stack
                      direction="row"
                      height="40px"
                      width="100%"
                      justifyContent="center"
                    >
                      <Button
                        className="generic-button"
                        onClick={handleOpenChestClick}
                        variant="outlined"
                        style={{ marginRight: "20px" }}
                      >
                        Open Chest
                      </Button>

                      <Button
                        className="generic-button"
                        onClick={handleBuyChestClick}
                        variant="outlined"
                      >
                        Buy Chest
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>

                {/* WALLET INFORMATIONS */}
                <Stack
                  direction="column"
                  height="100%"
                  width="20%"
                  paddingTop="50px"
                >
                  <Stack direction="row" justifyContent="end" marginRight="30%">
                    <Typography variant="h5" marginRight="5px">
                      {ToFriendlyPrice(guardianTokens, guardianTokenDecimals)}
                    </Typography>
                    <Image
                      style={{
                        height: "auto",
                        width: "30px",
                      }}
                      alt="logo"
                      src={logoWhite}
                    />
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="end"
                    marginTop="25px"
                    marginRight="25%"
                  >
                    <Typography variant="h5" marginRight="7px">
                      {chestItemCount.toString()}
                    </Typography>
                    <img
                      style={{ width: "40px" }}
                      src="https://nodeguardians.io/_next/image?url=%2Fassets%2Fchests%2Fchest.png&w=1800&q=75"
                    />
                  </Stack>
                </Stack>
              </Stack>
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

export default Inventory;
