// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract GuardianToken is ERC20, Ownable {
    uint256 supply = (10 ** 9) * (10 ** 18);

    constructor() ERC20("GUARDIAN", "GURD") {}

    function mint(address addr) external onlyOwner {
        _mint(addr, supply);
    }
}
