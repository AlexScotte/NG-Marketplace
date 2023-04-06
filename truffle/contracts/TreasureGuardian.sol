// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import "./Forge/ForgeMaster.sol";
import "./Forge/GuardianStuff.sol";

contract TreasureGuardian is Ownable, ERC1155Holder {
    ForgeMaster public factory;
    GuardianStuff public guardianStuff;

    constructor() {
        factory = new ForgeMaster();
        address collectionAddress = factory.forgeCollection(
            "Node Guardians genesis collection"
        );
        guardianStuff = GuardianStuff(collectionAddress);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint id,
        uint amount,
        bytes memory data
    ) external onlyOwner {
        guardianStuff.safeTransferFrom(from, to, id, amount, data);
    }
}
