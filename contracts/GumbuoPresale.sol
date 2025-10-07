pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract GumbuoPresale {
    address public owner;
    address public treasury;
    IERC20 public gmbToken;
    uint256 public gmbPerEth = 81818181818181818181; // 81.8M GMB per ETH (18 decimals)

    event Purchase(address indexed buyer, uint256 ethAmount, uint256 gmbAmount);

    constructor(address _token, address _treasury) {
        owner = msg.sender;
        gmbToken = IERC20(_token);
        treasury = _treasury;
    }

    receive() external payable {
        buy();
    }

    function buy() public payable {
        require(msg.value > 0, "Send ETH to buy GMB");
        uint256 gmbAmount = (msg.value * gmbPerEth) / 1 ether;
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
}
