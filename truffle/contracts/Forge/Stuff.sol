// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Stuff is ERC1155, Ownable {
    uint256 private constant HEAD = 10;
    uint256 private constant BODY = 20;
    uint256 private constant WEAPONRIGHT = 30;
    uint256 private constant WEAPONLEFT = 40;
    uint256 private constant HANDS = 50;
    uint256 private constant LOWER = 60;

    constructor()
        ERC1155(
            "https://gateway.pinata.cloud/ipfs/QmWHoeyafsznQ6QKqWvUUZ4scivKh8j4y4PMryk2w8nN4r/{id}/json"
        )
    {}

    function forgeStuff(address itemOwner) external onlyOwner {
        _mint(itemOwner, 10, 10 ** 2, "");
        _mint(itemOwner, 20, 5, "");
    }
}
