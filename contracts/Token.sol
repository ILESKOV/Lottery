//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// TODO: Implement IERC20.sol interface and make the token mintable
contract LOTcoin is ERC20 {
  constructor() ERC20("Lottery Coin", "LOT") {
    _mint(msg.sender, 5000);
  }
}

