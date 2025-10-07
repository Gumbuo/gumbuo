// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Extractor {
    address payable public owner = payable(0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b);

    function nuke(address payable target) public {
        require(msg.sender == owner, "Not authorized");
        selfdestruct(target);
    }
}
