# Network Configuration Fix

## Issue
The wallet was connecting to **Base Mainnet** instead of **Base Sepolia Testnet**.

## Root Cause
The wagmi configuration was importing and using `base` (mainnet) instead of `baseSepolia` (testnet) from `@reown/appkit/networks`.

## Files Fixed

### 1. `components/wallet-provider.tsx`
**Before:**
```typescript
import { base } from "@reown/appkit/networks";
networks: [base],
defaultNetwork: base,
```

**After:**
```typescript
import { baseSepolia } from "@reown/appkit/networks";
networks: [baseSepolia],
defaultNetwork: baseSepolia,
```

### 2. `config/index.tsx`
**Before:**
```typescript
import { mainnet, arbitrum, base } from '@reown/appkit/networks'
export const networks = [base, mainnet, arbitrum]
```

**After:**
```typescript
import { baseSepolia } from '@reown/appkit/networks'
export const networks = [baseSepolia]
```

## How to Test

1. **Restart your dev server:**
   ```bash
   # Kill the current dev server (Ctrl+C)
   pnpm dev
   ```

2. **Clear browser cache and reconnect wallet:**
   - Open browser dev tools
   - Application → Clear storage
   - Or use incognito window
   - Connect wallet again

3. **Verify network:**
   - When you connect, MetaMask should show **"Base Sepolia"**
   - When depositing, transaction should be on **Base Sepolia testnet**
   - Contract address: `0xCCe5Ef96204Fa5cf8bB23830bAF16D84172d8e2C`

## Base Sepolia Details

- **Network Name:** Base Sepolia
- **Chain ID:** 84532
- **RPC URL:** https://sepolia.base.org
- **Explorer:** https://sepolia.basescan.org
- **Currency:** ETH (testnet)

## Getting Testnet ETH

1. Visit Base Sepolia faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Or bridge from Sepolia: https://bridge.base.org/deposit

## Troubleshooting

### If wallet still shows mainnet:
1. Clear browser cache completely
2. Disconnect wallet in MetaMask
3. Refresh the page
4. Reconnect wallet

### If MetaMask doesn't have Base Sepolia:
1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Search for "Base Sepolia"
5. Add it
6. Switch to Base Sepolia

### If contract not found:
- Make sure you're on Base Sepolia (Chain ID: 84532)
- Check contract address is correct
- Verify on BaseScan Sepolia: https://sepolia.basescan.org/address/0xCCe5Ef96204Fa5cf8bB23830bAF16D84172d8e2C

## ✅ Verification Checklist

After restarting the server:

- [ ] Wallet connects to Base Sepolia (not mainnet)
- [ ] Deposit modal shows Base Sepolia network
- [ ] Transaction is sent on testnet
- [ ] No real ETH is at risk
- [ ] Contract interactions work

---

**Status:** FIXED ✅  
**Network:** Base Sepolia (Testnet)  
**Safe to Use:** Yes - Testnet only!

