pragma solidity >=0.5.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MockERC20Token is ERC20 {
    string public name = "MockERC20";
    string public symbol = "MCK";
    uint8 public decimals = 0;
    uint256 public INITIAL_SUPPLY = 1000000000000000000000000000;

    constructor() public {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}