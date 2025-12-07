# Deployment Guide

## Quick Deploy to Base Sepolia

### Option 1: Remix IDE (Recommended for Hackathon)

1. **Get Base Sepolia Testnet ETH**
   - Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
   - Or bridge from Ethereum Sepolia

2. **Deploy Contract**
   - Open [Remix](https://remix.ethereum.org/)
   - Create new file: `ShootItEscrow.sol`
   - Copy contract code from `ShootItEscrow.sol`
   - Compile (Solidity 0.8.20+)
   - Switch MetaMask to Base Sepolia network:
     - Network Name: Base Sepolia
     - RPC URL: `https://sepolia.base.org`
     - Chain ID: 84532
     - Currency: ETH
     - Block Explorer: `https://sepolia.basescan.org`
   - In Remix, select "Injected Provider - MetaMask"
   - Constructor param: Your backend server wallet address
   - Click Deploy
   - Copy deployed contract address

3. **Verify on BaseScan (Optional)**
   - Go to [Base Sepolia Explorer](https://sepolia.basescan.org)
   - Find your contract
   - Click "Verify and Publish"
   - Select Solidity 0.8.20
   - Paste code and verify

### Option 2: Hardhat/Foundry (Advanced)

Coming soon if needed...

## Configuration

After deployment, update your environment variables:

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_ESCROW_CONTRACT=0xYourContractAddress
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org
```

**Backend (.env):**
```bash
ESCROW_CONTRACT_ADDRESS=0xYourContractAddress
GAME_SERVER_PRIVATE_KEY=0xYourPrivateKey
BASE_SEPOLIA_RPC=https://sepolia.base.org
```

## Testing the Contract

### On Remix
1. Use the "Deployed Contracts" panel
2. Test functions:
   - `createMatch` with test data
   - `deposit` with test ETH
   - `declareWinner`
   - `claimPrize`

### Example Match Flow
```javascript
// 1. Create match
matchId = 0x6d61746368313233... // bytes32 of "match123"
player1 = 0x1234...
player2 = 0x5678...
entryFee = 1000000000000000 // 0.001 ETH in wei

createMatch(matchId, player1, player2, entryFee)

// 2. Players deposit (from player1 wallet)
deposit(matchId) { value: 0.001 ETH }

// 3. Players deposit (from player2 wallet)
deposit(matchId) { value: 0.001 ETH }

// 4. Game plays... winner is player1

// 5. Server declares winner (from server wallet)
declareWinner(matchId, player1)

// 6. Winner claims (from player1 wallet)
claimPrize(matchId)
// Player1 receives 0.002 ETH
```

## Mainnet Deployment Checklist (Future)

- [ ] Full security audit
- [ ] Add emergency pause mechanism
- [ ] Add match timeout/cancellation
- [ ] Add dispute resolution
- [ ] Multi-sig for game server
- [ ] Implement proper fee structure if needed
- [ ] Gas optimization
- [ ] Comprehensive testing suite

