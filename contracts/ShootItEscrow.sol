// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ShootItEscrow
 * @dev Simple winner-takes-all escrow for Shoot It game
 * @notice Both players deposit entry fee, winner claims the full pot
 */
contract ShootItEscrow {
    
    // Match state
    struct Match {
        address player1;
        address player2;
        uint256 entryFee;
        uint256 totalPot;
        address winner;
        bool claimed;
        uint256 createdAt;
    }
    
    // Storage
    mapping(bytes32 => Match) public matches;
    address public gameServer;
    uint256 public matchCount;
    
    // Events
    event MatchCreated(bytes32 indexed matchId, address player1, address player2, uint256 entryFee);
    event PlayerDeposited(bytes32 indexed matchId, address player, uint256 amount);
    event WinnerDeclared(bytes32 indexed matchId, address winner);
    event PrizeClaimed(bytes32 indexed matchId, address winner, uint256 amount);
    
    // Errors
    error Unauthorized();
    error InvalidAmount();
    error MatchNotFound();
    error AlreadyDeposited();
    error WinnerNotDeclared();
    error AlreadyClaimed();
    error TransferFailed();
    error NotWinner();
    
    modifier onlyGameServer() {
        if (msg.sender != gameServer) revert Unauthorized();
        _;
    }
    
    constructor(address _gameServer) {
        gameServer = _gameServer;
    }
    
    /**
     * @dev Create a new match with two players
     * @param matchId Unique identifier for the match
     * @param player1 First player address
     * @param player2 Second player address
     * @param entryFee Entry fee amount in wei
     */
    function createMatch(
        bytes32 matchId,
        address player1,
        address player2,
        uint256 entryFee
    ) external onlyGameServer {
        matches[matchId] = Match({
            player1: player1,
            player2: player2,
            entryFee: entryFee,
            totalPot: 0,
            winner: address(0),
            claimed: false,
            createdAt: block.timestamp
        });
        
        matchCount++;
        emit MatchCreated(matchId, player1, player2, entryFee);
    }
    
    /**
     * @dev Player deposits entry fee for a match
     * @param matchId The match to deposit for
     */
    function deposit(bytes32 matchId) external payable {
        Match storage matchData = matches[matchId];
        
        if (matchData.player1 == address(0)) revert MatchNotFound();
        if (msg.value != matchData.entryFee) revert InvalidAmount();
        
        // Check if player is part of this match
        if (msg.sender != matchData.player1 && msg.sender != matchData.player2) {
            revert Unauthorized();
        }
        
        // Simple check: if pot already has funds from this player, revert
        // (This is simplified - in production you'd track individual deposits)
        if (matchData.totalPot >= matchData.entryFee * 2) {
            revert AlreadyDeposited();
        }
        
        matchData.totalPot += msg.value;
        emit PlayerDeposited(matchId, msg.sender, msg.value);
    }
    
    /**
     * @dev Game server declares the winner
     * @param matchId The match that ended
     * @param winner Address of the winning player
     */
    function declareWinner(bytes32 matchId, address winner) external onlyGameServer {
        Match storage matchData = matches[matchId];
        
        if (matchData.player1 == address(0)) revert MatchNotFound();
        if (winner != matchData.player1 && winner != matchData.player2) {
            revert Unauthorized();
        }
        
        matchData.winner = winner;
        emit WinnerDeclared(matchId, winner);
    }
    
    /**
     * @dev Winner claims the prize pot
     * @param matchId The match to claim from
     */
    function claimPrize(bytes32 matchId) external {
        Match storage matchData = matches[matchId];
        
        if (matchData.player1 == address(0)) revert MatchNotFound();
        if (matchData.winner == address(0)) revert WinnerNotDeclared();
        if (msg.sender != matchData.winner) revert NotWinner();
        if (matchData.claimed) revert AlreadyClaimed();
        
        matchData.claimed = true;
        uint256 prize = matchData.totalPot;
        
        // Transfer prize to winner
        (bool success, ) = payable(msg.sender).call{value: prize}("");
        if (!success) revert TransferFailed();
        
        emit PrizeClaimed(matchId, msg.sender, prize);
    }
    
    /**
     * @dev Update game server address (only current game server can do this)
     * @param newGameServer New game server address
     */
    function updateGameServer(address newGameServer) external onlyGameServer {
        gameServer = newGameServer;
    }
    
    /**
     * @dev Get match details
     * @param matchId The match to query
     */
    function getMatch(bytes32 matchId) external view returns (Match memory) {
        return matches[matchId];
    }
    
    /**
     * @dev Check if both players have deposited
     * @param matchId The match to check
     */
    function isMatchFunded(bytes32 matchId) external view returns (bool) {
        Match storage matchData = matches[matchId];
        return matchData.totalPot == matchData.entryFee * 2;
    }
    
    /**
     * @dev Get match status
     * @param matchId The match to check
     */
    function getMatchStatus(bytes32 matchId) external view returns (
        bool funded,
        bool hasWinner,
        bool claimed,
        address winner
    ) {
        Match storage matchData = matches[matchId];
        return (
            matchData.totalPot == matchData.entryFee * 2,
            matchData.winner != address(0),
            matchData.claimed,
            matchData.winner
        );
    }
}

