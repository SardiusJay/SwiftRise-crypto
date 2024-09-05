// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    mapping(address => uint256) private balances;

    constructor() ERC20("MockUSDC", "mUSDC") {
        _mint(msg.sender, 20000000);
    }

    function balanceOf(address account) public view override returns (uint256) {
        return balances[account];
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        // Ensure the sender has enough balance
        require(balances[from] >= amount, "Insufficient balance");

        // Update balances
        balances[from] -= amount;
        balances[to] += amount;

        emit Transfer(from, to, amount);
        return true;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        // Ensure the sender (contract itself) has enough balance
        require(balances[msg.sender] >= amount, "Insufficient balance");

        // Update balances
        balances[msg.sender] -= amount;
        balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
