# Shoot It - Implementation Plan

**Purpose:** Step-by-step instructions for AI developers to build the base game.  
**Scope:** Core gameplay loop only. Social features, leaderboards, and polish come later.  
**Validation:** Each step includes a test to confirm correct implementation.

---

## Phase 1: Environment Setup

### Step 1.1: Install Backend Dependencies
**Goal:** Get the game server ready to run.

**Instructions:**
1. Navigate to the `backend/` directory
2. Run the package manager install command
3. Copy `.env.example` to `.env`
4. Set `PORT=3001` and `FRONTEND_URL=http://localhost:3000` in `.env`
5. Start the development server

**Test:**
- Visit `http://localhost:3001/health` in a browser
- Should return JSON: `{ status: 'ok', activeMatches: 0, playersInQueue: 0 }`

---

### Step 1.2: Install Frontend Dependencies
**Goal:** Add Phaser.js game engine to the Next.js project.

**Instructions:**
1. Navigate to the main project directory (not backend)
2. Install Phaser.js version 3.x using the package manager
3. Install Socket.io client library

**Test:**
- Check `package.json` to confirm `phaser` and `socket.io-client` are listed in dependencies
- Run the frontend dev server and confirm it starts without errors

---

### Step 1.3: Deploy Smart Contract
**Goal:** Deploy the escrow contract to Base Sepolia testnet.

