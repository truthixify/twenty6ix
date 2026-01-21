// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Twenty6ixFactory.sol";
import "../src/Twenty6ixNFT.sol";
import "../src/Twenty6ixPayments.sol";

contract Twenty6ixFactoryTest is Test {
    Twenty6ixFactory public factory;
    address public owner = address(0x1);
    address public treasury = address(0x2);
    address public user1 = address(0x3);

    function setUp() public {
        vm.prank(owner);
        factory = new Twenty6ixFactory(treasury, owner);
    }

    function testInitialState() public {
        assertEq(factory.owner(), owner);
        assertEq(factory.treasury(), treasury);

        // Should not have deployed contracts yet
        assertEq(factory.earlyBirdNFT(), address(0));
        assertEq(factory.silverNFT(), address(0));
        assertEq(factory.goldNFT(), address(0));
        assertEq(factory.platinumNFT(), address(0));
        assertEq(factory.paymentsContract(), address(0));
    }

    function testDeployContracts() public {
        vm.prank(owner);
        factory.deployContracts();

        // Check that all contracts are deployed
        assertTrue(factory.earlyBirdNFT() != address(0));
        assertTrue(factory.silverNFT() != address(0));
        assertTrue(factory.goldNFT() != address(0));
        assertTrue(factory.platinumNFT() != address(0));
        assertTrue(factory.paymentsContract() != address(0));
    }

    function testCannotDeployTwice() public {
        vm.prank(owner);
        factory.deployContracts();

        vm.prank(owner);
        vm.expectRevert(Twenty6ixFactory.AlreadyDeployed.selector);
        factory.deployContracts();
    }

    function testGetDeployedContracts() public {
        vm.prank(owner);
        factory.deployContracts();

        address[5] memory contracts = factory.getDeployedContracts();

        assertEq(contracts[0], factory.earlyBirdNFT());
        assertEq(contracts[1], factory.silverNFT());
        assertEq(contracts[2], factory.goldNFT());
        assertEq(contracts[3], factory.platinumNFT());
        assertEq(contracts[4], factory.paymentsContract());
    }
}
