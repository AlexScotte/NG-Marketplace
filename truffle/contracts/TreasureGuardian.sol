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
    ForgeMaster public factory;
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

    event onStuffTransferedTo(address to, uint256[] ids);

    constructor() {
        guardianToken = new GuardianToken();
        factory = new ForgeMaster();
    }

    function createCollection() external onlyOwner {
        address collectionAddress = factory.createCollection(
            "Node Guardians genesis collection"
        );
        factory.forgeCollection();
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

    function rewardGuardianWithToken(
        address guardianAddress,
        uint256 amount
    ) external onlyOwner {
        require(
            guardianToken.balanceOf(address(this)) > amount,
            "Sorry Guardian, the tresure is empty :'( "
        );

        guardianToken.transfer(guardianAddress, amount);
    }

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

    function openChest() external returns (uint256[] memory ids) {
        uint8 chestItemID = guardianStuff.chestItemID();

        require(
            guardianStuff.balanceOf(msg.sender, chestItemID) > 0,
            "Sorry Guardian, you do not have any chest in your inventory."
        );
        uint256[] memory itemIDs = new uint256[](_itemPerChest);
        // TODO: Check balance of every item if there is still supply
        // try to regroup by id to use the amount paramater in safeTransferFrom
        for (uint i = 0; i < _itemPerChest; i++) {
            uint256 itemID = _generateItemID();
            itemIDs[i] = itemID;
            guardianStuff.safeTransferFrom(
                address(this), // from
                msg.sender, // to
                itemID,
                1,
                ""
            );
        }

        // Burn chest
        // guardianStuff.safeTransferFrom(
        //     msg.sender,
        //     address(0),
        //     chestItemID,
        //     1,
        //     ""
        // );

        emit onStuffTransferedTo(msg.sender, itemIDs);

        return itemIDs;
    }

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
            rarity = 2;
        } else if (
            random >= (_dropRateCommon + _dropRateUncommon) &&
            random < (_dropRateCommon + _dropRateUncommon + _dropRateRare)
        ) {
            rarity = 3;
        } else if (
            random >= (_dropRateCommon + _dropRateUncommon + _dropRateRare) &&
            random <
            (_dropRateCommon +
                _dropRateUncommon +
                _dropRateRare +
                _dropRateEpic)
        ) {
            rarity = 4;
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
            rarity = 5;
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
        if (class == 1) {
            random = _random();
            if (random >= 50) {
                set = 2;
            }
        }

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

    /// improve: use chain link
    function _random() private returns (uint256) {
        _nonce++;
        return
            uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, _nonce))
            ) % 100;
    }
}
