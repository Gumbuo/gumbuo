// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract GumbuoPresale {
    address public owner;
    address public treasury;
    IERC20 public gmbToken;
    uint256 public gmbPerEth = 100_000_000 * 1e18; // 100M GMB per ETH
    uint256 public totalSold;
    uint256 public presaleCap = 350_000_000 * 1e18;
    bool public initialized;

    event Purchase(address indexed buyer, uint256 ethAmount, uint256 gmbAmount);

    constructor() {
        owner = msg.sender;
    }

    function initialize(address _token, address _treasury) external {
        require(msg.sender == owner, "Not authorized");
        require(!initialized, "Already initialized");
        gmbToken = IERC20(_token);
        treasury = _treasury;
        initialized = true;
    }

    receive() external payable {
        buy();
    }

    function buy() public payable {
        require(initialized, "Not initialized");
        require(msg.value > 0, "Send ETH to buy GMB");
        uint256 gmbAmount = (msg.value * gmbPerEth) / 1 ether;
        require(totalSold + gmbAmount <= presaleCap, "Presale sold out");
        totalSold += gmbAmount;
        require(gmbToken.transfer(msg.sender, gmbAmount), "GMB transfer failed");
        payable(treasury).transfer(msg.value);
        emit Purchase(msg.sender, msg.value, gmbAmount);
    }

    function setRate(uint256 newRate) external {
        require(msg.sender == owner, "Not authorized");
        gmbPerEth = newRate;
    }

    function withdraw() external {
        require(msg.sender == owner, "Not authorized");
        payable(owner).transfer(address(this).balance);
    }

    function rescueTokens(address token, address to, uint256 amount) external {
        require(msg.sender == owner, "Not authorized");
        IERC20(token).transfer(to, amount);
    }
}
