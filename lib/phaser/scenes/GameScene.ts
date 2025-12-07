import Phaser from 'phaser';
import { getSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

interface PlayerData {
  sprite: Phaser.Physics.Arcade.Sprite;
  hp: number;
  kills: number;
  deaths: number;
  ammo: number;
  isReloading: boolean;
  isInvulnerable: boolean;
}

interface OpponentData {
  sprite: Phaser.Physics.Arcade.Sprite;
  hp: number;
  kills: number;
  deaths: number;
}

export default class GameScene extends Phaser.Scene {
  private socket: Socket | null = null;
  private player: PlayerData | null = null;
  private opponent: OpponentData | null = null;
  private platforms: Phaser.Physics.Arcade.StaticGroup | null = null;
  private bullets: Phaser.Physics.Arcade.Group | null = null;
  private opponentBullets: Phaser.Physics.Arcade.Group | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key; R: Phaser.Input.Keyboard.Key } | null = null;
  
  // UI Elements
  private hpBar: Phaser.GameObjects.Graphics | null = null;
  private opponentHpBar: Phaser.GameObjects.Graphics | null = null;
  private ammoText: Phaser.GameObjects.Text | null = null;
  private killsText: Phaser.GameObjects.Text | null = null;
  private timerText: Phaser.GameObjects.Text | null = null;
  private aimLine: Phaser.GameObjects.Line | null = null;
  private killFeedText: Phaser.GameObjects.Text | null = null;
  
  // Game state
  private lastMoveUpdate: number = 0;
  private moveUpdateInterval: number = 50; // ms
  private aimAngle: number = 0;
  private matchData: any = null;
  private matchStartTime: number = 0;
  private matchDuration: number = 60000; // 60 seconds
  private matchEnded: boolean = false;
  private controlsEnabled: boolean = false;
  private lastSentPosition: { x: number; y: number; velocityX: number; velocityY: number; flipX: boolean } | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: any) {
    this.matchData = data.matchData;
    console.log('GameScene initialized with match data:', this.matchData);
  }

  create() {
    console.log('🎮 GameScene created');
    
    // Set background color (sky blue)
    this.cameras.main.setBackgroundColor(0x87CEEB);

    // Get game dimensions for responsive scaling
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    console.log('🎮 Game dimensions:', gameWidth, 'x', gameHeight);

    // Initialize socket - get existing instance
    this.socket = getSocket();
    
    // Wait a moment for socket to be ready if needed
    if (!this.socket.connected) {
      console.warn('⚠️ Socket not connected yet, waiting...');
      setTimeout(() => {
        this.socket = getSocket();
        console.log('🔌 Socket after wait - connected:', this.socket?.connected, 'id:', this.socket?.id);
      }, 500);
    } else {
      console.log('✅ Socket ready - connected:', this.socket?.connected, 'id:', this.socket?.id);
    }

    // Create platforms
    this.createPlatforms();

    // Create player
    this.createPlayer();

    // Create controls
    this.setupControls();

    // Create bullet groups
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    this.opponentBullets = this.physics.add.group({
      defaultKey: 'opponentBullet',
      maxSize: 50
    });

    // Create UI elements
    this.createUI();

    // Setup collisions
    this.setupCollisions();

    // Setup socket listeners
    this.setupSocketListeners();

    // Setup mouse input
    this.input.on('pointerdown', this.handleShoot, this);

    // Show pre-match countdown
    this.showPreMatchCountdown();
  }

  private createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    // Ground platform (full width at bottom)
    const ground = this.add.rectangle(gameWidth / 2, gameHeight - 25, gameWidth, 50, 0x2d4a3e);
    this.platforms.add(ground);

    // Floating platforms (scaled to screen size)
    const platform1 = this.add.rectangle(gameWidth * 0.25, gameHeight * 0.67, gameWidth * 0.25, 20, 0x4a6b5e);
    this.platforms.add(platform1);

    const platform2 = this.add.rectangle(gameWidth * 0.625, gameHeight * 0.5, gameWidth * 0.25, 20, 0x4a6b5e);
    this.platforms.add(platform2);

    const platform3 = this.add.rectangle(gameWidth * 0.75, gameHeight * 0.75, gameWidth * 0.19, 20, 0x4a6b5e);
    this.platforms.add(platform3);

    // Refresh static body bounds
    this.platforms.refresh();
  }

  private createPlayer() {
    // Create player sprite (blue rectangle for now)
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3b82f6, 1); // Blue
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('playerSprite', 32, 48);
    playerGraphics.destroy();

    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    // Spawn at left side (relative to screen size)
    const playerSprite = this.physics.add.sprite(gameWidth * 0.125, gameHeight * 0.17, 'playerSprite');
    playerSprite.setCollideWorldBounds(true);
    playerSprite.body.setGravity(0, 300);

    this.player = {
      sprite: playerSprite,
      hp: 100,
      kills: 0,
      deaths: 0,
      ammo: 100,
      isReloading: false,
      isInvulnerable: false
    };

    // Create bullet texture
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1); // Yellow
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // Create opponent bullet texture
    const opponentBulletGraphics = this.add.graphics();
    opponentBulletGraphics.fillStyle(0xff0000, 1); // Red
    opponentBulletGraphics.fillCircle(4, 4, 4);
    opponentBulletGraphics.generateTexture('opponentBullet', 8, 8);
    opponentBulletGraphics.destroy();
  }

  private setupControls() {
    // Arrow keys
    this.cursors = this.input.keyboard!.createCursorKeys();

    // WASD keys
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      R: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    };

    // Spacebar for shooting
    this.input.keyboard!.on('keydown-SPACE', () => {
      this.handleShoot();
    });
  }

  private createUI() {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    
    // Scale font sizes based on game width
    const baseFontSize = Math.max(12, Math.floor(gameWidth / 44));
    const timerFontSize = Math.max(20, Math.floor(gameWidth / 25));
    const killFeedFontSize = Math.max(12, Math.floor(gameWidth / 50));
    
    // HP Bar (player)
    this.hpBar = this.add.graphics();
    this.updateHpBar();

    // Opponent HP Bar
    this.opponentHpBar = this.add.graphics();

    // Ammo text (top right)
    this.ammoText = this.add.text(gameWidth - 20, 20, `Ammo: ${this.player!.ammo}/100`, {
      fontSize: `${baseFontSize}px`,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.ammoText.setOrigin(1, 0);

    // Kills text (below ammo)
    this.killsText = this.add.text(gameWidth - 20, 20 + baseFontSize + 10, `Kills: ${this.player!.kills}`, {
      fontSize: `${baseFontSize}px`,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.killsText.setOrigin(1, 0);

    // Timer text (centered)
    this.timerText = this.add.text(gameWidth / 2, 20, '1:00', {
      fontSize: `${timerFontSize}px`,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.timerText.setOrigin(0.5, 0);

    // Kill feed text (top center, below timer)
    this.killFeedText = this.add.text(gameWidth / 2, 20 + timerFontSize + 10, '', {
      fontSize: `${killFeedFontSize}px`,
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.killFeedText.setOrigin(0.5, 0);

    // Aim line (debug visualization)
    this.aimLine = this.add.line(0, 0, 0, 0, 0, 0, 0xff0000, 0.5);
    this.aimLine.setLineWidth(2);
  }

  private updateHpBar() {
    if (!this.hpBar || !this.player) return;

    this.hpBar.clear();
    
    // Background
    this.hpBar.fillStyle(0x333333, 1);
    this.hpBar.fillRect(20, 20, 200, 20);
    
    // HP bar (green)
    const hpWidth = (this.player.hp / 100) * 200;
    this.hpBar.fillStyle(0x00ff00, 1);
    this.hpBar.fillRect(20, 20, hpWidth, 20);
    
    // Border
    this.hpBar.lineStyle(2, 0xffffff, 1);
    this.hpBar.strokeRect(20, 20, 200, 20);
  }

  private setupCollisions() {
    if (!this.player || !this.platforms) return;

    // Player collides with platforms
    this.physics.add.collider(this.player.sprite, this.platforms);

    // Bullets collide with platforms
    this.physics.add.collider(this.bullets!, this.platforms, (bullet) => {
      bullet.destroy();
    });

    this.physics.add.collider(this.opponentBullets!, this.platforms, (bullet) => {
      bullet.destroy();
    });

    // Opponent bullets hit player
    this.physics.add.overlap(
      this.player.sprite,
      this.opponentBullets!,
      this.handlePlayerHit,
      undefined,
      this
    );

    // Player bullets hit opponent (will be added when opponent is created)
  }

  private setupSocketListeners() {
    if (!this.socket) {
      console.error('❌ Cannot setup socket listeners - socket is null');
      return;
    }

    console.log('🎧 Setting up socket listeners, socket connected:', this.socket.connected, 'id:', this.socket.id);

    // Remove any existing listeners first to avoid duplicates
    this.socket.off('opponent-move');
    this.socket.off('opponent-shoot');
    this.socket.off('kill-event');
    this.socket.off('match-ended');
    this.socket.off('opponent-disconnected');

    // Debug: Log ALL events received by this socket
    const originalOnevent = (this.socket as any).onevent;
    (this.socket as any).onevent = function(packet: any) {
      const args = packet.data || [];
      if (args[0] && args[0].startsWith('opponent-')) {
        console.log('🔍 DEBUG: Socket received event:', args[0], 'data:', args[1]);
      }
      originalOnevent.call(this, packet);
    };

    // Opponent movement
    this.socket.on('opponent-move', (data: any) => {
      console.log('📥 Received opponent-move:', data);
      this.updateOpponent(data);
    });

    // Opponent shoots
    this.socket.on('opponent-shoot', (data: any) => {
      this.spawnOpponentBullet(data);
    });

    // Kill event
    this.socket.on('kill-event', (data: any) => {
      console.log('Kill event:', data);
      this.showKillFeed(data);
      
      // Update kill counts
      if (this.matchData && data.killer === this.matchData.playerAddress) {
        this.player!.kills++;
        this.killsText!.setText(`Kills: ${this.player!.kills}`);
      }
      
      // Update opponent deaths
      if (this.opponent && data.victim !== this.matchData.playerAddress) {
        this.opponent.deaths++;
      }
    });

    // Match ended
    this.socket.on('match-ended', (data: any) => {
      console.log('Match ended:', data);
      this.handleMatchEnd(data);
    });

    // Opponent disconnected
    this.socket.on('opponent-disconnected', () => {
      console.log('Opponent disconnected');
      this.showDisconnectMessage();
    });
  }

  private createOpponentSprite(x: number, y: number) {
    if (this.opponent) {
      console.log('👥 Opponent sprite already exists, skipping creation');
      return; // Already created
    }
    
    console.log('👥 Creating opponent sprite at', x, y);
    
    // Create opponent sprite texture if not exists
    if (!this.textures.exists('opponentSprite')) {
      const opponentGraphics = this.add.graphics();
      opponentGraphics.fillStyle(0xef4444, 1); // Red
      opponentGraphics.fillRect(0, 0, 32, 48);
      opponentGraphics.generateTexture('opponentSprite', 32, 48);
      opponentGraphics.destroy();
      console.log('👥 Created opponentSprite texture');
    }

    const sprite = this.physics.add.sprite(x, y, 'opponentSprite');
    sprite.setCollideWorldBounds(true);
    sprite.body.setGravity(0, 300);
    
    console.log('👥 Opponent sprite object created, visible:', sprite.visible, 'active:', sprite.active);
    
    if (this.platforms) {
      this.physics.add.collider(sprite, this.platforms);
      console.log('👥 Added collision with platforms');
    }

    this.opponent = {
      sprite: sprite,
      hp: 100,
      kills: 0,
      deaths: 0
    };

    // Setup collision between player bullets and opponent
    this.physics.add.overlap(
      sprite,
      this.bullets!,
      this.handleOpponentHit,
      undefined,
      this
    );
    
    console.log('✅ Opponent sprite fully created and configured at', x, y);
  }

  private updateOpponent(data: any) {
    if (!this.opponent) {
      // Create opponent sprite if it doesn't exist yet
      console.log('👥 Creating opponent sprite from first move data at:', data.x, data.y);
      this.createOpponentSprite(data.x, data.y);
      return;
    }

    console.log('👥 Updating opponent - Current pos:', this.opponent.sprite.x, this.opponent.sprite.y, '-> New pos:', data.x, data.y);
    console.log('👥 Opponent sprite visible:', this.opponent.sprite.visible, 'active:', this.opponent.sprite.active);
    
    // Update opponent position and velocity
    const oldX = this.opponent.sprite.x;
    const oldY = this.opponent.sprite.y;
    
    this.opponent.sprite.setPosition(data.x, data.y);
    this.opponent.sprite.setFlipX(data.flipX);
    
    console.log('👥 Position updated from', oldX, oldY, 'to', this.opponent.sprite.x, this.opponent.sprite.y);
    
    // Smooth interpolation
    if (data.velocityX !== undefined) {
      this.opponent.sprite.setVelocityX(data.velocityX);
    }
    if (data.velocityY !== undefined) {
      this.opponent.sprite.setVelocityY(data.velocityY);
    }

    // Update opponent HP bar
    this.updateOpponentHpBar();
  }

  private handleShoot() {
    if (!this.player || this.player.ammo <= 0 || this.player.isReloading || !this.controlsEnabled || this.matchEnded) {
      return;
    }

    const playerSprite = this.player.sprite;
    const pointer = this.input.activePointer;
    
    // Calculate angle from player to pointer
    const angle = Phaser.Math.Angle.Between(
      playerSprite.x,
      playerSprite.y,
      pointer.worldX,
      pointer.worldY
    );

    // Create bullet
    const bullet = this.bullets!.get(playerSprite.x, playerSprite.y, 'bullet');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      const speed = 400;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;
      
      bullet.setVelocity(velocityX, velocityY);
      
      // Destroy bullet after 2 seconds
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });

      // Emit shoot event
      if (this.socket && this.socket.connected) {
        this.socket.emit('player-shoot', {
          x: playerSprite.x,
          y: playerSprite.y,
          angle: angle,
          velocityX: velocityX,
          velocityY: velocityY
        });
        console.log('🔫 Shot fired, socket event sent');
      } else {
        console.warn('⚠️ Socket not connected, cannot send player-shoot');
      }

      // Decrease ammo
      this.player.ammo--;
      this.ammoText!.setText(`Ammo: ${this.player.ammo}/6`);
    }
  }

  private spawnOpponentBullet(data: any) {
    const bullet = this.opponentBullets!.get(data.x, data.y, 'opponentBullet');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocity(data.velocityX, data.velocityY);
      
      // Destroy bullet after 2 seconds
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });
    }
  }

  private handlePlayerHit(player: any, bullet: any) {
    if (!this.player || this.player.isInvulnerable) return;

    bullet.destroy();

    // Flash effect
    this.player.sprite.setTint(0xff0000);
    this.time.delayedCall(100, () => {
      this.player!.sprite.clearTint();
    });

    // Apply damage
    this.player.hp = Math.max(0, this.player.hp - 25);
    this.updateHpBar();

    // Emit hit event to server
    if (this.socket) {
      this.socket.emit('player-hit', {
        newHp: this.player.hp
      });
    }

    // Check if dead
    if (this.player.hp <= 0) {
      this.handlePlayerDeath();
    }
  }

  private handleOpponentHit(opponent: any, bullet: any) {
    if (!this.opponent) return;

    bullet.destroy();

    // Flash effect on opponent
    this.opponent.sprite.setTint(0xffffff);
    this.time.delayedCall(100, () => {
      if (this.opponent) {
        this.opponent.sprite.clearTint();
      }
    });

    // Apply damage locally for visual feedback
    this.opponent.hp = Math.max(0, this.opponent.hp - 25);
    this.updateOpponentHpBar();

    console.log('Hit opponent! HP:', this.opponent.hp);
  }

  private handlePlayerDeath() {
    if (!this.player) return;

    console.log('Player died, respawning...');
    
    // Increment deaths
    this.player.deaths++;

    // Freeze controls temporarily
    this.player.sprite.setAlpha(0.5);
    this.player.sprite.setVelocity(0, 0);

    this.time.delayedCall(2000, () => {
      if (!this.player) return;

      const gameWidth = this.scale.width;
      const gameHeight = this.scale.height;

      // Respawn at random position (relative to screen size)
      const spawnPoints = [
        { x: gameWidth * 0.125, y: gameHeight * 0.17 },
        { x: gameWidth * 0.5, y: gameHeight * 0.17 },
        { x: gameWidth * 0.875, y: gameHeight * 0.17 }
      ];
      const spawn = Phaser.Utils.Array.GetRandom(spawnPoints);
      this.player.sprite.setPosition(spawn.x, spawn.y);

      // Reset HP and ammo
      this.player.hp = 100;
      this.player.ammo = 100;
      this.updateHpBar();
      this.ammoText!.setText(`Ammo: ${this.player.ammo}/100`);

      // Invulnerability for 1 second
      this.player.isInvulnerable = true;
      this.player.sprite.setAlpha(1);

      // Flash effect
      const flashTween = this.tweens.add({
        targets: this.player.sprite,
        alpha: 0.3,
        duration: 150,
        yoyo: true,
        repeat: 6
      });

      this.time.delayedCall(1000, () => {
        if (!this.player) return;
        this.player.isInvulnerable = false;
        this.player.sprite.setAlpha(1);
      });
    });
  }

  private handleReload() {
    if (!this.player || this.player.isReloading || this.player.ammo >= 100) {
      return;
    }

    this.player.isReloading = true;
    this.ammoText!.setText('Reloading...');

    this.time.delayedCall(1000, () => {
      if (!this.player) return;
      
      this.player.ammo = 100;
      this.player.isReloading = false;
      this.ammoText!.setText(`Ammo: ${this.player.ammo}/100`);
    });
  }

  private handleMatchEnd(data: any) {
    console.log('Match ended:', data);
    this.matchEnded = true;
    this.controlsEnabled = false;
    
    // Disable controls
    if (this.player) {
      this.player.sprite.setVelocity(0, 0);
    }
    
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    
    // Create overlay background
    const overlay = this.add.rectangle(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 0x000000, 0.8);
    
    // Determine if local player won
    const isWinner = data.winner === this.matchData?.playerAddress;
    
    // Result text
    const resultFontSize = Math.max(32, Math.floor(gameWidth / 11));
    const resultText = this.add.text(gameWidth / 2, gameHeight * 0.33, isWinner ? 'VICTORY!' : 'DEFEAT', {
      fontSize: `${resultFontSize}px`,
      color: isWinner ? '#00ff00' : '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: Math.max(3, Math.floor(resultFontSize / 12))
    });
    resultText.setOrigin(0.5);

    // Match stats - find the correct player data
    let myStats = data.player1;
    let opponentStats = data.player2;
    
    if (this.matchData && data.player1.walletAddress !== this.matchData.playerAddress) {
      myStats = data.player2;
      opponentStats = data.player1;
    }

    // Stats text
    const statsFontSize = Math.max(14, Math.floor(gameWidth / 40));
    const statsText = this.add.text(gameWidth / 2, gameHeight * 0.53, 
      `Your Stats:\nKills: ${myStats.kills} | Deaths: ${myStats.deaths}\n\nOpponent:\nKills: ${opponentStats.kills} | Deaths: ${opponentStats.deaths}`,
      {
        fontSize: `${statsFontSize}px`,
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    statsText.setOrigin(0.5);

    // Duration
    const durationFontSize = Math.max(12, Math.floor(gameWidth / 50));
    const minutes = Math.floor(data.duration / 60000);
    const seconds = Math.floor((data.duration % 60000) / 1000);
    const durationText = this.add.text(gameWidth / 2, gameHeight * 0.77, 
      `Match Duration: ${minutes}:${seconds.toString().padStart(2, '0')}`,
      {
        fontSize: `${durationFontSize}px`,
        color: '#aaaaaa',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    durationText.setOrigin(0.5);

    // Store match result for parent component
    (this.game as any).matchResult = {
      isWinner,
      matchData: data
    };
  }

  private showPreMatchCountdown() {
    this.controlsEnabled = false;
    
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const countdownFontSize = Math.max(64, Math.floor(gameWidth / 6.25));
    
    const countdownText = this.add.text(gameWidth / 2, gameHeight / 2, '3', {
      fontSize: `${countdownFontSize}px`,
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: Math.max(4, Math.floor(countdownFontSize / 16))
    });
    countdownText.setOrigin(0.5);

    let count = 3;
    const countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        count--;
        if (count > 0) {
          countdownText.setText(count.toString());
        } else {
          countdownText.setText('GO!');
          this.time.delayedCall(500, () => {
            countdownText.destroy();
            this.startMatch();
          });
        }
      },
      repeat: 3
    });
  }

  private startMatch() {
    this.controlsEnabled = true;
    this.matchStartTime = Date.now();
    
    // Double check socket
    if (!this.socket || !this.socket.connected) {
      console.error('❌ Socket not connected at match start! Reconnecting...');
      this.socket = getSocket();
    }
    
    console.log('✅ Match started! Controls enabled:', this.controlsEnabled);
    console.log('🔌 Socket status at match start:', this.socket?.connected, 'id:', this.socket?.id);
    
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    
    // Create opponent sprite immediately with default position on right side (relative to screen)
    this.createOpponentSprite(gameWidth * 0.875, gameHeight * 0.17);
    
    // Send initial position update so opponent sees this player immediately
    if (this.socket?.connected && this.player) {
      const initialPosition = {
        x: Math.round(this.player.sprite.x),
        y: Math.round(this.player.sprite.y),
        velocityX: 0,
        velocityY: 0,
        flipX: false,
        timestamp: Date.now()
      };
      
      console.log('📡 Sending initial player position:', initialPosition);
      this.socket.emit('player-move', initialPosition);
      
      // Set lastSentPosition to avoid sending duplicate immediately
      this.lastSentPosition = {
        x: initialPosition.x,
        y: initialPosition.y,
        velocityX: initialPosition.velocityX,
        velocityY: initialPosition.velocityY,
        flipX: initialPosition.flipX
      };
    }
  }

  private updateOpponentHpBar() {
    if (!this.opponentHpBar || !this.opponent) return;

    this.opponentHpBar.clear();
    
    const barX = this.opponent.sprite.x - 50;
    const barY = this.opponent.sprite.y - 40;
    
    // Background
    this.opponentHpBar.fillStyle(0x333333, 1);
    this.opponentHpBar.fillRect(barX, barY, 100, 8);
    
    // HP bar (red for opponent)
    const hpWidth = (this.opponent.hp / 100) * 100;
    this.opponentHpBar.fillStyle(0xff0000, 1);
    this.opponentHpBar.fillRect(barX, barY, hpWidth, 8);
    
    // Border
    this.opponentHpBar.lineStyle(1, 0xffffff, 1);
    this.opponentHpBar.strokeRect(barX, barY, 100, 8);
  }

  private showKillFeed(data: any) {
    if (!this.killFeedText) return;
    
    const killerName = data.killer.substring(0, 8) + '...';
    const victimName = data.victim.substring(0, 8) + '...';
    
    this.killFeedText.setText(`${killerName} eliminated ${victimName}`);
    
    // Fade out after 3 seconds
    this.time.delayedCall(3000, () => {
      if (this.killFeedText) {
        this.killFeedText.setText('');
      }
    });
  }

  private showDisconnectMessage() {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const fontSize = Math.max(24, Math.floor(gameWidth / 16.67));
    
    const disconnectText = this.add.text(gameWidth / 2, gameHeight / 2, 'Opponent Disconnected', {
      fontSize: `${fontSize}px`,
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: Math.max(3, Math.floor(fontSize / 8))
    });
    disconnectText.setOrigin(0.5);

    this.matchEnded = true;
    this.controlsEnabled = false;
  }

  private updateTimer() {
    if (!this.timerText || !this.matchStartTime || this.matchEnded) return;

    const elapsed = Date.now() - this.matchStartTime;
    const remaining = Math.max(0, this.matchDuration - elapsed);
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    
    // Change color when time is running out
    if (remaining < 10000) {
      this.timerText.setColor('#ff0000');
    } else if (remaining < 30000) {
      this.timerText.setColor('#ffff00');
    }
    
    // End match when timer reaches 0
    if (remaining === 0 && !this.matchEnded) {
      this.matchEnded = true;
      this.controlsEnabled = false;
    }
  }

  update(time: number) {
    if (!this.player || !this.cursors || !this.wasd) return;

    const playerSprite = this.player.sprite;

    // Update timer
    this.updateTimer();

    // Only process controls if enabled and match not ended
    if (!this.controlsEnabled || this.matchEnded) {
      playerSprite.setVelocityX(0);
      return;
    }

    // Horizontal movement
    const leftPressed = this.cursors.left!.isDown || this.wasd.A.isDown;
    const rightPressed = this.cursors.right!.isDown || this.wasd.D.isDown;

    if (leftPressed) {
      playerSprite.setVelocityX(-160);
      playerSprite.setFlipX(true);
    } else if (rightPressed) {
      playerSprite.setVelocityX(160);
      playerSprite.setFlipX(false);
    } else {
      playerSprite.setVelocityX(0);
    }

    // Jetpack (vertical movement)
    const upPressed = this.cursors.up!.isDown || this.wasd.W.isDown;
    if (upPressed) {
      playerSprite.setVelocityY(-200);
      // Visual feedback: orange tint
      playerSprite.setTint(0xff6600);
    } else {
      // Clear tint when jetpack not active
      if (playerSprite.tintTopLeft === 0xff6600) {
        playerSprite.clearTint();
      }
    }

    // Reload
    if (Phaser.Input.Keyboard.JustDown(this.wasd.R)) {
      this.handleReload();
    }

    // Update aim line
    const pointer = this.input.activePointer;
    this.aimAngle = Phaser.Math.Angle.Between(
      playerSprite.x,
      playerSprite.y,
      pointer.worldX,
      pointer.worldY
    );

    const lineLength = 40;
    const endX = playerSprite.x + Math.cos(this.aimAngle) * lineLength;
    const endY = playerSprite.y + Math.sin(this.aimAngle) * lineLength;
    
    this.aimLine!.setTo(playerSprite.x, playerSprite.y, endX, endY);

    // Send position update to server (throttled and only when actually moving)
    if (time - this.lastMoveUpdate > this.moveUpdateInterval) {
      const currentPosition = {
        x: Math.round(playerSprite.x),
        y: Math.round(playerSprite.y),
        velocityX: Math.round(playerSprite.body.velocity.x),
        velocityY: Math.round(playerSprite.body.velocity.y),
        flipX: playerSprite.flipX
      };
      
      // Only send if position or velocity has changed
      const hasMovement = !this.lastSentPosition ||
        currentPosition.x !== this.lastSentPosition.x ||
        currentPosition.y !== this.lastSentPosition.y ||
        currentPosition.velocityX !== this.lastSentPosition.velocityX ||
        currentPosition.velocityY !== this.lastSentPosition.velocityY ||
        currentPosition.flipX !== this.lastSentPosition.flipX;
      
      if (hasMovement) {
        // Ensure socket is fresh
        if (!this.socket || !this.socket.connected) {
          this.socket = getSocket();
        }
        
        if (this.socket && this.socket.connected) {
          this.socket.emit('player-move', {
            ...currentPosition,
            timestamp: Date.now()
          });
          this.lastSentPosition = currentPosition;
          console.log('📡 Sent player-move:', currentPosition);
        } else {
          console.warn('⚠️ Socket not connected, cannot send player-move');
        }
      }
      
      this.lastMoveUpdate = time;
    }
  }
}

