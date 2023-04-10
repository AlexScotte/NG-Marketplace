// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

import "./GuardianStuff.sol";

contract ForgeMaster is Ownable, ERC1155Holder {
    string public collectionName;
    address public collectionAddress;

    /**
     * @notice Allow to create a new collection
     * @param newCollectionName: Name of the new collection
     */
    function createCollection(
        string memory newCollectionName
    ) external returns (address newCollectionAddress) {
        // Import the bytecode of the contract to deploy
        bytes memory collectionBytecode = type(GuardianStuff).creationCode;
        // Make a random salt based on the artist name
        bytes32 salt = keccak256(abi.encodePacked(newCollectionName));

        assembly {
            newCollectionAddress := create2(
                0,
                add(collectionBytecode, 0x20),
                mload(collectionBytecode),
                salt
            )
            if iszero(extcodesize(newCollectionAddress)) {
                // revert if something gone wrong (collectionAddress doesn't contain an address)
                revert(0, 0)
            }
        }

        collectionName = newCollectionName;
        collectionAddress = newCollectionAddress;
        return (newCollectionAddress);
    }

    /**
     * @notice Allow the owner to trigger the generation of all the ERC115 tokens
     */
    function forgeCollection() external onlyOwner {
        GuardianStuff guardianStuff = GuardianStuff(collectionAddress);
        guardianStuff.forgeStuff(msg.sender);
        guardianStuff.forgeChests(msg.sender);
    }
}
