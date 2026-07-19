// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockERC20 {
    function transfer(address to, uint256 value) external returns (bool) {
        return true;
    }
    function balanceOf(address account) external view returns (uint256) {
        return 1000000000;
    }
}
