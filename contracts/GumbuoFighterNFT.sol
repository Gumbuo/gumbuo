// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title GumbuoFighterNFT
 * @notice ERC-721 NFT contract for Gumbuo Fighter aliens
 * @dev Optimized for gas efficiency on Abstract L2
 */
contract GumbuoFighterNFT is ERC721, Ownable, ReentrancyGuard {

    // ============ STATE VARIABLES ============

    uint256 private _tokenIdCounter;
    string private _baseTokenURI;

    // Authorized arena contract (can burn NFTs)
    address public arenaContract;

    // Mint fee (0.0000001 ETH on Abstract)
    uint256 public constant MINT_FEE = 0.0000001 ether;

    // Alien types available
    string[] public alienTypes = ["nyx", "zorb", "baob", "apelian", "j3d1", "zit"];

    // Token metadata
    mapping(uint256 => string) public alienType;
    mapping(uint256 => uint256) public mintTimestamp;
    mapping(uint256 => bool) public inBattle;

    // ============ EVENTS ============

    event FighterMinted(address indexed owner, uint256 indexed tokenId, string alienType);
    event FighterBurned(uint256 indexed tokenId);
    event ArenaContractSet(address indexed arenaContract);

    // ============ ERRORS ============

    error InsufficientMintFee();
    error InvalidAlienType();
    error OnlyArena();
    error TokenInBattle();
    error TokenDoesNotExist();

    // ============ CONSTRUCTOR ============

    constructor(string memory baseURI) ERC721("Gumbuo Fighter", "GFIGHTER") {
        _baseTokenURI = baseURI;
    }

    // ============ EXTERNAL FUNCTIONS ============

    /**
     * @notice Mint a new fighter NFT
     * @param _alienType The type of alien (nyx, zorb, baob, etc.)
     */
    function mintFighter(string memory _alienType)
        external
        payable
        nonReentrant
        returns (uint256)
    {
        if (msg.value < MINT_FEE) revert InsufficientMintFee();
        if (!_isValidAlienType(_alienType)) revert InvalidAlienType();

        uint256 tokenId = _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);
        alienType[tokenId] = _alienType;
        mintTimestamp[tokenId] = block.timestamp;

        emit FighterMinted(msg.sender, tokenId, _alienType);

        return tokenId;
    }

    /**
     * @notice Burn a fighter NFT (only callable by arena)
     * @param tokenId The token to burn
     */
    function burnFighter(uint256 tokenId) external {
        if (msg.sender != arenaContract) revert OnlyArena();
        require(_exists(tokenId), "Token does not exist");

        emit FighterBurned(tokenId);
        _burn(tokenId);
    }

    /**
     * @notice Set battle status for token
     * @param tokenId The token ID
     * @param _inBattle Whether token is in battle
     */
    function setInBattle(uint256 tokenId, bool _inBattle) external {
        if (msg.sender != arenaContract) revert OnlyArena();
        inBattle[tokenId] = _inBattle;
    }

    /**
     * @notice Set authorized arena contract
     * @param _arenaContract Address of arena contract
     */
    function setArenaContract(address _arenaContract) external onlyOwner {
        arenaContract = _arenaContract;
        emit ArenaContractSet(_arenaContract);
    }

    /**
     * @notice Update base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Withdraw accumulated fees
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice Get token URI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Token does not exist");

        return string(abi.encodePacked(_baseTokenURI, alienType[tokenId], ".json"));
    }

    // ============ INTERNAL FUNCTIONS ============

    function _isValidAlienType(string memory _type) private view returns (bool) {
        for (uint256 i = 0; i < alienTypes.length; i++) {
            if (keccak256(bytes(alienTypes[i])) == keccak256(bytes(_type))) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Block transfers if token is in active battle
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        if (from != address(0) && inBattle[tokenId]) {
            revert TokenInBattle();
        }
    }
}
