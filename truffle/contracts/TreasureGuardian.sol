// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import "./Forge/ForgeMaster.sol";
import "./Forge/Stuff.sol";

contract TreasureGuardian is Ownable, ERC1155Holder {
    ForgeMaster public factory;
    Stuff public stuff;

    constructor() {
        factory = new ForgeMaster();
        address collectionAddress = factory.forgeCollection(
            "Node Guardians genesis collection"
        );
        stuff = Stuff(collectionAddress);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint id,
        uint amount,
        bytes memory data
    ) external onlyOwner {
        stuff.safeTransferFrom(from, to, id, amount, data);
    }

    function setApprovalForAll(
        address addressToApprove,
        bool approved
    ) external onlyOwner {
        stuff.setApprovalForAll(addressToApprove, approved);
    }
}
