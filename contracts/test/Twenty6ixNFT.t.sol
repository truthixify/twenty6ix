// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Twenty6ixNFT.sol";

contract Twenty6ixNFTTest is Test {
    Twenty6ixNFT public nft;
    address public owner = address(0x1);
    address public treasury = address(0x2);
    address public user1 = address(0x3);
    address public user2 = address(0x4);

    function setUp() public {
        vm.prank(owner);
        nft = new Twenty6ixNFT("Test NFT", "TEST", treasury, owner);
    }

    function testInitialState() public {
        assertEq(nft.name(), "Test NFT");
        assertEq(nft.symbol(), "TEST");
        assertEq(nft.owner(), owner);
        assertEq(nft.treasury(), treasury);

        // Check tier configs
        Twenty6ixNFT.TierConfig memory config = nft.getTierConfig(Twenty6ixNFT.NFTTier.EARLY_BIRD);
        assertEq(config.mintPrice, 0.001 ether);
        assertEq(config.maxSupply, 10000);
        assertEq(config.currentSupply, 0);
        assertTrue(config.isActive);
        assertFalse(config.requiresPrevious);
    }

    function testMintEarlyBird() public {
        vm.deal(user1, 1 ether);

        vm.prank(user1);
        nft.mint{value: 0.001 ether}(Twenty6ixNFT.NFTTier.EARLY_BIRD);

        assertEq(nft.balanceOf(user1), 1);
        assertTrue(nft.ownsTier(user1, Twenty6ixNFT.NFTTier.EARLY_BIRD));
        assertEq(nft.ownerOf(1), user1);
    }

    function testMintWithExcessPayment() public {
        vm.deal(user1, 1 ether);
        uint256 initialBalance = user1.balance;

        vm.prank(user1);
        nft.mint{value: 0.002 ether}(Twenty6ixNFT.NFTTier.EARLY_BIRD);

        // Should refund excess
        assertEq(user1.balance, initialBalance - 0.001 ether);
        assertTrue(nft.ownsTier(user1, Twenty6ixNFT.NFTTier.EARLY_BIRD));
    }

    function testCannotMintSameTierTwice() public {
        vm.deal(user1, 1 ether);

        vm.prank(user1);
        nft.mint{value: 0.001 ether}(Twenty6ixNFT.NFTTier.EARLY_BIRD);

        vm.prank(user1);
        vm.expectRevert(Twenty6ixNFT.AlreadyOwnsTier.selector);
        nft.mint{value: 0.001 ether}(Twenty6ixNFT.NFTTier.EARLY_BIRD);
    }

    function testCannotMintGoldWithoutSilver() public {
        vm.deal(user1, 1 ether);

        vm.prank(user1);
        vm.expectRevert(Twenty6ixNFT.PreviousTierRequired.selector);
        nft.mint{value: 0.005 ether}(Twenty6ixNFT.NFTTier.GOLD);
    }

    function testMintProgression() public {
        vm.deal(user1, 1 ether);

        // Mint Early Bird
        vm.prank(user1);
        nft.mint{value: 0.001 ether}(Twenty6ixNFT.NFTTier.EARLY_BIRD);

        // Mint Silver (no previous tier required)
        vm.prank(user1);
        nft.mint{value: 0.0015 ether}(Twenty6ixNFT.NFTTier.SILVER);

        // Mint Gold (requires Silver)
        vm.prank(user1);
        nft.mint{value: 0.005 ether}(Twenty6ixNFT.NFTTier.GOLD);

        // Mint Platinum (requires Gold)
        vm.prank(user1);
        nft.mint{value: 0.015 ether}(Twenty6ixNFT.NFTTier.PLATINUM);

        assertEq(nft.balanceOf(user1), 4);
        assertTrue(nft.ownsTier(user1, Twenty6ixNFT.NFTTier.EARLY_BIRD));
        assertTrue(nft.ownsTier(user1, Twenty6ixNFT.NFTTier.SILVER));
        assertTrue(nft.ownsTier(user1, Twenty6ixNFT.NFTTier.GOLD));
        assertTrue(nft.ownsTier(user1, Twenty6ixNFT.NFTTier.PLATINUM));
    }

    function testBatchMint() public {
        vm.deal(user1, 1 ether);

        // First mint Silver to satisfy Gold requirement
        vm.prank(user1);
        nft.mint{value: 0.0015 ether}(Twenty6ixNFT.NFTTier.SILVER);

        // Batch mint Early Bird and Gold
        Twenty6ixNFT.NFTTier[] memory tiers = new Twenty6ixNFT.NFTTier[](2);
        tiers[0] = Twenty6ixNFT.NFTTier.EARLY_BIRD;
        tiers[1] = Twenty6ixNFT.NFTTier.GOLD;

        uint256 totalCost = 0.001 ether + 0.005 ether; // Early Bird + Gold

        vm.prank(user1);
        nft.batchMint{value: totalCost}(tiers);

        assertEq(nft.balanceOf(user1), 3);
        assertTrue(nft.ownsTier(user1, Twenty6ixNFT.NFTTier.EARLY_BIRD));
        assertTrue(nft.ownsTier(user1, Twenty6ixNFT.NFTTier.SILVER));
        assertTrue(nft.ownsTier(user1, Twenty6ixNFT.NFTTier.GOLD));
    }

    function testGetOwnedTiers() public {
        vm.deal(user1, 1 ether);

        // Mint Early Bird and Silver
        vm.prank(user1);
        nft.mint{value: 0.001 ether}(Twenty6ixNFT.NFTTier.EARLY_BIRD);

        vm.prank(user1);
        nft.mint{value: 0.0015 ether}(Twenty6ixNFT.NFTTier.SILVER);

        Twenty6ixNFT.NFTTier[] memory ownedTiers = nft.getOwnedTiers(user1);
        assertEq(ownedTiers.length, 2);
        assertEq(uint256(ownedTiers[0]), uint256(Twenty6ixNFT.NFTTier.EARLY_BIRD));
        assertEq(uint256(ownedTiers[1]), uint256(Twenty6ixNFT.NFTTier.SILVER));
    }

    function testInsufficientPayment() public {
        vm.deal(user1, 1 ether);

        vm.prank(user1);
        vm.expectRevert(Twenty6ixNFT.InsufficientPayment.selector);
        nft.mint{value: 0.0005 ether}(Twenty6ixNFT.NFTTier.EARLY_BIRD);
    }

    function testOwnerFunctions() public {
        // Test pause
        vm.prank(owner);
        nft.pause();

        vm.deal(user1, 1 ether);
        vm.prank(user1);
        vm.expectRevert();
        nft.mint{value: 0.001 ether}(Twenty6ixNFT.NFTTier.EARLY_BIRD);

        // Test unpause
        vm.prank(owner);
        nft.unpause();

        vm.prank(user1);
        nft.mint{value: 0.001 ether}(Twenty6ixNFT.NFTTier.EARLY_BIRD);

        assertTrue(nft.ownsTier(user1, Twenty6ixNFT.NFTTier.EARLY_BIRD));
    }

    function testUpdateTierConfig() public {
        vm.prank(owner);
        nft.updateTierConfig(
            Twenty6ixNFT.NFTTier.EARLY_BIRD,
            0.002 ether, // New price
            5000, // New max supply
            "https://new-uri.com/",
            true
        );

        Twenty6ixNFT.TierConfig memory config = nft.getTierConfig(Twenty6ixNFT.NFTTier.EARLY_BIRD);
        assertEq(config.mintPrice, 0.002 ether);
        assertEq(config.maxSupply, 5000);
    }

    function testWithdraw() public {
        vm.deal(user1, 1 ether);

        // Mint to add funds to contract
        vm.prank(user1);
        nft.mint{value: 0.001 ether}(Twenty6ixNFT.NFTTier.EARLY_BIRD);

        uint256 treasuryBalanceBefore = treasury.balance;

        vm.prank(owner);
        nft.withdraw();

        assertEq(treasury.balance, treasuryBalanceBefore + 0.001 ether);
    }

    function testNonOwnerCannotCallOwnerFunctions() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.pause();

        vm.prank(user1);
        vm.expectRevert();
        nft.updateTierConfig(Twenty6ixNFT.NFTTier.EARLY_BIRD, 0.002 ether, 5000, "", true);

        vm.prank(user1);
        vm.expectRevert();
        nft.withdraw();
    }
}
