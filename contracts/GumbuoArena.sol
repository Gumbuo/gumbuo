// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IGumbuoFighterNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function burnFighter(uint256 tokenId) external;
    function setInBattle(uint256 tokenId, bool inBattle) external;
}

/**
 * @title GumbuoArena
 * @notice Ultra gas-efficient PvP battle arena using deterministic resolution
 * @dev Target: <40k gas per battle - Strategy #2 (Deterministic Single-TX)
 *
 * HOW IT WORKS:
 * 1. Player 1 commits move hash + pays entry fee
 * 2. Player 2 commits move hash + pays entry fee
 * 3. Auto-resolve using blockhash + commitments as random seed
 * 4. Winner determined instantly (50/50 odds)
 * 5. Both NFTs burned, winner gets prize
 *
 * Gas-optimized features:
 * - Packed struct (single storage slot)
 * - Auto-resolve (no reveal phase)
 * - No loops or complex math
 * - Deterministic randomness (blockhash)
 */
contract GumbuoArena is ReentrancyGuard, Pausable, Ownable {

    // ============ CONSTANTS ============

    uint256 public constant ENTRY_FEE = 0.0000002 ether;
    uint256 public constant QUEUE_TIMEOUT = 10 minutes;

    // ============ STATE VARIABLES ============

    IGumbuoFighterNFT public immutable nftContract;

    // Global queue for matchmaking (gas-efficient single slot)
    struct QueuedFighter {
        address player;          // 20 bytes
        uint88 tokenId;          // 11 bytes (enough for 2^88 tokens)
        uint48 timestamp;        // 6 bytes (until year 8 million)
        // Total: 37 bytes = 1 storage slot
    }

    QueuedFighter public queuedFighter;
    bool public hasQueuedFighter;

    // Battle history
    uint256 public totalBattles;

    // ============ EVENTS ============

    event FighterQueued(
        address indexed player,
        uint256 indexed tokenId,
        uint256 timestamp
    );

    event BattleResolved(
        uint256 indexed battleId,
        address indexed winner,
        address indexed loser,
        uint256 winnerTokenId,
        uint256 loserTokenId,
        uint256 prizePool,
        uint256 randomSeed
    );

    event QueueCancelled(address indexed player, uint256 indexed tokenId);

    // ============ ERRORS ============

    error InvalidEntryFee();
    error NotTokenOwner();
    error AlreadyQueued();
    error CannotFightYourself();
    error NoQueuedFighter();
    error NotYourQueuedFighter();
    error TransferFailed();
    error QueueNotExpired();

    // ============ CONSTRUCTOR ============

    constructor(address _nftContract) {
        nftContract = IGumbuoFighterNFT(_nftContract);
    }

    // ============ EXTERNAL FUNCTIONS ============

    /**
     * @notice Queue fighter for battle or join existing queue
     * @param tokenId The NFT token ID to fight with
     * @param moveHash Commitment hash (for fairness, though winner is random)
     *
     * Gas target: ~30-35k gas
     */
    function queueFighter(uint256 tokenId, bytes32 moveHash)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        if (msg.value != ENTRY_FEE) revert InvalidEntryFee();
        if (nftContract.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();

        // Lock NFT
        nftContract.setInBattle(tokenId, true);

        if (!hasQueuedFighter) {
            // First fighter - enter queue
            queuedFighter = QueuedFighter({
                player: msg.sender,
                tokenId: uint88(tokenId),
                timestamp: uint48(block.timestamp)
            });
            hasQueuedFighter = true;

            emit FighterQueued(msg.sender, tokenId, block.timestamp);

        } else {
            // Second fighter - battle starts!
            if (msg.sender == queuedFighter.player) revert CannotFightYourself();

            _resolveBattle(
                queuedFighter.player,
                queuedFighter.tokenId,
                msg.sender,
                tokenId,
                moveHash
            );

            // Clear queue
            delete queuedFighter;
            hasQueuedFighter = false;
        }
    }

    /**
     * @notice Cancel queued fighter if timeout expired
     * @dev Prevents fighters from being stuck forever
     *
     * Gas target: ~20k gas
     */
    function cancelQueue() external nonReentrant {
        if (!hasQueuedFighter) revert NoQueuedFighter();
        if (msg.sender != queuedFighter.player) revert NotYourQueuedFighter();
        if (block.timestamp < queuedFighter.timestamp + QUEUE_TIMEOUT) {
            revert QueueNotExpired();
        }

        uint256 tokenId = queuedFighter.tokenId;

        // Unlock NFT
        nftContract.setInBattle(tokenId, false);

        // Refund entry fee
        (bool success, ) = msg.sender.call{value: ENTRY_FEE}("");
        if (!success) revert TransferFailed();

        emit QueueCancelled(msg.sender, tokenId);

        // Clear queue
        delete queuedFighter;
        hasQueuedFighter = false;
    }

    /**
     * @notice Get current queued fighter info
     */
    function getQueuedFighter()
        external
        view
        returns (address player, uint256 tokenId, uint256 timestamp)
    {
        if (!hasQueuedFighter) return (address(0), 0, 0);
        return (queuedFighter.player, queuedFighter.tokenId, queuedFighter.timestamp);
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Resolve battle using deterministic randomness
     *
     * Gas target: ~25k gas (no loops, simple math)
     */
    function _resolveBattle(
        address player1,
        uint256 token1,
        address player2,
        uint256 token2,
        bytes32 moveHash2
    ) private {
        // Generate deterministic random seed
        uint256 randomSeed = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),  // Blockchain randomness
                    player1,
                    token1,
                    player2,
                    token2,
                    moveHash2,
                    block.timestamp
                )
            )
        );

        // Determine winner (50/50 odds)
        bool player1Wins = (randomSeed % 2) == 0;

        address winner = player1Wins ? player1 : player2;
        address loser = player1Wins ? player2 : player1;
        uint256 winnerTokenId = player1Wins ? token1 : token2;
        uint256 loserTokenId = player1Wins ? token2 : token1;

        // Burn both NFTs
        nftContract.burnFighter(token1);
        nftContract.burnFighter(token2);

        // Calculate prize (both entry fees)
        uint256 prizePool = ENTRY_FEE * 2;

        // Transfer prize to winner
        (bool success, ) = winner.call{value: prizePool}("");
        if (!success) revert TransferFailed();

        emit BattleResolved(
            totalBattles,
            winner,
            loser,
            winnerTokenId,
            loserTokenId,
            prizePool,
            randomSeed
        );

        totalBattles++;
    }

    // ============ ADMIN FUNCTIONS ============

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Emergency withdraw (only when paused)
     */
    function emergencyWithdraw() external onlyOwner {
        require(paused(), "Must be paused");
        uint256 balance = address(this).balance;

        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
