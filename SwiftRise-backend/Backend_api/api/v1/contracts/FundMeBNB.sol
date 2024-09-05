// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

// Imports
import "./PriceConverter.sol";

/**
    @title A contract for funding and withdrawing BNB from a contract.
    @author Eyang, Daniel Eyoh
    @notice Only owner is allowed to withdraw money from the contract.
    @dev
 */
contract FundMeBNB {
    /** Type Declaration */
    using PriceConverter for uint256;
    enum FundMeBNBState { // set the state of the contract.
        OPEN,
        PENDING
    }

    /* State Variables */
    uint256 private constant MINIMUM_USD = 10 * 1e18; // Set minimum deposit to 10USD (1e18 wei)
    bool private locked = false; // set a lock for reentrance process
    address private immutable i_owner; // The deployer of the contract
    FundMeBNBState private s_fundState;
	AggregatorV3Interface public s_priceFeed;

    // Events
    event UserFunded(address indexed funder, uint256 amount);
    event WithdrawalSuccessful(address indexed recipient, uint256 beforeAmount, uint256 afterAmount);
    event WithdrawalFailed(address indexed recipient, uint256 amount);

    /* Modifiers */
    // using a modifier for authentication of the withdraw function, i.e only the owner of the contract can withdraw
    modifier onlyOwner() {
        if(msg.sender != i_owner) {
            revert("Not Contract Owner");
        }
        _; // this means after verification is done. then run the code below in the function
    }

    /* Constructor */
    constructor(address priceFeedAddress) {
        i_owner = msg.sender; // The deployer
		s_priceFeed = AggregatorV3Interface(priceFeedAddress); // The price feed i.e Current BNB price in the market.
        s_fundState = FundMeBNBState.OPEN; // set the initial state of the contract fundState
    }

    /* receive and callback */
    // This handles when a user sends fund to the contract without calling the fund function.
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /* public function */
    /**
        @notice Funds the Contract
        @dev 
    */
    function fund() public payable {
        // fund contract
        // set a minimum amount to send 10USD
        if(msg.value.getBnBConversionRate(s_priceFeed) < MINIMUM_USD) {
            revert("Not enough BNB to fund contract");
        }

        // check if the contract is open. User can't fund when withdrawal is taking place.
        if (s_fundState != FundMeBNBState.OPEN) {
            revert("Contract is not open for funding");
        }

        emit UserFunded(msg.sender, msg.value); // Emit the user who funded the contract
    }

    /**
        @notice doWithdraw method, only the contract Owner makes this request successful.
        @dev
    */
    function doWithdraw() internal onlyOwner returns (bool) {
                // Acquire the reentrancy lock
        if (locked) {
            revert("Contract is locked for withdrawal");
        }
        locked = true;

        // Check if there is any balance left in the contract
        if (address(this).balance <= 0) {
            revert("Contract has no balance to withdraw");
        }

        // Transfer the balance to the owner
        uint256 balanceBeforeTransfer = address(this).balance;
        if (!payable(msg.sender).send(address(this).balance)) {
            emit WithdrawalFailed(msg.sender, address(this).balance);
            return false;
        }

        // Emit an event to signal successful withdrawal
        emit WithdrawalSuccessful(msg.sender, balanceBeforeTransfer, address(this).balance);

        // Release the reentrancy lock
        locked = false;

        return true;
    }

    /**
        @notice withdraw method, calls the doWithdraw method.
        @dev
    */
    function withdraw() public onlyOwner {
        // disable funding
        s_fundState = FundMeBNBState.PENDING;

        // Call the doWithdraw method and propagate its result
        bool success = doWithdraw();

        // Update state based on the outcome of doWithdraw
        if (success) {
            s_fundState = FundMeBNBState.OPEN;
        } else {
            s_fundState = FundMeBNBState.OPEN;
            // Revert withdrawal due to failure in doWithdraw
            revert("Withdrawal from Contract Failed");
        }
    }

    /* view */
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getUsdToBnB(uint256 amountInUsd) public view returns (uint256) {
        return (amountInUsd.convertUsdToBnB(s_priceFeed));
    }

    function getFundState() public view returns (FundMeBNBState) {
        return s_fundState;
    }

    // function setFundState() public onlyOwner {  // Should be uncommented ONLY during testing
    //     s_fundState = FundMeBNBState.PENDING;
    // }

    // function setLock() public onlyOwner {  // Should be uncommented ONLY during testing
    //     locked = true;
    // }
}
