// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract GuardianStuff is ERC1155, Ownable {
    uint256[] private _itemIDs;
    uint8 public chestItemID = 0;

    constructor()
        ERC1155(
            "https://ipfs.io/ipfs/QmY5EtD5MkAf7E3KX5EcD8GWJSFEte8ZoWviHAJezMgQ6H/{id}.json"
        )
    {}

    function forgeStuff(address itemOwner) external {
        uint setCount = 1;
        uint256 supply;

        // Class: knight, mage, rogue
        // Use only the class 1 for now because I do not upload all the other files
        for (uint class = 1; class <= 1; class++) {
            // There is 2 sets of armor for the knight class
            // if (class == 0) {
            //     setCount = 2;
            // }

            // Armor set
            for (uint set = 1; set <= setCount; set++) {
                // Armor parts: head, body, legs, hands, weapon right, weapon left
                for (uint part = 1; part < 7; part++) {
                    // Item rarity: Common, uncommon, rare, epic, legendary
                    for (uint rarity = 0; rarity < 5; rarity++) {
                        uint itemID = (class * 1000) +
                            (set * 100) +
                            (part * 10) +
                            (rarity);

                        if (rarity == 0) {
                            supply = 10 ** 6;
                        } else if (rarity == 1) {
                            supply = 10 ** 5;
                        } else if (rarity == 2) {
                            supply = 10 ** 4;
                        } else if (rarity == 3) {
                            supply = 10 ** 3;
                        } else if (rarity == 4) {
                            supply = 10 ** 2;
                        }

                        _mint(itemOwner, itemID, supply, "");
                        _itemIDs.push(itemID);
                    }
                }
            }
        }
    }

    function forgeChests(address itemOwner) external {
        // Chests - TODO: calculate in function of the item supply and the number of item in a chest
        _mint(itemOwner, chestItemID, 10 ** 12, "");
    }

    function getItemIDs() external view returns (uint256[] memory itemIDs) {
        return _itemIDs;
    }
}
