// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import "./Forge/ForgeMaster.sol";
import "./Forge/GuardianStuff.sol";
import "./Token/GuardianToken.sol";

contract TreasureGuardian is Ownable, ERC1155Holder {
    GuardianStuff public guardianStuff;
    GuardianToken public guardianToken;

    uint256 public chestPrice = 25 ether;
    uint256 private _nonce;

    uint8 private _itemPerChest = 5;
    uint8 private _dropRateCommon = 60;
    uint8 private _dropRateUncommon = 25;
    uint8 private _dropRateRare = 10;
    uint8 private _dropRateEpic = 4;
    uint8 private _dropRateLegendary = 1;

    /**
     * @notice Event emit when the item is transfered to the marketplace
     */
    event onStuffTransferedTo(address to, uint256[] ids, uint256[] missingIds);

    constructor() {}

    /**
     * @notice Initialize the treasure guardian contract with addresses tokens
     * @param guardianTokenAddr: Deployed ERC20 token address
     * @param guardianStuffAddr: Deployed ERC1155 token address
     **/
    function initialize(
        address guardianTokenAddr,
        address guardianStuffAddr
    ) external onlyOwner {
        guardianToken = GuardianToken(guardianTokenAddr);
        guardianStuff = GuardianStuff(guardianStuffAddr);
    }

    /**
     * @notice Allow the owner of the treasure to tranfer a specific item
     * It was usefull to test
     * @param from: Address which send the item
     * @param to: Address of the new owner
     * @param id: id of the ERC1155 token
     * @param amount: Number of ERC1155 transfered
     */
    function safeTransferFrom(
        address from,
        address to,
        uint id,
        uint amount,
        bytes memory data
    ) external onlyOwner {
        guardianStuff.safeTransferFrom(from, to, id, amount, data);
    }

    /**
     * @notice Allow the owner to send ERC20 token
     * @param guardianAddress: Address which receive the token
     * @param amount: Number of ERC20 transfered
     */
    function rewardGuardianWithToken(
        address guardianAddress,
        uint256 amount
    ) external onlyOwner {
        require(
            guardianToken.balanceOf(address(this)) > amount,
            "Sorry Guardian, there is no more money in the treasure"
        );

        guardianToken.transfer(guardianAddress, amount);
    }

    /**
     * @notice Allow a user to buy a chest item (ERC1155)
     * @param amount: amount of ERC20 token sent to exchange with the chest
     */
    function buyChest(uint amount) external {
        uint8 chestItemID = guardianStuff.chestItemID();

        require(
            guardianStuff.balanceOf(address(this), chestItemID) > amount,
            "Sorry Guardian, there are not enough chests left."
        );
        require(
            guardianToken.balanceOf(msg.sender) > chestPrice * amount,
            "Sorry Guardian, you do not have enough money."
        );

        guardianToken.transferFrom(
            msg.sender,
            address(this),
            chestPrice * amount
        );

        guardianStuff.safeTransferFrom(
            address(this),
            msg.sender,
            chestItemID,
            amount,
            ""
        );
    }

    /**
     * @notice Allow owner to modify the drop rate of the ERC115 item
     * Sum must be egal to 100
     */
    function modifyDropRate(
        uint8 dropRateCommon,
        uint8 dropRateUncommon,
        uint8 dropRateRare,
        uint8 dropRateEpic,
        uint8 dropRateLegendary
    ) external onlyOwner {
        require(
            (dropRateCommon +
                dropRateUncommon +
                dropRateRare +
                dropRateEpic +
                dropRateLegendary) == 100,
            "Sum of the drop rate must be egal to 100"
        );

        _dropRateCommon = dropRateCommon;
        _dropRateUncommon = dropRateUncommon;
        _dropRateRare = dropRateRare;
        _dropRateEpic = dropRateEpic;
        _dropRateLegendary = dropRateLegendary;
    }

    /**
     * @notice Allow a user to open a chest and get ERC1155 in exchange
     * Rarity and type of the item sent are random in function of the drop rate
     * return List of generated IDs
     */
    function openChest() external returns (uint256[] memory ids) {
        uint8 chestItemID = guardianStuff.chestItemID();

        require(
            guardianStuff.balanceOf(msg.sender, chestItemID) > 0,
            "Sorry Guardian, you do not have any chest in your inventory."
        );
        uint256[] memory itemIDs = new uint256[](_itemPerChest);
        uint256[] memory missingItemIDs = new uint256[](_itemPerChest);

        // TODO: try to regroup by id to use the amount paramater in safeTransferFrom
        for (uint i = 0; i < _itemPerChest; i++) {
            uint256 itemID = _generateItemID();

            uint256 stuffItemCount = guardianStuff.balanceOf(
                address(this),
                itemID
            );
            if (stuffItemCount > 0) {
                itemIDs[i] = itemID;

                guardianStuff.safeTransferFrom(
                    address(this), // from
                    msg.sender, // to
                    itemID,
                    1,
                    ""
                );
            } else {
                // TODO: Manage the case when the treasure guardian does not have stuff anymore
                missingItemIDs[i] = itemID;
                continue;
            }
        }

        // Give the chest back to treasure
        guardianStuff.safeTransferFrom(
            msg.sender,
            address(this),
            chestItemID,
            1,
            ""
        );

        emit onStuffTransferedTo(msg.sender, itemIDs, missingItemIDs);

        return itemIDs;
    }

    /**
     * @notice Allow to generate an item ID to know which ERC1155 to send
     * All number of the item is generated with a random number
     * The drop rate determine which number to select
     */
    function _generateItemID() private returns (uint256) {
        // Get the rarity random number in function fo the drop rate
        uint256 random = _random();
        uint8 rarity;
        if (random < _dropRateCommon) {
            rarity = 0;
        } else if (
            random >= _dropRateCommon &&
            random < (_dropRateCommon + _dropRateUncommon)
        ) {
            rarity = 1;
        } else if (
            random >= (_dropRateCommon + _dropRateUncommon) &&
            random < (_dropRateCommon + _dropRateUncommon + _dropRateRare)
        ) {
            rarity = 2;
        } else if (
            random >= (_dropRateCommon + _dropRateUncommon + _dropRateRare) &&
            random <
            (_dropRateCommon +
                _dropRateUncommon +
                _dropRateRare +
                _dropRateEpic)
        ) {
            rarity = 3;
        } else if (
            random >=
            (_dropRateCommon +
                _dropRateUncommon +
                _dropRateRare +
                _dropRateEpic) &&
            random <
            (_dropRateCommon +
                _dropRateUncommon +
                _dropRateRare +
                _dropRateLegendary)
        ) {
            rarity = 4;
        }

        random = _random();
        uint8 class = 1;
        if (random < 33) {
            class = 1;
        } else if (random >= 33 && random < 66) {
            class = 2;
        } else if (random >= 66) {
            class = 3;
        }

        uint8 set = 1;
        // Use only the set 1 for now because I do not upload all the other files

        // if (class == 1) {
        //     random = _random();
        //     if (random >= 50) {
        //         set = 2;
        //     }
        // }

        uint8 part = 1;
        random = _random();
        if (random < 17) {
            part = 1;
        } else if (random >= 17 && random < 34) {
            part = 2;
        } else if (random >= 34 && random < 51) {
            part = 3;
        } else if (random >= 51 && random < 68) {
            part = 4;
        } else if (random >= 68 && random < 84) {
            part = 5;
        } else if (random >= 84) {
            part = 6;
        }

        uint itemID = (class * 1000) + (set * 100) + (part * 10) + (rarity);
        return itemID;
    }

    /**
     * @notice Allow to generate a number between 0 and 99
     * return the generated random number
     * Improvment: Use chainlink for more security
     *
     */
    function _random() private returns (uint256) {
        _nonce++;
        return
            uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, _nonce))
            ) % 100;
    }
}