**Instructions:**
1. Get Base Sepolia testnet ETH from the faucet (URL in contracts/DEPLOYMENT.md)
2. Open Remix IDE in browser
3. Create new file and paste the contract code from `contracts/ShootItEscrow.sol`
4. Compile with Solidity 0.8.20 or higher
5. Add Base Sepolia network to MetaMask (chain ID: 84532, RPC: https://sepolia.base.org)
6. In Remix, select "Injected Provider - MetaMask"
7. Deploy with constructor parameter: your test wallet address (acts as game server)
8. Save the deployed contract address

**Test:**
- On BaseScan Sepolia, search for your contract address
- Should show a successful contract creation transaction
- Click "Contract" tab and verify the contract code matches

---

### Step 1.4: Configure Environment Variables
**Goal:** Connect all components with the deployed contract.

**Instructions:**
1. In the main project root, create `.env.local` file
2. Add: `NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:3001`
3. Add: `NEXT_PUBLIC_ESCROW_CONTRACT=[your deployed contract address]`
4. Add: `NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org`
5. In `backend/.env`, add: `ESCROW_CONTRACT_ADDRESS=[same contract address]`
6. In `backend/.env`, add: `BASE_SEPOLIA_RPC=https://sepolia.base.org`

**Test:**
- Restart both frontend and backend servers
- Check console logs - should not show any "undefined" environment variable errors
- In browser console, type `process.env.NEXT_PUBLIC_ESCROW_CONTRACT` - should return your contract address

---

## Phase 2: Socket.io Connection

### Step 2.1: Create Socket Client Utility
**Goal:** Create a reusable Socket.io client that connects to the game server.

**Instructions:**
1. Create a new file: `lib/socket.ts`
2. Import Socket.io client
3. Create a singleton Socket instance that connects to `NEXT_PUBLIC_GAME_SERVER_URL`
4. Export the socket instance
5. Add connection event listeners that log to console when connected/disconnected

**Test:**
- Import the socket in any component
- Open browser dev tools Network tab
- Should see a WebSocket connection to `localhost:3001`
- Backend terminal should log: "Player connected: [socket-id]"

---

### Step 2.2: Create Match Queue Component
**Goal:** Build UI for finding a match.

**Instructions:**
1. Create new file: `components/Game/MatchQueue.tsx`
2. Add a "Find Match" button
3. When clicked, emit a `find-match` Socket event with test player data: `{ walletAddress: '0x123...', fid: 'test', username: 'TestPlayer' }`
4. Listen for `waiting-for-opponent` event and display "Searching for opponent..." message
5. Listen for `match-found` event and display "Match found!" with opponent username

**Test:**
- Open the component in browser
- Click "Find Match" button
- Backend should log: "Player [socket-id] looking for match"
- UI should show "Searching for opponent..." message
- Open a second browser window (incognito), click "Find Match"
- Both windows should show "Match found!" after pairing

---

## Phase 3: Basic Phaser Game Scene

### Step 3.1: Create Phaser Game Wrapper Component
**Goal:** Set up a Phaser game canvas that renders in Next.js.

**Instructions:**
1. Create new file: `components/Game/PhaserGame.tsx`
2. Import Phaser
3. Create a component that initializes a Phaser game in `useEffect`
4. Configure: 800x600 canvas, `Phaser.AUTO` renderer, transparent background
5. Set the parent to a div ref
6. Return cleanup function that destroys the game on unmount

**Test:**
- Add the component to any page
- Should see an empty 800x600 canvas appear
- Browser console should show Phaser version log
- No errors in console
- When navigating away from page, game should cleanly unmount

---

### Step 3.2: Create Main Game Scene
**Goal:** Create the primary game scene where gameplay happens.

**Instructions:**
1. Create new file: `lib/phaser/scenes/GameScene.ts`
2. Extend `Phaser.Scene` class
3. Set scene key as `'GameScene'`
4. In `create()` method, set background color to light blue (`0x87CEEB` - sky color)
5. Add debug text showing "Game Scene Loaded" at position (100, 100)
6. Register this scene in the Phaser config

**Test:**
- Load the Phaser component
- Should see light blue background
- Should see "Game Scene Loaded" text
- Check browser console for Phaser scene lifecycle logs

---

### Step 3.3: Add Ground and Platforms
**Goal:** Create the game map with collidable surfaces.

**Instructions:**
1. In `GameScene.create()`, create a physics group for platforms
2. Add a ground platform at the bottom (full width, 50px height)
3. Add 3 floating platforms at different heights across the map
4. Make all platforms static physics bodies
5. Use simple rectangles with distinct colors for now (no sprites yet)

**Test:**
- Load the game scene
- Should see 4 rectangular platforms rendered
- Ground should span the full width at the bottom
- Three platforms should be visible at different vertical positions
- Platforms should be different colors for easy identification

---

### Step 3.4: Create Player Sprite
**Goal:** Add a player character to the scene.

**Instructions:**
1. In `GameScene.create()`, add a physics sprite at position (100, 100)
2. Use a simple colored rectangle or circle (32x48 pixels) as placeholder
3. Enable physics body for the player
4. Set player collision with platform group
5. Set gravity for the player body (y: 300 for low gravity effect)

**Test:**
- Load the game scene
- Should see a colored shape representing the player
- Player should fall and land on the ground platform
- Player should not fall through platforms
- Player should come to rest on the ground

---

## Phase 4: Player Controls

### Step 4.1: Implement Horizontal Movement
**Goal:** Make the player move left and right.

**Instructions:**
1. In `GameScene`, create keyboard cursor keys input
2. In `update()` method, check left arrow key - set player velocity X to -160
3. Check right arrow key - set player velocity X to 160
4. If neither key pressed, set velocity X to 0
5. Also add WASD keys as alternative (A = left, D = right)

**Test:**
- Press left arrow or A key - player moves left
- Press right arrow or D key - player moves right
- Release keys - player stops horizontal movement
- Player should not slide after releasing keys

---

### Step 4.2: Implement Jetpack Movement
**Goal:** Add vertical movement with jetpack mechanics.

**Instructions:**
1. In `update()` method, check for up arrow or W key being held down
2. When held, set player velocity Y to -200 (upward thrust)
3. Add a visual indicator: change player color when jetpack is active
4. Jetpack should work while in air or on ground (unlimited fuel for now)

**Test:**
- Hold up arrow or W key - player moves upward
- Release key - player falls back down due to gravity
- Player should be able to "fly" continuously while holding the key
- Visual indicator (color change) should show when jetpack is active
- Player can reach the top of the screen

---

### Step 4.3: Add Basic Animation Feedback
**Goal:** Give visual feedback for player state.

**Instructions:**
1. Create a simple sprite tint system
2. Default state: neutral color (white or light gray)
3. Moving left/right: slight tint change
4. Jetpack active: bright orange/red glow
5. Add sprite flip: face left when moving left, face right when moving right

**Test:**
- Stand still - player has neutral color
- Move left - player flips to face left
- Move right - player flips to face right
- Activate jetpack - player glows orange/red
- All state changes should be immediate and visible

---

## Phase 5: Shooting Mechanics

### Step 5.1: Implement Aiming System
**Goal:** Point weapon toward mouse cursor.

**Instructions:**
1. Enable pointer input in the scene
2. In `update()`, calculate angle between player position and mouse pointer position
3. Store this angle in a player property
4. Draw a small line from player center in the aim direction (debug visualization)
5. The line should rotate smoothly to follow mouse movement

**Test:**
- Move mouse around the screen
- A line should extend from player toward cursor
- Line should rotate 360 degrees freely
- Angle calculation should be accurate in all quadrants
- Line should update every frame smoothly

---

### Step 5.2: Create Bullet System
**Goal:** Spawn bullets when player shoots.

**Instructions:**
1. Create a physics group for bullets
2. On mouse click (or spacebar), spawn a bullet at player position
3. Set bullet velocity based on aim angle (speed: 400)
4. Bullets should be small circles (4px radius)
5. Add bullets to an array for tracking
6. Bullets should automatically destroy after 2 seconds

**Test:**
- Click mouse or press spacebar
- Bullet should appear at player position
- Bullet should travel in the direction player is aiming
- Multiple bullets can exist simultaneously
- Bullets should disappear after 2 seconds
- Check memory: destroyed bullets should be removed from array

---

### Step 5.3: Add Reload Mechanic
**Goal:** Limit shots to 6 before requiring reload.

**Instructions:**
1. Add a `ammoCount` property to player, initialized to 6
2. On shoot, decrement ammo count
3. When ammo reaches 0, prevent shooting
4. Press R key to reload - reset ammo to 6 with 1 second delay
5. Display ammo count as text on screen

**Test:**
- Fire 6 shots - should work normally
- Try to fire 7th shot - should do nothing
- Ammo display shows "0/6"
- Press R key - after 1 second, ammo shows "6/6"
- Can fire again after reload
- Cannot reload while already at 6 ammo

---

## Phase 6: Multiplayer Synchronization

### Step 6.1: Send Player Position Updates
**Goal:** Broadcast local player movement to server.

**Instructions:**
1. In `GameScene.update()`, emit `player-move` event every frame
2. Send data: `{ x: player.x, y: player.y, velocityX: player.body.velocity.x, velocityY: player.body.velocity.y, flipX: player.flipX }`
3. Add throttling: only send every 50ms (not every frame)
4. Include a timestamp in the data

**Test:**
- Open browser console on backend server
- Move the player character
- Should NOT see console spam (thanks to throttling)
- Set up a temporary socket listener in backend that logs received position data
- Confirm data includes x, y, velocities, and flip state

---

### Step 6.2: Receive Opponent Position Updates
**Goal:** Show the other player's movements in real-time.

**Instructions:**
1. In `GameScene`, listen for `opponent-move` Socket event
2. When received, update or create an opponent sprite
3. If opponent sprite doesn't exist, create it as a different color (red vs blue)
4. Set opponent position to received coordinates
5. Apply received velocity and flip state

**Test:**
- Open two browser windows
- Both players join a match
- Move player in window 1
- Window 2 should show the opponent moving
- Move player in window 2
- Window 1 should show the opponent moving
- Movements should be smooth and synchronized
- Each player sees themselves as one color and opponent as another

---

### Step 6.3: Synchronize Shooting Events
**Goal:** Show opponent's bullets in real-time.

**Instructions:**
1. When local player shoots, emit `player-shoot` event with bullet data: `{ x, y, angle, velocityX, velocityY }`
2. Listen for `opponent-shoot` event
3. When received, spawn a bullet on the local game at the specified position and velocity
4. Opponent bullets should be a different color than local bullets

**Test:**
- Two browser windows, both in a match
- Fire bullet in window 1
- Window 2 should instantly show opponent's bullet appear and travel
- Fire bullet in window 2
- Window 1 should show opponent's bullet
- Bullet angles should match exactly
- Bullets should not collide with each other (pass through)

---

## Phase 7: Health and Damage System

### Step 7.1: Implement Bullet-Player Collision
**Goal:** Detect when bullets hit players.

**Instructions:**
1. Add physics overlap between bullet group and player sprite
2. When local player is hit by opponent bullet, log to console
3. Destroy the bullet on impact
4. Flash the player sprite briefly (visual feedback)
5. Do NOT apply damage yet - just detection

**Test:**
- Two players in match
- Player 1 shoots at player 2
- When bullet touches player 2, bullet disappears
- Player 2's sprite flashes briefly
- Console logs: "Player hit!"
- Bullets should not hit the player who fired them

---

### Step 7.2: Add Health Points System
**Goal:** Track player HP and apply damage.

**Instructions:**
1. Add `hp` property to player, initialized to 100
2. On bullet hit, subtract 25 HP (4 hits to kill)
3. Display HP bar above player sprite (green rectangle that shrinks)
4. When HP hits 0, player enters "dead" state
5. Emit `player-hit` event to server with new HP value

**Test:**
- Start with HP at 100, health bar full
- Get hit once - HP becomes 75, health bar 75% full
- Get hit twice more - HP at 25, health bar 25% full
- Get hit 4th time - HP becomes 0, health bar empty
- Server logs show HP updates
- Health bar visually matches HP percentage

---

### Step 7.3: Implement Respawn Mechanic
**Goal:** Reset player after death.

**Instructions:**
1. When HP reaches 0, freeze player controls for 2 seconds
2. Teleport player to a random spawn point (choose from 3 fixed positions)
3. Reset HP to 100
4. Reset ammo to 6
5. Make player invulnerable for 1 second after respawn (flashing effect)

**Test:**
- Reduce HP to 0
- Player should freeze and become semi-transparent
- After 2 seconds, player appears at new position
- HP bar is full again
- Player flashes for 1 second
- During flash, bullets pass through (no damage)
- After 1 second, player is vulnerable again

---

### Step 7.4: Track Kill Count
**Goal:** Count eliminations and display them.

**Instructions:**
1. Add `kills` property to local player, initialized to 0
2. When opponent's HP reaches 0, increment local player kills
3. Display kill count in top-right corner: "Kills: X"
4. Listen for `kill-event` from server with killer and victim addresses
5. Show kill feed message: "[Player] eliminated [Player]"

**Test:**
- Eliminate opponent - local kill count increases to 1
- Kill feed shows correct message
- Eliminate opponent 2 more times - count shows 3
- Server receives and broadcasts kill events
- Both players see the same kill feed messages

---

## Phase 8: Match Flow

### Step 8.1: Implement Match Timer
**Goal:** Add 60-second countdown timer.

**Instructions:**
1. When `match-found` event received, store match start time
2. Display countdown timer at top-center: "0:60"
3. Update every second
4. Format as "M:SS" (minutes:seconds)
5. When timer hits 0:00, disable player controls

**Test:**
- Start a match
- Timer should show "1:00" initially
- Timer counts down: "0:59", "0:58", etc.
- At "0:00", timer stops
- Player cannot move or shoot after timer reaches zero
- Timer is synchronized (both players see same countdown)

---

### Step 8.2: Handle Match Start
**Goal:** Properly initialize when match begins.

**Instructions:**
1. Create a pre-match "waiting" screen overlay
2. When `match-found` event received, show "Match Starting..." for 3 seconds
3. Display opponent's username
4. After 3 seconds, remove overlay and enable controls
5. Start the timer at this point

**Test:**
- Join match queue
- When matched, see waiting overlay with opponent name
- Controls should be disabled during countdown
- After 3 seconds, overlay disappears
- Player can immediately move and shoot
- Timer starts counting down from 60

---

### Step 8.3: Determine Match Winner
**Goal:** Identify winner when match ends.

**Instructions:**
1. Listen for `match-ended` Socket event
2. Event contains: winner address, both players' kills/deaths, match duration
3. Compare winner address to local player address
4. Display "Victory!" or "Defeat!" overlay based on result
5. Show final stats: kills, deaths, match duration

**Test:**
- Play a match to completion (60 seconds or 3 kills)
- Winner sees "Victory!" overlay
- Loser sees "Defeat!" overlay
- Both see accurate kill/death stats
- Match duration is displayed correctly
- Cannot move or shoot after match ends

---

### Step 8.4: Return to Lobby After Match
**Goal:** Allow players to queue for next match.

**Instructions:**
1. On match end screen, show "Return to Lobby" button
2. When clicked, disconnect from current Socket events
3. Navigate back to lobby/queue page
4. Reset all game state: HP, kills, ammo
5. Player can click "Find Match" again

**Test:**
- Complete a match
- Click "Return to Lobby" button
- Should navigate to lobby page
- "Find Match" button is clickable
- Click "Find Match" - can enter queue again
- Joining new match starts fresh (0 kills, 100 HP)

---

## Phase 9: Blockchain Integration

### Step 9.1: Connect Wallet
**Goal:** Get player's wallet address before matching.

**Instructions:**
1. In lobby, check if wallet is connected using wagmi hooks
2. If not connected, show "Connect Wallet" button
3. Use wallet connect flow to get address
4. Display connected address (truncated): "0x1234...5678"
5. Only enable "Find Match" button when wallet is connected

**Test:**
- Open app with no wallet connected
- "Find Match" button should be disabled
- "Connect Wallet" button is visible
- Click "Connect Wallet" and approve in MetaMask
- Address appears on screen
- "Find Match" button becomes enabled
- Correct address is stored in component state

---

### Step 9.2: Create Contract Hook
**Goal:** Set up contract interaction utilities.

**Instructions:**
1. Create new file: `lib/contracts/escrow.ts`
2. Define the contract ABI (copy from compiled contract)
3. Export contract address from environment variable
4. Create wagmi hooks for contract functions: `deposit`, `claimPrize`, `getMatch`
5. Export these hooks for use in components

**Test:**
- Import the hooks in any component
- Hooks should not throw errors
- Contract address should match deployed contract
- ABI should include all expected functions
- TypeScript types should be correct (if using TypeScript)

---

### Step 9.3: Implement Entry Fee Deposit
**Goal:** Players deposit ETH before match starts.

**Instructions:**
1. After `match-found` event, show deposit confirmation modal
2. Modal displays: "Deposit 0.001 ETH to play"
3. Show "Confirm" button that calls contract `deposit()` function
4. Pass the matchId (received from server) as bytes32
5. Send 0.001 ETH with the transaction
6. Show loading state while transaction is pending
7. On success, enable game start
8. On failure, show error and return to queue

**Test:**
- Match found, deposit modal appears
- Click "Confirm Deposit"
- MetaMask opens with transaction
- Transaction shows 0.001 ETH amount
- Approve transaction
- Modal shows "Waiting for confirmation..."
- After confirmation, modal closes
- Game can start
- Check contract on BaseScan - should show deposit transaction

---

### Step 9.4: Implement Prize Claim
**Goal:** Winner can claim the pot after match.

**Instructions:**
1. On "Victory!" screen, show "Claim Prize" button
2. Display prize amount: "0.002 ETH"
3. On click, call contract `claimPrize()` function with matchId
4. Show loading state during transaction
5. On success, show "Prize Claimed!" message
6. On failure, show error but allow retry
7. Disable button after successful claim

**Test:**
- Win a match (both players have deposited)
- See "Claim Prize" button on victory screen
- Click button
- MetaMask opens for transaction approval
- Approve transaction
- Button shows loading state
- After confirmation, see success message
- Button becomes disabled
- Check wallet balance - should increase by 0.002 ETH
- Check contract on BaseScan - prize should be marked as claimed

---

## Phase 10: Integration Testing

### Step 10.1: Full Match Flow Test
**Goal:** Validate complete gameplay loop.

**Instructions:**
1. Open two browser windows (different wallets)
2. Connect wallets in both windows
3. Both click "Find Match"
4. Both confirm deposit transactions
5. Play the match - shoot, move, get kills
6. Match ends naturally (timer or kill limit)
7. Winner claims prize
8. Both return to lobby

**Test Checklist:**
- [ ] Wallets connect successfully
- [ ] Matchmaking pairs both players
- [ ] Deposit transactions confirm
- [ ] Game starts after deposits
- [ ] Both players can move
- [ ] Both players can shoot
- [ ] Bullets damage opponents
- [ ] HP updates correctly
- [ ] Kills are tracked
- [ ] Timer counts down
- [ ] Match ends at 3 kills OR 60 seconds
- [ ] Correct winner is declared
- [ ] Winner can claim prize
- [ ] Prize transaction succeeds
- [ ] Can return to lobby and re-queue

---

### Step 10.2: Disconnection Handling Test
**Goal:** Verify graceful handling of network issues.

**Instructions:**
1. Start a match between two players
2. Have one player close their browser tab mid-match
3. Other player should see "Opponent Disconnected" message
4. Match should end
5. Remaining player should be able to return to lobby
6. Backend should clean up match state

**Test Checklist:**
- [ ] Disconnect is detected within 5 seconds
- [ ] Remaining player sees notification
- [ ] Remaining player can exit cleanly
- [ ] Backend removes match from active matches
- [ ] Backend removes player from queue
- [ ] No memory leaks (check with multiple disconnects)

---

### Step 10.3: Edge Case Testing
**Goal:** Verify system handles edge cases.

**Instructions:**
Test these scenarios:
1. Player tries to deposit wrong amount
2. Player tries to claim prize without winning
3. Two players shoot each other simultaneously
4. Player tries to queue while already in match
5. Player refreshes page during match
6. Match timer hits exactly 0 with tied kills

**Test Checklist:**
- [ ] Wrong deposit amount is rejected by contract
- [ ] Non-winner cannot claim prize
- [ ] Simultaneous kills both register correctly
- [ ] Already-matched player cannot re-queue
- [ ] Refresh disconnects and cleans up properly
- [ ] Tied match determines winner by HP correctly

---

## Success Criteria

When all tests pass, you should have:

✅ **Playable Core Game Loop**
- Two players can match and compete
- Real-time movement and shooting
- Health, damage, and kills work
- 60-second matches or first to 3 kills

✅ **Working Blockchain Integration**
- Entry fee deposits
- Winner-takes-all prize claim
- Wallet connection

✅ **Stable Multiplayer**
- Smooth movement sync
- No major lag or desync
- Disconnection handling

---

## Next Steps (Post-Base Game)

After completing this plan:
1. Add mobile touch controls (virtual joystick)
2. Implement leaderboard with Redis
3. Add Farcaster social features (login, share)
4. Create better sprites and animations
5. Add sound effects
6. Optimize for mobile performance
7. Deploy to production

---

**Note for AI Developers:**
- Implement each step in order - later steps depend on earlier ones
- Run the test after each step before moving to the next
- If a test fails, fix the issue before proceeding
- Add console logs liberally for debugging
- Commit code after each completed phase

