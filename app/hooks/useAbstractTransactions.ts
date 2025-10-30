import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// Transaction costs on Abstract (in ETH)
export const ABSTRACT_COSTS = {
  BOSS_NORMAL_ATTACK: '0.0000001', // 0.0000001 ETH (super cheap!)
  BOSS_POWER_ATTACK: '0.0000001',  // 0.0000001 ETH
  BOSS_COSMIC_ATTACK: '0.0000001', // 0.0000001 ETH
  ARENA_ENTRY: '0.0000002',        // 0.0000002 ETH per fighter (winner takes all)
};

// Simple receiver address for Abstract transactions
// This should be set to a treasury or contract address
const TREASURY_ADDRESS = '0x000000000000000000000000000000000000dEaD'; // TODO: Replace with actual treasury

export function useAbstractTransactions() {
  const { address, isConnected, chain } = useAccount();
  const { sendTransactionAsync, data: hash } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Send ETH transaction on Abstract chain
  const sendTransaction = async (amount: string, description: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (chain?.id !== 2741) {
      throw new Error('Please switch to Abstract network');
    }

    try {
      // Send simple ETH transfer
      const tx = await sendTransactionAsync({
        to: TREASURY_ADDRESS as `0x${string}`,
        value: parseEther(amount),
      });

      console.log(`${description} transaction sent:`, tx);

      return {
        success: true,
        hash: tx,
      };
    } catch (error: any) {
      console.error(`${description} transaction failed:`, error);

      return {
        success: false,
        error: error.message || 'Transaction failed',
      };
    }
  };

  // Boss attack transactions
  const bossAttack = async (attackType: 'normal' | 'power' | 'cosmic') => {
    const costs = {
      normal: ABSTRACT_COSTS.BOSS_NORMAL_ATTACK,
      power: ABSTRACT_COSTS.BOSS_POWER_ATTACK,
      cosmic: ABSTRACT_COSTS.BOSS_COSMIC_ATTACK,
    };

    const amount = costs[attackType];
    const description = `Boss ${attackType} attack`;

    return sendTransaction(amount, description);
  };

  // Arena entry with custom recipient (for escrow/pooling)
  const arenaEntry = async (recipientAddress: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (chain?.id !== 2741) {
      throw new Error('Please switch to Abstract network');
    }

    try {
      // Send ETH to custom recipient (escrow contract or pooling address)
      const tx = await sendTransactionAsync({
        to: recipientAddress as `0x${string}`,
        value: parseEther(ABSTRACT_COSTS.ARENA_ENTRY),
      });

      console.log('Arena entry transaction sent:', tx);

      return {
        success: true,
        hash: tx,
      };
    } catch (error: any) {
      console.error('Arena entry transaction failed:', error);

      return {
        success: false,
        error: error.message || 'Transaction failed',
      };
    }
  };

  return {
    bossAttack,
    arenaEntry,
    isProcessing: isConfirming,
    isConfirmed,
    transactionHash: hash,
  };
}
