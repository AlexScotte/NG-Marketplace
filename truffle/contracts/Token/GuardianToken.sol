// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GuardianToken is ERC20 {
    constructor() ERC20("GUARDIAN", "GURD") {
        _mint(msg.sender, (10 ** 9) * (10 ** 18));
    }
}
