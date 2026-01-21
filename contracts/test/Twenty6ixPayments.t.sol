// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Twenty6ixPayments.sol";

contract Twenty6ixPaymentsTest is Test {
    Twenty6ixPayments public payments;
    address public owner = address(0x1);
    address public treasury = address(0x2);
    address public user1 = address(0x3);
    address public user2 = address(0x4);

    // Default pricing (can be updated in tests)
    uint256 public constant INITIAL_DAILY_CLAIM_PRICE = 0.0001 ether; // $0.10 equivalent
    uint256 public constant INITIAL_MIN_DONATION = 0.001 ether; // $1 minimum
    uint256 public constant CLAIM_COOLDOWN = 24 hours;

    function setUp() public {
        vm.prank(owner);
        payments = new Twenty6ixPayments(treasury, owner);
    }

    function testInitialState() public {
        assertEq(payments.owner(), owner);
        assertEq(payments.treasury(), treasury);
        assertEq(payments.dailyClaimPrice(), INITIAL_DAILY_CLAIM_PRICE);
        assertEq(payments.minDonation(), INITIAL_MIN_DONATION);
        assertEq(payments.CLAIM_COOLDOWN(), CLAIM_COOLDOWN);
    }

    function testDailyClaim() public {
        vm.deal(user1, 1 ether);

        vm.prank(user1);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        assertEq(payments.totalClaims(user1), 1);
        assertEq(payments.totalSpent(user1), INITIAL_DAILY_CLAIM_PRICE);
        assertEq(payments.lastClaimTime(user1), block.timestamp);
        assertTrue(!payments.canClaim(user1)); // Should be on cooldown
    }

    function testDailyClaimWithExcessPayment() public {
        vm.deal(user1, 1 ether);
        uint256 initialBalance = user1.balance;
        uint256 excessPayment = INITIAL_DAILY_CLAIM_PRICE * 2;

        vm.prank(user1);
        payments.dailyClaim{value: excessPayment}();

        // Should refund excess
        assertEq(user1.balance, initialBalance - INITIAL_DAILY_CLAIM_PRICE);
        assertEq(payments.totalClaims(user1), 1);
    }

    function testCannotClaimDuringCooldown() public {
        vm.deal(user1, 1 ether);

        // First claim
        vm.prank(user1);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        // Try to claim again immediately
        vm.prank(user1);
        vm.expectRevert(Twenty6ixPayments.ClaimCooldownActive.selector);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();
    }

    function testClaimAfterCooldown() public {
        vm.deal(user1, 1 ether);

        // First claim
        vm.prank(user1);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        // Fast forward 24 hours
        vm.warp(block.timestamp + CLAIM_COOLDOWN);

        // Should be able to claim again
        assertTrue(payments.canClaim(user1));

        vm.prank(user1);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        assertEq(payments.totalClaims(user1), 2);
        assertEq(payments.totalSpent(user1), INITIAL_DAILY_CLAIM_PRICE * 2);
    }

    function testTimeUntilNextClaim() public {
        vm.deal(user1, 1 ether);

        // No claims yet - should be able to claim immediately
        assertEq(payments.timeUntilNextClaim(user1), 0);

        // Make a claim
        vm.prank(user1);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        // Should show full cooldown time
        assertEq(payments.timeUntilNextClaim(user1), CLAIM_COOLDOWN);

        // Fast forward 12 hours
        vm.warp(block.timestamp + 12 hours);
        assertEq(payments.timeUntilNextClaim(user1), 12 hours);

        // Fast forward past cooldown
        vm.warp(block.timestamp + 13 hours); // Total 25 hours
        assertEq(payments.timeUntilNextClaim(user1), 0);
    }

    function testDonation() public {
        vm.deal(user1, 1 ether);
        uint256 donationAmount = 0.005 ether; // $5 equivalent

        vm.prank(user1);
        payments.donate{value: donationAmount}();

        assertEq(payments.totalDonations(user1), donationAmount);
        assertEq(payments.totalSpent(user1), donationAmount);
    }

    function testDonationTooSmall() public {
        vm.deal(user1, 1 ether);

        vm.prank(user1);
        vm.expectRevert(Twenty6ixPayments.DonationTooSmall.selector);
        payments.donate{value: INITIAL_MIN_DONATION - 1}();
    }

    function testMultipleDonations() public {
        vm.deal(user1, 1 ether);

        vm.prank(user1);
        payments.donate{value: 0.002 ether}();

        vm.prank(user1);
        payments.donate{value: 0.003 ether}();

        assertEq(payments.totalDonations(user1), 0.005 ether);
        assertEq(payments.totalSpent(user1), 0.005 ether);
    }

    function testGetUserStats() public {
        vm.deal(user1, 1 ether);

        // Make a claim
        vm.prank(user1);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        // Make a donation
        vm.prank(user1);
        payments.donate{value: 0.002 ether}();

        (uint256 claims, uint256 donations, uint256 spent, uint256 lastClaim) = payments.getUserStats(user1);

        assertEq(claims, 1);
        assertEq(donations, 0.002 ether);
        assertEq(spent, INITIAL_DAILY_CLAIM_PRICE + 0.002 ether);
        assertEq(lastClaim, block.timestamp);
    }

    function testInsufficientPaymentForClaim() public {
        vm.deal(user1, 1 ether);

        vm.prank(user1);
        vm.expectRevert(Twenty6ixPayments.InsufficientPayment.selector);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE - 1}();
    }

    function testUpdateDailyClaimPrice() public {
        uint256 newPrice = 0.0002 ether; // $0.20 equivalent

        vm.prank(owner);
        payments.updateDailyClaimPrice(newPrice);

        assertEq(payments.dailyClaimPrice(), newPrice);

        // Test with new price
        vm.deal(user1, 1 ether);

        vm.prank(user1);
        payments.dailyClaim{value: newPrice}();

        assertEq(payments.totalSpent(user1), newPrice);
    }

    function testUpdateMinDonation() public {
        uint256 newMinDonation = 0.002 ether; // $2 minimum

        vm.prank(owner);
        payments.updateMinDonation(newMinDonation);

        assertEq(payments.minDonation(), newMinDonation);

        // Test with new minimum
        vm.deal(user1, 1 ether);

        // Should fail with old minimum
        vm.prank(user1);
        vm.expectRevert(Twenty6ixPayments.DonationTooSmall.selector);
        payments.donate{value: INITIAL_MIN_DONATION}();

        // Should succeed with new minimum
        vm.prank(user1);
        payments.donate{value: newMinDonation}();

        assertEq(payments.totalDonations(user1), newMinDonation);
    }

    function testCannotUpdatePriceToZero() public {
        vm.prank(owner);
        vm.expectRevert(Twenty6ixPayments.InvalidPrice.selector);
        payments.updateDailyClaimPrice(0);

        vm.prank(owner);
        vm.expectRevert(Twenty6ixPayments.InvalidPrice.selector);
        payments.updateMinDonation(0);
    }

    function testNonOwnerCannotUpdatePrices() public {
        vm.prank(user1);
        vm.expectRevert();
        payments.updateDailyClaimPrice(0.0002 ether);

        vm.prank(user1);
        vm.expectRevert();
        payments.updateMinDonation(0.002 ether);
    }

    function testPauseAndUnpause() public {
        vm.deal(user1, 1 ether);

        // Pause contract
        vm.prank(owner);
        payments.pause();

        // Should not be able to claim or donate when paused
        vm.prank(user1);
        vm.expectRevert();
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        vm.prank(user1);
        vm.expectRevert();
        payments.donate{value: INITIAL_MIN_DONATION}();

        // Unpause
        vm.prank(owner);
        payments.unpause();

        // Should work again
        vm.prank(user1);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        assertEq(payments.totalClaims(user1), 1);
    }

    function testUpdateTreasury() public {
        address newTreasury = address(0x5);

        vm.prank(owner);
        payments.updateTreasury(newTreasury);

        assertEq(payments.treasury(), newTreasury);
    }

    function testCannotUpdateTreasuryToZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(Twenty6ixPayments.InvalidAddress.selector);
        payments.updateTreasury(address(0));
    }

    function testWithdraw() public {
        vm.deal(user1, 1 ether);

        // Add funds to contract through claims and donations
        vm.prank(user1);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        vm.prank(user1);
        payments.donate{value: 0.005 ether}();

        uint256 contractBalance = address(payments).balance;
        uint256 treasuryBalanceBefore = treasury.balance;

        vm.prank(owner);
        payments.withdraw();

        assertEq(address(payments).balance, 0);
        assertEq(treasury.balance, treasuryBalanceBefore + contractBalance);
    }

    function testGetBalance() public {
        vm.deal(user1, 1 ether);

        assertEq(payments.getBalance(), 0);

        vm.prank(user1);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        assertEq(payments.getBalance(), INITIAL_DAILY_CLAIM_PRICE);
    }

    function testNonOwnerCannotCallOwnerFunctions() public {
        vm.prank(user1);
        vm.expectRevert();
        payments.pause();

        vm.prank(user1);
        vm.expectRevert();
        payments.updateTreasury(address(0x5));

        vm.prank(user1);
        vm.expectRevert();
        payments.withdraw();

        vm.prank(user1);
        vm.expectRevert();
        payments.updateDailyClaimPrice(0.0002 ether);
    }

    function testMultipleUsersIndependentCooldowns() public {
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);

        // User1 claims first
        vm.prank(user1);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        // User2 should still be able to claim
        vm.prank(user2);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        assertEq(payments.totalClaims(user1), 1);
        assertEq(payments.totalClaims(user2), 1);

        // Both should be on cooldown
        assertFalse(payments.canClaim(user1));
        assertFalse(payments.canClaim(user2));
    }

    function testEventEmissions() public {
        vm.deal(user1, 1 ether);

        // Test DailyClaim event
        vm.expectEmit(true, false, false, true);
        emit Twenty6ixPayments.DailyClaim(user1, INITIAL_DAILY_CLAIM_PRICE, block.timestamp);

        vm.prank(user1);
        payments.dailyClaim{value: INITIAL_DAILY_CLAIM_PRICE}();

        // Test Donation event
        uint256 donationAmount = 0.002 ether;
        vm.expectEmit(true, false, false, true);
        emit Twenty6ixPayments.Donation(user1, donationAmount, block.timestamp);

        vm.prank(user1);
        payments.donate{value: donationAmount}();

        // Test price update events
        uint256 newPrice = 0.0002 ether;
        vm.expectEmit(false, false, false, true);
        emit Twenty6ixPayments.DailyClaimPriceUpdated(INITIAL_DAILY_CLAIM_PRICE, newPrice);

        vm.prank(owner);
        payments.updateDailyClaimPrice(newPrice);
    }
}
