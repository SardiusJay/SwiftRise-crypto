// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Imports
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
    @title A contract for funding and withdrawing USDC from a contract.
    @author Eyang, Daniel Eyoh
    @notice Only owner is allowed to withdraw money from the contract.
 */
contract FundMeUSDC {
    /* Type Declaration */
    enum FundMeUSDCState { // set the state of the contract.
        OPEN,
        PENDING
    }

    /* State Variables */
    uint256 private constant MINIMUM_USDC = 10 * 1e6; // 10 USDC (considering decimal)
    address private immutable i_owner;
    bool private locked = false; // set a lock for reentrance process
    IERC20 public s_USDC; // Interface for the USDC token
    FundMeUSDCState private s_fundState;

    // Events
    event UserFunded(address indexed funder, uint256 amount);
    event WithdrawalSuccessful(address indexed recipient, uint256 amount);
    event WithdrawalFailed(address indexed recipient, uint256 amount);

    /* Modifiers */
    modifier onlyOwner() {
        if(msg.sender != i_owner) {
            revert("Not Contract Owner");
        }
        _; // this means after verification is done. then run the code below in the function.
    }

    /* Constructor */
    constructor(address USDCAddress) {
        i_owner = msg.sender; // The deployer
        s_USDC = IERC20(USDCAddress); // Contract Address of USDC
        s_fundState = FundMeUSDCState.OPEN; // set the initial state of the contract fundState
    }

    /* Public Functions */
    /**
        @notice Funds the Contract
        @dev
    */
    function fund(uint256 amount) public {
        // set a minimum amount to send in USDC (10USD)
        if (s_USDC.balanceOf(msg.sender) < MINIMUM_USDC || amount < MINIMUM_USDC) {
            revert("Not enough USDC to fund contract");
        }

        // check if the contract is open. User can't fund when withdrawal is taking place.
        if (s_fundState != FundMeUSDCState.OPEN) {
            revert("Contract is not open for funding");
        }

        // Transfer USDC from the funder to the contract.
        bool success = s_USDC.transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert("USDC Transfer Failed");
        }

        emit UserFunded(msg.sender, amount); // Emit the user who funded the contract
    }

    function doWithdraw() internal onlyOwner returns (bool) {
        // Acquire the reentrancy lock
        if (locked) {
            revert("Contract is locked for withdrawal");
        }
        locked = true;

        uint256 balance = s_USDC.balanceOf(address(this));

        if (balance <= 0) {
            revert("Contract has no balance to withdraw");
        }

        // Transfer USDC from the contract to the owner.
        bool success = s_USDC.transfer(msg.sender, balance);
        if (!success) {
            emit WithdrawalFailed(msg.sender, balance);
            return false;
        }

        emit WithdrawalSuccessful(msg.sender, balance);

        // Release the reentrancy lock.
        locked = false;

        return true;
    }

    /**
        @notice withdraw method, calls the doWithdraw method.
        @dev
    */
    function withdraw() public onlyOwner {
        // disable funding
        s_fundState = FundMeUSDCState.PENDING;

        // Call the doWithdraw method and propagate its result
        bool success = doWithdraw();

        // Update state based on the outcome of doWithdraw
        if (success) {
            s_fundState = FundMeUSDCState.OPEN;
        } else {
            s_fundState = FundMeUSDCState.OPEN;
            // Revert withdrawal due to failure in doWithdraw
            revert("Withdrawal from Contract Failed");
        }
    }

    /* view */
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getUSDC() public view returns (IERC20) {
        return s_USDC;
    }

    function getFundState() public view returns (FundMeUSDCState) {
        return s_fundState;
    }

    function getBalance(address account) public view returns (uint256) {
        return s_USDC.balanceOf(account);
    }
}
