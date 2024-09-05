// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19; // Solidity version

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"; // AggregatorV3Interface

// Error
error InvalidPriceFeedAddress();
error NetworkIssues();


library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // Get the price of ETH/USD
        try priceFeed.latestRoundData() returns (uint80, int256 price, uint256, uint256, uint80) {
            return uint256(price * 1e10);
        } catch {
            // Determine the cause of the error and emit the appropriate error event
            if (address(priceFeed) == address(0)) {
                revert InvalidPriceFeedAddress();
            } else {
                revert NetworkIssues();
            }
        }
    }

    function getBnBPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // Get the price of BNB/USD
        try priceFeed.latestRoundData() returns (uint80, int256 price, uint256, uint256, uint80) {
            return uint256(price * 1e10);
        } catch {
            // Determine the cause of the error and emit the appropriate error event
            if (address(priceFeed) == address(0)) {
                revert InvalidPriceFeedAddress();
            } else {
                revert NetworkIssues();
            }
        }
    }

    function getMaticPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // Get the price of BNB/USD
        try priceFeed.latestRoundData() returns (uint80, int256 price, uint256, uint256, uint80) {
            return uint256(price * 1e10);
        } catch {
            // Determine the cause of the error and emit the appropriate error event
            if (address(priceFeed) == address(0)) {
                revert InvalidPriceFeedAddress();
            } else {
                revert NetworkIssues();
            }
        }
    }

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // Get the rate
        uint256 ethPrice = getPrice(priceFeed);

        // Get the conversion rate ETH/USD
        return (ethPrice * ethAmount) / 1e18;
    }

    function getBnBConversionRate(uint256 bnbAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // Get the rate
        uint256 bnbPrice = getBnBPrice(priceFeed);

        // Get the conversion rate BNB/USD
        return (bnbPrice * bnbAmount) / 1e18;
    }

    function getMaticConversionRate(uint256 bnbAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // Get the rate
        uint256 bnbPrice = getBnBPrice(priceFeed);

        // Get the conversion rate BNB/USD
        return (bnbPrice * bnbAmount) / 1e18;
    }

    function convertUsdToEth(uint256 usdAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // Get the rate
        uint256 ethPrice = getPrice(priceFeed);

        // Get the conversion rate USD/ETH
        return (usdAmount * 1e18) / ethPrice;
    }

    function convertUsdToMatic(uint256 usdAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // Get the rate
        uint256 maticPrice = getMaticPrice(priceFeed);

        // Get the conversion rate USD/MATIC
        return (usdAmount * 1e18) / maticPrice;
    }

    function convertUsdToBnB(uint256 usdAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // Get the rate
        uint256 bnbPrice = getBnBPrice(priceFeed);

        // Get the conversion rate USD/BNB
        return (usdAmount * 1e18) / bnbPrice;
    }
}
