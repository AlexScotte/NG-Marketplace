import React, { useEffect, useState } from "react";
import Web3 from "web3";
import useEth from '../../contexts/EthContext/useEth';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import NotConnected from "../../components/NotConnected";
import { ChainID } from "../../Utils/utils";
import ChangeChain from "../../components/ChangeChain";


import BigNumber from 'bignumber.js';

const Quests = () => {

    const QuestReward = 1500;
    const [open, setOpen] = useState(false);
    const [wrongChain, setWrongChain] = useState(true);
    const [modalMesage, setModalMesage] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const handleModalOpen = () => setOpen(true);
    const handleModalClose = () => setOpen(false);
    const {
        state: { userConnected, currentChainID, currentAccount },
    } = useEth();

    useEffect(() => {

        console.log("Loading page auction house");

        if (userConnected) {
            setWrongChain(currentChainID != ChainID.Goerli);
        }

    }, [userConnected, currentAccount, currentChainID]);


    const handleClick = async () => {

        try {
            const treasureGuardianArtifact = require("../../contracts/TreasureGuardian.json");
            const guardianTokenArtifact = require("../../contracts/GuardianToken.json");


            // Create Local RPC
            // const web3 = new Web3("ws://localhost:8545");
            // Create Mumbai RPC
            const web3 = new Web3("https://rpc.ankr.com/polygon_mumbai");
            const networkID = await web3.eth.net.getId();

            // Get wallet of the Node Guardian admin
            const signer = web3.eth.accounts.privateKeyToAccount(process.env.REACT_APP_PRIVATE_KEY);
            console.log("Admin Node Guardian address: " + signer.address);
            web3.eth.accounts.wallet.add(signer);

            // Tresure guardian contract
            const treasureGuardianAddress = treasureGuardianArtifact.networks[networkID].address;
            const treasureGuardianContract = new web3.eth.Contract(treasureGuardianArtifact.abi, treasureGuardianAddress);

            // Guardian token contract
            const guardianTokenAddress = await treasureGuardianContract.methods.guardianToken().call();
            const guardianTokenContract = new web3.eth.Contract(guardianTokenArtifact.abi, guardianTokenAddress);
            const guardianTokenDecimals = await guardianTokenContract.methods.decimals().call();
            console.log("Guardian Token address: " + guardianTokenAddress);

            const questRewardWei = new BigNumber((QuestReward * (10 ** guardianTokenDecimals)));
            await treasureGuardianContract.methods.rewardGuardianWithToken(currentAccount, questRewardWei).call({ from: signer.address });
            await treasureGuardianContract.methods.rewardGuardianWithToken(currentAccount, questRewardWei).send({ from: signer.address, gas: 10000000 });

            setModalTitle("Congratulations !");
            setModalMesage("Your rewards have been sent to your wallet");
            console.log("Reward sent on Mumbai with success")
            handleModalOpen();
        } catch (err) {

            setModalTitle("Error !");
            setModalMesage("An error occurred while transferring your reward");
            console.error(err.message);
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


    const buttonStyle = {
        border: '1px solid rgb(109, 98, 76)',
        color: 'rgb(241, 242, 242)',
        backgroundColor: 'rgb(29, 28, 26)',
        cursor: 'pointer',
        borderRadius: '5px',
        fontFamily: 'Cinzel, serif',
        fontWeight: '900',
        '&:hover': {
            backgroundColor: 'rgb(39, 36, 32)',
            color: 'rgb(190, 167, 125)',
            borderColor: 'rgb(190, 167, 125)'
        }
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

            {
                userConnected ? (

                    <>
                        {
                            wrongChain ?
                                (
                                    <>
                                        <ChangeChain chain="Goerli" />
                                    </>
                                ) : (
                                    <>
                                        <Modal
                                            open={open}
                                            onClose={handleModalClose}>

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

                                        </Modal>

                                        <Button className="modal-submit" onClick={handleClick} variant="outlined"
                                            sx={buttonStyle}>
                                            Quests
                                        </Button>

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

export default Quests