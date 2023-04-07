// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract GuardianStuff is ERC1155, Ownable {
    uint256[] private _itemIDs;

    constructor()
        ERC1155(
            "https://ipfs.io/ipfs/QmZWjLS4zDjZ6C64ZeSKHktcd1jRuqnQPx2gj7AqjFSU2d/{id}.json"
        )
    {}

    function forgeStuff(address itemOwner) external {
        uint setCount = 1;
        uint256 supply;

        // Knight, mage, rogue
        for (uint class = 1; class <= 4; class++) {
            // There is 2 set of armor for the knight class
            if (class == 0) {
                setCount = 2;
            }

            for (uint set = 1; set <= setCount; set++) {
                // Head, body, legs, hands, weapon right, weapon left
                for (uint part = 0; part < 7; part++) {
                    // Common, uncommon, rare, epic, legendary
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

    function getTokenIDs() external view returns (uint256[] memory tokenId) {
        return _itemIDs;
    }
}
