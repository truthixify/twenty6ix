// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Twenty6ixFactory.sol";

/**
 * @title DeployTwenty6ix
 * @dev Deployment script for TWENTY6IX ecosystem
 * @notice Only deploys the factory contract - use factory.deployContracts() to deploy the rest
 */
contract DeployTwenty6ix is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        address owner = vm.envAddress("OWNER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy only the factory contract
        Twenty6ixFactory factory = new Twenty6ixFactory(treasury, owner);

        console.log("=== TWENTY6IX DEPLOYMENT COMPLETE ===");
        console.log("Factory deployed at:", address(factory));
        console.log("Treasury address:", treasury);
        console.log("Owner address:", owner);
        console.log("");

        vm.stopBroadcast();

        // Write factory address to file for easy access
        string memory deploymentInfo = string(
            abi.encodePacked(
                "# TWENTY6IX Deployment Info\n",
                "TWENTY6IX_FACTORY=",
                vm.toString(address(factory)),
                "\n",
                "TREASURY_ADDRESS=",
                vm.toString(treasury),
                "\n",
                "OWNER_ADDRESS=",
                vm.toString(owner),
                "\n"
            )
        );

        vm.writeFile("./factory-deployment.env", deploymentInfo);
        console.log("Factory address written to factory-deployment.env");
    }
}
