// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Twenty6ixNFT.sol";
import "./Twenty6ixPayments.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Twenty6ixFactory
 * @dev Factory contract to deploy and manage TWENTY6IX ecosystem contracts
 * @notice This contract deploys NFT contracts for each tier and payment processor
 */
contract Twenty6ixFactory is Ownable {
    // Deployed contract addresses
    address public earlyBirdNFT;
    address public silverNFT;
    address public goldNFT;
    address public platinumNFT;
    address public paymentsContract;

    address public treasury;

    // Events
    event ContractsDeployed(address earlyBird, address silver, address gold, address platinum, address payments);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    // Errors
    error InvalidAddress();
    error AlreadyDeployed();

    constructor(address _treasury, address _owner) Ownable(_owner) {
        if (_treasury == address(0)) revert InvalidAddress();
        treasury = _treasury;
    }

    /**
     * @dev Deploy all TWENTY6IX contracts
     */
    function deployContracts() external onlyOwner {
        if (earlyBirdNFT != address(0)) revert AlreadyDeployed();

        // Deploy NFT contracts for each tier
        earlyBirdNFT = address(new Twenty6ixNFT("TWENTY6IX Early Bird", "T6X-EB", treasury, owner()));

        silverNFT = address(new Twenty6ixNFT("TWENTY6IX Silver", "T6X-S", treasury, owner()));

        goldNFT = address(new Twenty6ixNFT("TWENTY6IX Gold", "T6X-G", treasury, owner()));

        platinumNFT = address(new Twenty6ixNFT("TWENTY6IX Platinum", "T6X-P", treasury, owner()));

        // Deploy payments contract
        paymentsContract = address(new Twenty6ixPayments(treasury, owner()));

        emit ContractsDeployed(earlyBirdNFT, silverNFT, goldNFT, platinumNFT, paymentsContract);
    }

    /**
     * @dev Get all deployed contract addresses
     * @return addresses Array of deployed contract addresses
     */
    function getDeployedContracts() external view returns (address[5] memory addresses) {
        return [earlyBirdNFT, silverNFT, goldNFT, platinumNFT, paymentsContract];
    }

    /**
     * @dev Update treasury address for all contracts (owner only)
     * @param _treasury New treasury address
     */
    function updateTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert InvalidAddress();

        address oldTreasury = treasury;
        treasury = _treasury;

        // Update treasury in all deployed contracts
        if (earlyBirdNFT != address(0)) {
            Twenty6ixNFT(earlyBirdNFT).updateTreasury(_treasury);
        }
        if (silverNFT != address(0)) {
            Twenty6ixNFT(silverNFT).updateTreasury(_treasury);
        }
        if (goldNFT != address(0)) {
            Twenty6ixNFT(goldNFT).updateTreasury(_treasury);
        }
        if (platinumNFT != address(0)) {
            Twenty6ixNFT(platinumNFT).updateTreasury(_treasury);
        }
        if (paymentsContract != address(0)) {
            Twenty6ixPayments(paymentsContract).updateTreasury(_treasury);
        }

        emit TreasuryUpdated(oldTreasury, _treasury);
    }

    /**
     * @dev Emergency pause all contracts (owner only)
     */
    function pauseAll() external onlyOwner {
        if (earlyBirdNFT != address(0)) {
            Twenty6ixNFT(earlyBirdNFT).pause();
        }
        if (silverNFT != address(0)) {
            Twenty6ixNFT(silverNFT).pause();
        }
        if (goldNFT != address(0)) {
            Twenty6ixNFT(goldNFT).pause();
        }
        if (platinumNFT != address(0)) {
            Twenty6ixNFT(platinumNFT).pause();
        }
        if (paymentsContract != address(0)) {
            Twenty6ixPayments(paymentsContract).pause();
        }
    }

    /**
     * @dev Unpause all contracts (owner only)
     */
    function unpauseAll() external onlyOwner {
        if (earlyBirdNFT != address(0)) {
            Twenty6ixNFT(earlyBirdNFT).unpause();
        }
        if (silverNFT != address(0)) {
            Twenty6ixNFT(silverNFT).unpause();
        }
        if (goldNFT != address(0)) {
            Twenty6ixNFT(goldNFT).unpause();
        }
        if (platinumNFT != address(0)) {
            Twenty6ixNFT(platinumNFT).unpause();
        }
        if (paymentsContract != address(0)) {
            Twenty6ixPayments(paymentsContract).unpause();
        }
    }

    /**
     * @dev Withdraw from all contracts (owner only)
     */
    function withdrawAll() external onlyOwner {
        if (earlyBirdNFT != address(0)) {
            Twenty6ixNFT(earlyBirdNFT).withdraw();
        }
        if (silverNFT != address(0)) {
            Twenty6ixNFT(silverNFT).withdraw();
        }
        if (goldNFT != address(0)) {
            Twenty6ixNFT(goldNFT).withdraw();
        }
        if (platinumNFT != address(0)) {
            Twenty6ixNFT(platinumNFT).withdraw();
        }
        if (paymentsContract != address(0)) {
            Twenty6ixPayments(paymentsContract).withdraw();
        }
    }
}
