# Shoot It - Smart Contract

Simple winner-takes-all escrow contract for the Shoot It game.

## Contract: ShootItEscrow

### How it Works

1. **Game Server** creates a match with `createMatch(matchId, player1, player2, entryFee)`
2. **Both Players** deposit their entry fee with `deposit(matchId)` (sends ETH)
3. **Game Server** declares winner with `declareWinner(matchId, winnerAddress)`
4. **Winner** claims the full pot with `claimPrize(matchId)`

### Deployment (Using Remix)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file `ShootItEscrow.sol`
3. Paste the contract code
4. Compile with Solidity 0.8.20+
5. Deploy to **Base Sepolia**:
   - Select "Injected Provider - MetaMask"
   - Constructor parameter: `_gameServer` = your backend server wallet address
   - Deploy and copy the contract address

### After Deployment

1. Save the contract address in your frontend `.env`:
   ```
   NEXT_PUBLIC_ESCROW_CONTRACT=0x...
   ```

2. Save the contract address in your backend `.env`:
   ```
   ESCROW_CONTRACT_ADDRESS=0x...
   GAME_SERVER_PRIVATE_KEY=0x...  # Private key that deployed the contract
   ```

### Contract Functions

#### For Game Server
- `createMatch(bytes32 matchId, address player1, address player2, uint256 entryFee)` - Create new match
- `declareWinner(bytes32 matchId, address winner)` - Declare winner after game ends
- `updateGameServer(address newGameServer)` - Change authorized server

#### For Players
- `deposit(bytes32 matchId) payable` - Deposit entry fee
- `claimPrize(bytes32 matchId)` - Winner claims the pot

#### View Functions
- `getMatch(bytes32 matchId)` - Get full match details
- `isMatchFunded(bytes32 matchId)` - Check if both players deposited
- `getMatchStatus(bytes32 matchId)` - Get match status overview

### Match ID Format

The backend generates match IDs like: `match_1234567890_abc123def`

Convert to bytes32 in JavaScript:
```javascript
const matchId = ethers.utils.formatBytes32String(matchIdString);
```

### Security Notes

- Only the game server address can create matches and declare winners
- Players can only deposit for matches they're part of
- Winners can only claim their own prizes
- No protocol fees - winner gets 100% of the pot
- Simplified for hackathon - production would need:
  - Timeouts for unclaimed prizes
  - Dispute resolution
  - Emergency withdrawal
  - Match cancellation if not funded

