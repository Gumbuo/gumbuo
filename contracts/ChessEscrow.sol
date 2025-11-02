// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChessEscrow
 * @notice Escrow contract for PvP chess games with ETH buy-ins
 * @dev Winner takes all minus gas fees, 24-hour move timer enforced off-chain
 */
contract ChessEscrow {
    // Fixed buy-in amounts
    uint256 public constant BUY_IN_LOW = 0.001 ether;
    uint256 public constant BUY_IN_MID = 0.005 ether;
    uint256 public constant BUY_IN_HIGH = 0.01 ether;

    // Game timeout period (24 hours in seconds)
    uint256 public constant TIMEOUT_PERIOD = 24 hours;

    struct Game {
        uint256 id;
        address player1;      // White (game creator)
        address player2;      // Black (game joiner)
        uint256 buyIn;        // Buy-in amount
        uint256 pot;          // Total ETH in escrow (2x buy-in)
        address currentTurn;  // Address of player whose turn it is
        uint256 lastMoveTime; // Timestamp of last move
        address winner;       // Winner address (0x0 if game ongoing)
        bool completed;       // Game completion status
        bool claimed;         // Winnings claimed status
    }

    // Game storage
    mapping(uint256 => Game) public games;
    uint256 public gameCounter;

    // Mapping to track active games per player
    mapping(address => uint256[]) public playerGames;

    // Events
    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 buyIn);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event MoveMade(uint256 indexed gameId, address indexed player);
    event GameCompleted(uint256 indexed gameId, address indexed winner, uint256 payout);
    event WinningsClaimed(uint256 indexed gameId, address indexed winner, uint256 amount);

    /**
     * @notice Create a new chess game
     * @param buyInTier 0 = low (0.001 ETH), 1 = mid (0.005 ETH), 2 = high (0.01 ETH)
     */
    function createGame(uint8 buyInTier) external payable returns (uint256) {
        uint256 requiredBuyIn;

        if (buyInTier == 0) {
            requiredBuyIn = BUY_IN_LOW;
        } else if (buyInTier == 1) {
            requiredBuyIn = BUY_IN_MID;
        } else if (buyInTier == 2) {
            requiredBuyIn = BUY_IN_HIGH;
        } else {
            revert("Invalid buy-in tier");
        }

        require(msg.value == requiredBuyIn, "Incorrect buy-in amount");

        gameCounter++;
        uint256 gameId = gameCounter;

        games[gameId] = Game({
            id: gameId,
            player1: msg.sender,
            player2: address(0),
            buyIn: requiredBuyIn,
            pot: requiredBuyIn,
            currentTurn: address(0), // Not set until game starts
            lastMoveTime: 0,
            winner: address(0),
            completed: false,
            claimed: false
        });

        playerGames[msg.sender].push(gameId);

        emit GameCreated(gameId, msg.sender, requiredBuyIn);

        return gameId;
    }

    /**
     * @notice Join an existing chess game
     * @param gameId The ID of the game to join
     */
    function joinGame(uint256 gameId) external payable {
        Game storage game = games[gameId];

        require(game.id != 0, "Game does not exist");
        require(game.player2 == address(0), "Game already has two players");
        require(game.player1 != msg.sender, "Cannot play against yourself");
        require(msg.value == game.buyIn, "Incorrect buy-in amount");
        require(!game.completed, "Game already completed");

        game.player2 = msg.sender;
        game.pot += msg.value;
        game.currentTurn = game.player1; // White (player1) moves first
        game.lastMoveTime = block.timestamp;

        playerGames[msg.sender].push(gameId);

        emit GameJoined(gameId, msg.sender);
    }

    /**
     * @notice Record a move made in the game
     * @dev Called by off-chain system after validating chess move
     * @param gameId The ID of the game
     * @param player The address of the player making the move
     */
    function recordMove(uint256 gameId, address player) external {
        Game storage game = games[gameId];

        require(game.id != 0, "Game does not exist");
        require(game.player2 != address(0), "Game not started");
        require(!game.completed, "Game already completed");
        require(game.currentTurn == player, "Not player's turn");
        require(player == game.player1 || player == game.player2, "Not a player in this game");

        // Switch turns
        game.currentTurn = (player == game.player1) ? game.player2 : game.player1;
        game.lastMoveTime = block.timestamp;

        emit MoveMade(gameId, player);
    }

    /**
     * @notice Declare winner of the game (checkmate or timeout)
     * @param gameId The ID of the game
     * @param winner Address of the winning player
     */
    function declareWinner(uint256 gameId, address winner) external {
        Game storage game = games[gameId];

        require(game.id != 0, "Game does not exist");
        require(game.player2 != address(0), "Game not started");
        require(!game.completed, "Game already completed");
        require(winner == game.player1 || winner == game.player2, "Invalid winner");

        // Check if timeout occurred (24 hours since last move)
        if (block.timestamp >= game.lastMoveTime + TIMEOUT_PERIOD) {
            // Timeout - opponent wins
            address timedOutPlayer = game.currentTurn;
            winner = (timedOutPlayer == game.player1) ? game.player2 : game.player1;
        }

        game.winner = winner;
        game.completed = true;

        emit GameCompleted(gameId, winner, game.pot);
    }

    /**
     * @notice Claim winnings after game completion
     * @param gameId The ID of the game
     */
    function claimWinnings(uint256 gameId) external {
        Game storage game = games[gameId];

        require(game.id != 0, "Game does not exist");
        require(game.completed, "Game not completed");
        require(game.winner == msg.sender, "Only winner can claim");
        require(!game.claimed, "Winnings already claimed");

        game.claimed = true;
        uint256 payout = game.pot;

        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Transfer failed");

        emit WinningsClaimed(gameId, msg.sender, payout);
    }

    /**
     * @notice Get all games for a player
     * @param player The player's address
     */
    function getPlayerGames(address player) external view returns (uint256[] memory) {
        return playerGames[player];
    }

    /**
     * @notice Get game details
     * @param gameId The ID of the game
     */
    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    /**
     * @notice Check if a game has timed out
     * @param gameId The ID of the game
     */
    function hasTimedOut(uint256 gameId) external view returns (bool) {
        Game storage game = games[gameId];

        if (game.lastMoveTime == 0 || game.completed) {
            return false;
        }

        return block.timestamp >= game.lastMoveTime + TIMEOUT_PERIOD;
    }

    /**
     * @notice Get list of open games (waiting for player2)
     */
    function getOpenGames() external view returns (uint256[] memory) {
        uint256[] memory openGames = new uint256[](gameCounter);
        uint256 count = 0;

        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].player2 == address(0) && !games[i].completed) {
                openGames[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = openGames[i];
        }

        return result;
    }
}
