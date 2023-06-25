import React, { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import NotConnected from "../../components/NotConnected";
import { ChainID, GetExpectedChainIdWithEnv } from "../../Utils/utils";
import ChangeChain from "../../components/ChangeChain";
import Stack from "@mui/material/Stack";
import Image from "next/image";
import Quest1 from "../../assets/DiamondQuest1.png";
import Quest2 from "../../assets/DiamondQuest2.png";
import { useAccount, useNetwork } from "wagmi";
import { ethers } from "ethers";
import { Typography } from "@mui/material";
import { useSwitchNetwork } from "wagmi";

const Quests = () => {
  const QuestReward = 1500;
  const [open, setOpen] = useState(false);
  const [wrongChain, setWrongChain] = useState(true);
  const [modalMesage, setModalMesage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    console.log("Loading page auction house");

    if (isConnected) {
      setWrongChain(chain?.id != ChainID.Goerli);
      switchNetwork?.(ChainID.Goerli);
    }
  }, [isConnected, chain]);

  const handleClick = async () => {
    try {
      const treasureGuardianArtifact = require("../../contracts/TreasureGuardian.json");
      const guardianTokenArtifact = require("../../contracts/GuardianToken.json");

      let provider;
      console.log("Current environment: " + process.env.NODE_ENV);
      if (process.env.NODE_ENV === "production") {
        // Create Mumbai RPC
        provider = new ethers.providers.JsonRpcProvider(
          "https://rpc.ankr.com/polygon_mumbai"
        );
      } else {
        // Create Local RPC
        provider = new ethers.providers.JsonRpcProvider();
      }

      console.log("provider created !");

      // Get wallet of the Node Guardian admin
      const signer = new ethers.Wallet(
        process.env.NEXT_PUBLIC_PRIVATE_KEY,
        provider
      );

      console.log("Admin Node Guardian address: " + signer.address);

      // Tresure guardian contract
      const chainID = GetExpectedChainIdWithEnv();
      console.log("Current chainID:" + chainID);
      const treasureGuardianAddress =
        treasureGuardianArtifact.networks[chainID].address;
      console.log("Treasure guardian address:" + treasureGuardianAddress);
      const treasureGuardianContract = new ethers.Contract(
        treasureGuardianAddress,
        treasureGuardianArtifact.abi,
        provider
      );

      // Guardian token contract
      const guardianTokenAddress =
        await treasureGuardianContract.guardianToken();
      const guardianTokenContract = new ethers.Contract(
        guardianTokenAddress,
        guardianTokenArtifact.abi,
        provider
      );

      const guardianTokenDecimals = await guardianTokenContract.decimals();
      console.log("Guardian Token address: " + guardianTokenAddress);

      const treasureGuardianSigner = new ethers.Contract(
        treasureGuardianAddress,
        treasureGuardianArtifact.abi,
        signer
      );

      const transaction = await treasureGuardianSigner.rewardGuardianWithToken(
        address,
        ethers.utils.parseUnits(`${QuestReward}`, guardianTokenDecimals),
        { from: signer.address }
      );
      await transaction.wait();

      setModalTitle("Congratulations !");
      setModalMesage("Your rewards have been sent to your wallet.");
      console.log("Reward sent on Mumbai with success");
      handleModalOpen();
    } catch (err) {
      setModalTitle("Error !");
      setModalMesage("An error occurred while transferring your reward.");
      console.error(err.message);
    }
  };

  return (
    <div className="div-full-screen">
      {isConnected ? (
        <>
          {wrongChain ? (
            <>
              <ChangeChain chain="Goerli" chainID={ChainID.Goerli} />
            </>
          ) : (
            <>
              <Modal open={open} onClose={handleModalClose}>
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
              </Modal>

              <Stack direction="row" justifyContent="center">
                <Image
                  src={Quest1}
                  alt="me"
                  style={{ height: "calc(100vh - 80px)", width: "auto" }}
                />
                <Image
                  src={Quest2}
                  alt="me"
                  style={{ height: "15vh", width: "auto", marginTop: "0px" }}
                />
                <Button
                  onClick={handleClick}
                  variant="outlined"
                  className="generic-button"
                  style={{
                    position: "absolute",
                    marginRight: "-75vh",
                    marginTop: "20vh",
                  }}
                >
                  Validate Quest
                </Button>
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

export default Quests;
