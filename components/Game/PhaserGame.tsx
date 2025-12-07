'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import GameScene from '@/lib/phaser/scenes/GameScene';

interface PhaserGameProps {
  matchData?: any;
  onGameReady?: () => void;
}

export default function PhaserGame({ matchData, onGameReady }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    // Skip if running on server
    if (typeof window === 'undefined') return;
    
    // Calculate responsive dimensions
    const calculateDimensions = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 800); // 16px padding on each side
      const maxHeight = Math.min(window.innerHeight - 200, 600); // Leave room for UI
      
      // Maintain 4:3 aspect ratio
      let width = maxWidth;
      let height = (maxWidth * 3) / 4;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = (maxHeight * 4) / 3;
      }
      
      // Ensure minimum size
      width = Math.max(width, 320);
      height = Math.max(height, 240);
      
      return { width: Math.floor(width), height: Math.floor(height) };
    };

    const dims = calculateDimensions();
    setDimensions(dims);

    // Update dimensions on resize
    const handleResize = () => {
      const newDims = calculateDimensions();
      setDimensions(newDims);
      
      if (gameRef.current) {
        gameRef.current.scale.resize(newDims.width, newDims.height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    console.log('🎮 Initializing Phaser with dimensions:', dimensions);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: dimensions.width,
      height: dimensions.height,
      parent: containerRef.current,
      backgroundColor: 'transparent',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
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
  }, [matchData, onGameReady, dimensions]);

  return (
    <div 
      ref={containerRef} 
      className="flex items-center justify-center w-full"
      style={{ 
        width: '100%',
        maxWidth: `${dimensions.width}px`,
        height: `${dimensions.height}px`
      }}
    />
  );
}

