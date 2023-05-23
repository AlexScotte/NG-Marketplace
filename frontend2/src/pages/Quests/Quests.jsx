import React, { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import NotConnected from "../../components/NotConnected";
import { ChainID } from "../../Utils/utils";
import ChangeChain from "../../components/ChangeChain";
import Stack from "@mui/material/Stack";
import Quest1 from "../../assets/DiamondQuest1.png";
import Quest2 from "../../assets/DiamondQuest2.png";
import { useAccount, useNetwork } from "wagmi";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";

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
      setModalMesage("Your rewards have been sent to your wallet");
      console.log("Reward sent on Mumbai with success");
      handleModalOpen();
    } catch (err) {
      setModalTitle("Error !");
      setModalMesage("An error occurred while transferring your reward");
      console.error(err.message);
    }
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "rgb(29, 28, 26)",
    border: "1px solid rgb(159, 140, 108)",
    boxShadow: 24,
    borderRadius: "2px",
    height: "10%",
    p: 2,
  };

  const buttonStyle = {
    border: "1px solid rgb(109, 98, 76)",
    color: "rgb(241, 242, 242)",
    backgroundColor: "rgb(29, 28, 26)",
    cursor: "pointer",
    borderRadius: "5px",
    fontFamily: "Cinzel, serif",
    fontWeight: "900",
    "&:hover": {
      backgroundColor: "rgb(39, 36, 32)",
      color: "rgb(190, 167, 125)",
      borderColor: "rgb(190, 167, 125)",
    },
  };
  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        display: "grid",
        gridTemplateColumns: "repeat(1, 100%)",
        gridGap: "15px",
        padding: "10px",
        position: "relative",
        boxSizing: "border-box",
        // , maxWidth: "1000px", margin: "20px, auto"
      }}
    >
      {isConnected ? (
        <>
          {wrongChain ? (
            <>
              <ChangeChain chain="Goerli" />
            </>
          ) : (
            <>
              <Modal open={open} onClose={handleModalClose}>
                <Box sx={style} className="modal-main-content">
                  <label className="modal-information-title generic-text-font1-uppercase generic-text-color">
                    {modalTitle}
                  </label>
                  <label
                    className="modal-information-text generic-text-font generic-text-color"
                    style={{ marginTop: "10px" }}
                  >
                    {modalMesage}
                  </label>

                  <Button
                    className="modal-submit"
                    onClick={handleModalClose}
                    variant="outlined"
                    sx={buttonStyle}
                  >
                    Close
                  </Button>
                </Box>
              </Modal>

              <Stack direction="colum" justifyContent="center">
                <div>
                  <img src={Quest1} style={{ height: "490px" }} />
                </div>
                <div>
                  <img
                    src={Quest2}
                    style={{ height: "90px", marginTop: "9px" }}
                  />
                </div>
                <Button
                  onClick={handleClick}
                  variant="outlined"
                  sx={buttonStyle}
                  style={{
                    position: "absolute",
                    marginRight: "-377px",
                    marginTop: "110px",
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
