// Escrow contract hooks for deposits and prize claiming
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { ESCROW_ABI } from '@/lib/contracts/escrow-abi';

const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT as `0x${string}`;

/**
 * Hook to deposit entry fee for a match
 */
export function useDepositEntryFee() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deposit = async (matchId: string, amount: string = '0.001') => {
    if (!ESCROW_CONTRACT_ADDRESS) {
      throw new Error('Escrow contract address not configured');
    }

    // Convert matchId string to bytes32
    const matchIdBytes32 = `0x${matchId.padEnd(64, '0')}` as `0x${string}`;

    return writeContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_ABI,
      functionName: 'deposit',
      args: [matchIdBytes32],
      value: parseEther(amount),
    });
  };

  return {
    deposit,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook to claim prize after winning
 */
export function useClaimPrize() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimPrize = async (matchId: string) => {
    if (!ESCROW_CONTRACT_ADDRESS) {
      throw new Error('Escrow contract address not configured');
    }

    // Convert matchId string to bytes32
    const matchIdBytes32 = `0x${matchId.padEnd(64, '0')}` as `0x${string}`;

    return writeContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_ABI,
      functionName: 'claimPrize',
      args: [matchIdBytes32],
    });
  };

  return {
    claimPrize,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook to read match data from contract
 */
export function useMatchData(matchId: string | undefined) {
  const matchIdBytes32 = matchId ? `0x${matchId.padEnd(64, '0')}` as `0x${string}` : undefined;

  const { data, isLoading, error } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'getMatch',
    args: matchIdBytes32 ? [matchIdBytes32] : undefined,
  });

  return {
    matchData: data,
    isLoading,
    error,
  };
}

