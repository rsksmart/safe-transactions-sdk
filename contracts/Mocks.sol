pragma solidity >=0.5.0 <0.7.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721Full.sol';
import '@openzeppelin/contracts/drafts/Counters.sol';

contract MockERC20Token is ERC20 {
    string public name = 'MockERC20';
    string public symbol = 'MCK_20';
    uint8 public decimals = 0;
    uint256 public INITIAL_SUPPLY = 1000000000000000000000000000;

    constructor() public {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}

contract MockERC721Token is ERC721Full {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() public ERC721Full('MockERC721', 'MCK_721') {}

    function create() public returns (uint256) {
        createAndAssign(msg.sender);
    }

    function createAndAssign(address owner) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(owner, newItemId);

        return newItemId;
    }
}
