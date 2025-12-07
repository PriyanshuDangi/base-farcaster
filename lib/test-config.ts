/**
 * Test script to verify environment variables are loaded correctly
 * Run this in the browser console or Node.js to verify configuration
 */

import { config, validateConfig } from './config';

// Validate and log configuration
validateConfig();

console.log('\n📋 Configuration Test Results:');
console.log('================================');
console.log('✅ Game Server URL:', config.gameServer.url);
console.log('✅ Contract Address:', config.blockchain.escrowContract);
console.log('✅ RPC URL:', config.blockchain.rpcUrl);
console.log('✅ Chain ID:', config.blockchain.chainId);
console.log('✅ Explorer:', config.blockchain.explorerUrl);
console.log('\n🎮 Game Settings:');
console.log('   Match Duration:', config.game.matchDuration, 'seconds');
console.log('   Max Kills:', config.game.maxKills);
console.log('   Entry Fee:', config.game.entryFee, 'ETH');
console.log('   Initial HP:', config.game.initialHP);
console.log('================================\n');

export default config;

