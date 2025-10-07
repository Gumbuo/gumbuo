// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProxyExtractor {
    address payable public owner = payable(0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b);

    function extract(address payable target) public {
        require(msg.sender == owner, "Not authorized");
        (bool success, ) = target.call{value: 0}("");
        require(success, "Call failed");
    }
}
