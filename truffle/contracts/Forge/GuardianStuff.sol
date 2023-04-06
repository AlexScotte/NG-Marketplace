// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract GuardianStuff is ERC1155, Ownable {
    uint256 private constant HEAD = 10;
    uint256 private constant BODY = 20;
    uint256 private constant WEAPONRIGHT = 30;
    uint256 private constant WEAPONLEFT = 40;
    uint256 private constant HANDS = 50;
    uint256 private constant LOWER = 60;

    uint256[6] public tokenIds = [
        HEAD,
        BODY,
        WEAPONRIGHT,
        WEAPONLEFT,
        HANDS,
        LOWER
    ];

    // // Mapping from address to token ID and amount
    // mapping(address => mapping(uint256 => uint256)) public balanceByAddress;

    constructor()
        ERC1155(
            "https://ipfs.io/ipfs/QmWHoeyafsznQ6QKqWvUUZ4scivKh8j4y4PMryk2w8nN4r/{id}.json"
        )
    {}

    function forgeStuff(address itemOwner) external onlyOwner {
        _mint(itemOwner, 10, 10 ** 2, "");
        _mint(itemOwner, 20, 5, "");
    }

    function getTokenIDs() external view returns (uint256[6] memory tokenId) {
        return tokenIds;
    }
}
