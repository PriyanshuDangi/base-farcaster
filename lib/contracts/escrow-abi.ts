/**
 * ShootItEscrow Contract ABI
 * Contract Address: 0xCCe5Ef96204Fa5cf8bB23830bAF16D84172d8e2C
 * Network: Base Sepolia (Chain ID: 84532)
 */

export const ESCROW_ABI = [
  // Events
  {
    type: 'event',
    name: 'MatchCreated',
    inputs: [
      { indexed: true, name: 'matchId', type: 'bytes32' },
      { indexed: false, name: 'player1', type: 'address' },
      { indexed: false, name: 'player2', type: 'address' },
      { indexed: false, name: 'entryFee', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'PlayerDeposited',
    inputs: [
      { indexed: true, name: 'matchId', type: 'bytes32' },
      { indexed: false, name: 'player', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'WinnerDeclared',
    inputs: [
      { indexed: true, name: 'matchId', type: 'bytes32' },
      { indexed: false, name: 'winner', type: 'address' },
    ],
  },
  {
    type: 'event',
    name: 'PrizeClaimed',
    inputs: [
      { indexed: true, name: 'matchId', type: 'bytes32' },
      { indexed: false, name: 'winner', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
  },

  // Read Functions
  {
    type: 'function',
    name: 'gameServer',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'matchCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'matches',
    stateMutability: 'view',
    inputs: [{ name: 'matchId', type: 'bytes32' }],
    outputs: [
      { name: 'player1', type: 'address' },
      { name: 'player2', type: 'address' },
      { name: 'entryFee', type: 'uint256' },
      { name: 'totalPot', type: 'uint256' },
      { name: 'winner', type: 'address' },
      { name: 'claimed', type: 'bool' },
      { name: 'createdAt', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'getMatch',
    stateMutability: 'view',
    inputs: [{ name: 'matchId', type: 'bytes32' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'player1', type: 'address' },
          { name: 'player2', type: 'address' },
          { name: 'entryFee', type: 'uint256' },
          { name: 'totalPot', type: 'uint256' },
          { name: 'winner', type: 'address' },
          { name: 'claimed', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'isMatchFunded',
    stateMutability: 'view',
    inputs: [{ name: 'matchId', type: 'bytes32' }],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'getMatchStatus',
    stateMutability: 'view',
    inputs: [{ name: 'matchId', type: 'bytes32' }],
    outputs: [
      { name: 'funded', type: 'bool' },
      { name: 'hasWinner', type: 'bool' },
      { name: 'claimed', type: 'bool' },
      { name: 'winner', type: 'address' },
    ],
  },

  // Write Functions
  {
    type: 'function',
    name: 'deposit',
    stateMutability: 'payable',
    inputs: [{ name: 'matchId', type: 'bytes32' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimPrize',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'matchId', type: 'bytes32' }],
    outputs: [],
  },

  // Admin Functions (Game Server Only)
  {
    type: 'function',
    name: 'createMatch',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'matchId', type: 'bytes32' },
      { name: 'player1', type: 'address' },
      { name: 'player2', type: 'address' },
      { name: 'entryFee', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'declareWinner',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'matchId', type: 'bytes32' },
      { name: 'winner', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'updateGameServer',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'newGameServer', type: 'address' }],
    outputs: [],
  },

  // Errors
  {
    type: 'error',
    name: 'Unauthorized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidAmount',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MatchNotFound',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyDeposited',
    inputs: [],
  },
  {
    type: 'error',
    name: 'WinnerNotDeclared',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyClaimed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TransferFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotWinner',
    inputs: [],
  },
] as const;

export const ESCROW_CONTRACT_ADDRESS = '0xCCe5Ef96204Fa5cf8bB23830bAF16D84172d8e2C' as const;

