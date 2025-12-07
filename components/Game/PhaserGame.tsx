'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameScene from '@/lib/phaser/scenes/GameScene';

interface PhaserGameProps {
  matchData?: any;
  onGameReady?: () => void;
}

export default function PhaserGame({ matchData, onGameReady }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    console.log('🎮 Initializing Phaser with match data:', matchData);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      backgroundColor: 'transparent',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 }, // We set gravity per-sprite
          debug: false
        }
      },
      scene: [GameScene]
    };

    gameRef.current = new Phaser.Game(config);

    // Store game instance globally for result retrieval
    (window as any).phaserGame = gameRef.current;

    // Start the game scene with match data
    if (matchData) {
      console.log('🎮 Starting GameScene with match data');
      gameRef.current.scene.start('GameScene', { matchData });
    }

    if (onGameReady) {
      onGameReady();
    }

    console.log('✅ Phaser game initialized');

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        console.log('🗑️ Destroying Phaser game');
        gameRef.current.destroy(true);
        gameRef.current = null;
        (window as any).phaserGame = null;
      }
    };
  }, [matchData, onGameReady]);

  return (
    <div 
      ref={containerRef} 
      className="flex items-center justify-center"
      style={{ width: '800px', height: '600px' }}
    />
  );
}

