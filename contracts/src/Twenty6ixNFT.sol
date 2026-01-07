// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Twenty6ixNFT
 * @dev Base NFT contract for TWENTY6IX ecosystem
 * @notice This contract handles minting of tiered NFTs with payment requirements
 */
contract Twenty6ixNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    // NFT Tier enum
    enum NFTTier {
        EARLY_BIRD, // 0
        SILVER, // 1
        GOLD, // 2
        PLATINUM // 3
    }

    // Tier configuration struct
    struct TierConfig {
        uint256 mintPrice; // Price in wei
        uint256 maxSupply; // Maximum supply for this tier
        uint256 currentSupply; // Current minted supply
        string baseURI; // Base URI for metadata
        bool isActive; // Whether minting is active
        NFTTier requiredTier; // Required previous tier (for upgrades)
        bool requiresPrevious; // Whether previous tier is required
    }

    // State variables
    mapping(NFTTier => TierConfig) public tierConfigs;
    mapping(uint256 => NFTTier) public tokenTiers;
    mapping(address => mapping(NFTTier => bool)) public userOwnsTier;

    uint256 private _nextTokenId = 1;
    address public treasury;

    // Events
    event TierMinted(address indexed user, NFTTier tier, uint256 tokenId, uint256 price);
    event TierConfigUpdated(NFTTier tier, uint256 mintPrice, uint256 maxSupply);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    // Errors
    error InvalidTier();
    error TierNotActive();
    error InsufficientPayment();
    error MaxSupplyReached();
    error PreviousTierRequired();
    error AlreadyOwnsTier();
    error InvalidAddress();
    error WithdrawalFailed();

    constructor(string memory name, string memory symbol, address _treasury, address _owner)
        ERC721(name, symbol)
        Ownable(_owner)
    {
        if (_treasury == address(0)) revert InvalidAddress();
        treasury = _treasury;

        _initializeTiers();
    }

    /**
     * @dev Initialize tier configurations
     */
    function _initializeTiers() private {
        // Early Bird - Entry tier
        tierConfigs[NFTTier.EARLY_BIRD] = TierConfig({
            mintPrice: 0.001 ether, // $1 equivalent
            maxSupply: 10000,
            currentSupply: 0,
            baseURI: "",
            isActive: true,
            requiredTier: NFTTier.EARLY_BIRD,
            requiresPrevious: false
        });

        // Silver - First upgrade
        tierConfigs[NFTTier.SILVER] = TierConfig({
            mintPrice: 0.0015 ether, // $1.50 equivalent
            maxSupply: 5000,
            currentSupply: 0,
            baseURI: "",
            isActive: true,
            requiredTier: NFTTier.EARLY_BIRD,
            requiresPrevious: false
        });

        // Gold - Second upgrade
        tierConfigs[NFTTier.GOLD] = TierConfig({
            mintPrice: 0.005 ether, // $5 equivalent
            maxSupply: 1000,
            currentSupply: 0,
            baseURI: "",
            isActive: true,
            requiredTier: NFTTier.SILVER,
            requiresPrevious: true
        });

        // Platinum - Top tier
        tierConfigs[NFTTier.PLATINUM] = TierConfig({
            mintPrice: 0.015 ether, // $15 equivalent
            maxSupply: 100,
            currentSupply: 0,
            baseURI: "",
            isActive: true,
            requiredTier: NFTTier.GOLD,
            requiresPrevious: true
        });
    }

    /**
     * @dev Mint NFT of specified tier
     * @param tier The tier to mint
     */
    function mint(NFTTier tier) external payable nonReentrant whenNotPaused {
        if (uint256(tier) > 3) revert InvalidTier();

        TierConfig storage config = tierConfigs[tier];

        if (!config.isActive) revert TierNotActive();
        if (msg.value < config.mintPrice) revert InsufficientPayment();
        if (config.currentSupply >= config.maxSupply) revert MaxSupplyReached();
        if (userOwnsTier[msg.sender][tier]) revert AlreadyOwnsTier();

        // Check if previous tier is required and owned
        if (config.requiresPrevious && !userOwnsTier[msg.sender][config.requiredTier]) {
            revert PreviousTierRequired();
        }

        uint256 tokenId = _nextTokenId++;
        config.currentSupply++;

        tokenTiers[tokenId] = tier;
        userOwnsTier[msg.sender][tier] = true;

        _safeMint(msg.sender, tokenId);

        emit TierMinted(msg.sender, tier, tokenId, msg.value);

        // Refund excess payment
        if (msg.value > config.mintPrice) {
            (bool success,) = payable(msg.sender).call{value: msg.value - config.mintPrice}("");
            if (!success) revert WithdrawalFailed();
        }
    }

    /**
     * @dev Batch mint multiple tiers (if eligible)
     * @param tiers Array of tiers to mint
     */
    function batchMint(NFTTier[] calldata tiers) external payable nonReentrant whenNotPaused {
        uint256 totalCost = 0;

        // Calculate total cost and validate
        for (uint256 i = 0; i < tiers.length; i++) {
            NFTTier tier = tiers[i];
            if (uint256(tier) > 3) revert InvalidTier();

            TierConfig storage config = tierConfigs[tier];
            if (!config.isActive) revert TierNotActive();
            if (config.currentSupply >= config.maxSupply) revert MaxSupplyReached();
            if (userOwnsTier[msg.sender][tier]) revert AlreadyOwnsTier();

            totalCost += config.mintPrice;
        }

        if (msg.value < totalCost) revert InsufficientPayment();

        // Mint all tiers
        for (uint256 i = 0; i < tiers.length; i++) {
            NFTTier tier = tiers[i];
            TierConfig storage config = tierConfigs[tier];

            // Check previous tier requirement
            if (config.requiresPrevious && !userOwnsTier[msg.sender][config.requiredTier]) {
                revert PreviousTierRequired();
            }

            uint256 tokenId = _nextTokenId++;
            config.currentSupply++;

            tokenTiers[tokenId] = tier;
            userOwnsTier[msg.sender][tier] = true;

            _safeMint(msg.sender, tokenId);

            emit TierMinted(msg.sender, tier, tokenId, config.mintPrice);
        }

        // Refund excess payment
        if (msg.value > totalCost) {
            (bool success,) = payable(msg.sender).call{value: msg.value - totalCost}("");
            if (!success) revert WithdrawalFailed();
        }
    }

    /**
     * @dev Check if user owns a specific tier
     * @param user Address to check
     * @param tier Tier to check
     * @return bool Whether user owns the tier
     */
    function ownsTier(address user, NFTTier tier) external view returns (bool) {
        return userOwnsTier[user][tier];
    }

    /**
     * @dev Get all tiers owned by a user
     * @param user Address to check
     * @return tiers Array of owned tiers
     */
    function getOwnedTiers(address user) external view returns (NFTTier[] memory tiers) {
        uint256 count = 0;

        // Count owned tiers
        for (uint256 i = 0; i <= 3; i++) {
            if (userOwnsTier[user][NFTTier(i)]) {
                count++;
            }
        }

        // Populate array
        tiers = new NFTTier[](count);
        uint256 index = 0;
        for (uint256 i = 0; i <= 3; i++) {
            if (userOwnsTier[user][NFTTier(i)]) {
                tiers[index] = NFTTier(i);
                index++;
            }
        }
    }

    /**
     * @dev Get tier configuration
     * @param tier Tier to get config for
     * @return config Tier configuration
     */
    function getTierConfig(NFTTier tier) external view returns (TierConfig memory config) {
        return tierConfigs[tier];
    }

    /**
     * @dev Update tier configuration (owner only)
     * @param tier Tier to update
     * @param mintPrice New mint price
     * @param maxSupply New max supply
     * @param baseURI New base URI
     * @param isActive Whether tier is active
     */
    function updateTierConfig(
        NFTTier tier,
        uint256 mintPrice,
        uint256 maxSupply,
        string calldata baseURI,
        bool isActive
    ) external onlyOwner {
        if (uint256(tier) > 3) revert InvalidTier();

        TierConfig storage config = tierConfigs[tier];
        config.mintPrice = mintPrice;
        config.maxSupply = maxSupply;
        config.baseURI = baseURI;
        config.isActive = isActive;

        emit TierConfigUpdated(tier, mintPrice, maxSupply);
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
     * @dev Get token URI with tier-specific metadata
     * @param tokenId Token ID
     * @return Token URI
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        _requireOwned(tokenId);

        NFTTier tier = tokenTiers[tokenId];
        string memory baseURI = tierConfigs[tier].baseURI;

        if (bytes(baseURI).length > 0) {
            return string(abi.encodePacked(baseURI, _toString(tokenId), ".json"));
        }

        return super.tokenURI(tokenId);
    }

    /**
     * @dev Convert uint256 to string
     * @param value Value to convert
     * @return String representation
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Override required functions
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
