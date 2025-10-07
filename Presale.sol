// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract GumbuoPresale {
    address payable public treasury = payable(0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b);
    address public owner = msg.sender;
    IERC20 public gmbToken;
    uint256 public rate = 100_000_000;

    event Buy(address indexed buyer, uint256 ethAmount, uint256 gmbAmount);

    constructor(address _tokenAddress) {
        gmbToken = IERC20(_tokenAddress);
    }

    function buy() external payable {
        require(msg.value > 0, "No ETH sent");
        uint256 gmbAmount = msg.value * rate;
        require(gmbToken.transferFrom(treasury, msg.sender, gmbAmount), "GMB transfer failed");
        treasury.transfer(msg.value);
        emit Buy(msg.sender, msg.value, gmbAmount);
    }

    function withdraw() external {
        require(msg.sender == owner, "Not authorized");
        treasury.transfer(address(this).balance);
    }
}
