import React, { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import NotConnected from "../../components/NotConnected";
import { ChainID } from "../../Utils/utils";
import ChangeChain from "../../components/ChangeChain";
import Stack from "@mui/material/Stack";
import Image from "next/image";
import Quest1 from "../../assets/DiamondQuest1.png";
import Quest2 from "../../assets/DiamondQuest2.png";
import { useAccount, useNetwork } from "wagmi";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { Typography } from "@mui/material";

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

  useEffect(() => {
    console.log("Loading page auction house");

    if (isConnected) {
      setWrongChain(chain?.id != ChainID.HardhatLocal);
    }
  }, [isConnected]);

  const handleClick = async () => {
    try {
      const treasureGuardianArtifact = require("../../contracts/TreasureGuardian.json");
      const guardianTokenArtifact = require("../../contracts/GuardianToken.json");

      // Create Local RPC
      const provider = new ethers.providers.JsonRpcProvider();

      // Create Mumbai RPC
      // const web3 = new Web3("https://rpc.ankr.com/polygon_mumbai");

      // Get wallet of the Node Guardian admin
      console.log(process.env.NEXT_PUBLIC_PRIVATE_KEY);
      const signer = new ethers.Wallet(
        process.env.NEXT_PUBLIC_PRIVATE_KEY,
        provider
      );

      console.log("Admin Node Guardian address: " + signer.address);

      // Tresure guardian contract
      const treasureGuardianAddress =
        treasureGuardianArtifact.networks[chain?.id].address;
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
      // .send({ from: signer.address, gas: 10000000 });
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
              <ChangeChain chain="Goerli" />
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
