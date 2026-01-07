// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Twenty6ixPayments
 * @dev Handles daily claims and donations for TWENTY6IX ecosystem
 * @notice This contract processes payments and tracks user activity
 */
contract Twenty6ixPayments is Ownable, ReentrancyGuard, Pausable {
    // Configurable pricing
    uint256 public dailyClaimPrice = 0.0001 ether; // $0.10 equivalent (configurable)
    uint256 public minDonation = 0.001 ether; // $1 minimum donation (configurable)
    uint256 public constant CLAIM_COOLDOWN = 24 hours;

    // State variables
    address public treasury;
    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public totalClaims;
    mapping(address => uint256) public totalDonations;
    mapping(address => uint256) public totalSpent;

    // Events
    event DailyClaim(address indexed user, uint256 amount, uint256 timestamp);
    event Donation(address indexed user, uint256 amount, uint256 timestamp);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event DailyClaimPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event MinDonationUpdated(uint256 oldMinDonation, uint256 newMinDonation);

    // Errors
    error InvalidAddress();
    error InsufficientPayment();
    error ClaimCooldownActive();
    error DonationTooSmall();
    error WithdrawalFailed();
    error InvalidPrice();

    constructor(address _treasury, address _owner) Ownable(_owner) {
        if (_treasury == address(0)) revert InvalidAddress();
        treasury = _treasury;
    }

    /**
     * @dev Process daily claim payment
     */
    function dailyClaim() external payable nonReentrant whenNotPaused {
        if (msg.value < dailyClaimPrice) revert InsufficientPayment();

        // Check cooldown (skip check for first claim)
        if (lastClaimTime[msg.sender] != 0 && block.timestamp < lastClaimTime[msg.sender] + CLAIM_COOLDOWN) {
            revert ClaimCooldownActive();
        }

        // Update state
        lastClaimTime[msg.sender] = block.timestamp;
        totalClaims[msg.sender]++;
        totalSpent[msg.sender] += dailyClaimPrice;

        emit DailyClaim(msg.sender, dailyClaimPrice, block.timestamp);

        // Refund excess payment
        if (msg.value > dailyClaimPrice) {
            (bool success,) = payable(msg.sender).call{value: msg.value - dailyClaimPrice}("");
            if (!success) revert WithdrawalFailed();
        }
    }

    /**
     * @dev Process donation payment
     */
    function donate() external payable nonReentrant whenNotPaused {
        if (msg.value < minDonation) revert DonationTooSmall();

        // Update state
        totalDonations[msg.sender] += msg.value;
        totalSpent[msg.sender] += msg.value;

        emit Donation(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Update daily claim price (owner only)
     * @param _newPrice New daily claim price in wei
     */
    function updateDailyClaimPrice(uint256 _newPrice) external onlyOwner {
        if (_newPrice == 0) revert InvalidPrice();

        uint256 oldPrice = dailyClaimPrice;
        dailyClaimPrice = _newPrice;

        emit DailyClaimPriceUpdated(oldPrice, _newPrice);
    }

    /**
     * @dev Update minimum donation amount (owner only)
     * @param _newMinDonation New minimum donation amount in wei
     */
    function updateMinDonation(uint256 _newMinDonation) external onlyOwner {
        if (_newMinDonation == 0) revert InvalidPrice();

        uint256 oldMinDonation = minDonation;
        minDonation = _newMinDonation;

        emit MinDonationUpdated(oldMinDonation, _newMinDonation);
    }

    /**
     * @dev Check if user can claim (cooldown expired)
     * @param user Address to check
     * @return bool Whether user can claim
     */
    function canClaim(address user) external view returns (bool) {
        // First claim is always allowed
        if (lastClaimTime[user] == 0) return true;
        return block.timestamp >= lastClaimTime[user] + CLAIM_COOLDOWN;
    }

    /**
     * @dev Get time until next claim is available
     * @param user Address to check
     * @return uint256 Seconds until next claim (0 if can claim now)
     */
    function timeUntilNextClaim(address user) external view returns (uint256) {
        // First claim is always available
        if (lastClaimTime[user] == 0) return 0;

        uint256 nextClaimTime = lastClaimTime[user] + CLAIM_COOLDOWN;
        if (block.timestamp >= nextClaimTime) {
            return 0;
        }
        return nextClaimTime - block.timestamp;
    }

    /**
     * @dev Get user's total spending
     * @param user Address to check
     * @return uint256 Total amount spent in wei
     */
    function getUserTotalSpent(address user) external view returns (uint256) {
        return totalSpent[user];
    }

    /**
     * @dev Get user's claim statistics
     * @param user Address to check
     * @return claims Total number of claims
     * @return donations Total donation amount
     * @return spent Total amount spent
     * @return lastClaim Timestamp of last claim
     */
    function getUserStats(address user)
        external
        view
        returns (uint256 claims, uint256 donations, uint256 spent, uint256 lastClaim)
    {
        return (totalClaims[user], totalDonations[user], totalSpent[user], lastClaimTime[user]);
    }

    /**
     * @dev Update treasury address (owner only)
     * @param _treasury New treasury address
     */
    function updateTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert InvalidAddress();

        address oldTreasury = treasury;
        treasury = _treasury;

        emit TreasuryUpdated(oldTreasury, _treasury);
    }

    /**
     * @dev Withdraw contract balance to treasury (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success,) = payable(treasury).call{value: balance}("");
            if (!success) revert WithdrawalFailed();
        }
    }

    /**
     * @dev Emergency pause (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get contract balance
     * @return uint256 Contract balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
