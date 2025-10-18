// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import \"@openzeppelin/contracts/token/ERC20/ERC20.sol\";
import \"@openzeppelin/contracts/access/Ownable.sol\";

interface IGMB {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract AlienPoints is ERC20, Ownable {
    IGMB public gmbToken;
    address public burnAddress;

    constructor(address _gmbToken, address _burnAddress) ERC20(\"Alien Points\", \"AP\") {
        gmbToken = IGMB(_gmbToken);
        burnAddress = _burnAddress;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, \"Zero deposit\");
        require(gmbToken.transferFrom(msg.sender, address(this), amount), \"GMB transfer failed\");
        _mint(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, \"Insufficient AP\");
        _burn(msg.sender, amount);

        uint256 burnAmount = (amount * 5) / 100;
        uint256 payout = amount - burnAmount;

        require(gmbToken.transfer(burnAddress, burnAmount), \"Burn failed\");
        require(gmbToken.transfer(msg.sender, payout), \"GMB payout failed\");
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        require(from == address(0) || to == address(0), \"Alien Points are non-transferable\");
        super._beforeTokenTransfer(from, to, amount);
    }
}
