// Socket.io client singleton for game server connection
import { io, Socket } from 'socket.io-client';

const GAME_SERVER_URL = process.env.NEXT_PUBLIC_GAME_SERVER_URL || 'http://localhost:3001';

let socket: Socket | null = null;
let isInitialized = false;

/**
 * Get or create the socket instance
 */
export function getSocket(): Socket {
  if (typeof window === 'undefined') {
    // Return a dummy socket for SSR
    return null as any;
  }

  if (!socket || !socket.connected) {
    console.log('🔌 Creating/reconnecting socket to:', GAME_SERVER_URL);
    
    // If socket exists but disconnected, try to reconnect
    if (socket && !socket.connected) {
      console.log('🔄 Reconnecting existing socket...');
      socket.connect();
      return socket;
    }
    
    // Create new socket
    socket = io(GAME_SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 10000,
      withCredentials: true,
      forceNew: false  // Reuse existing connection
    });

    if (!isInitialized) {
      // Connection event listeners (only set once)
      socket.on('connect', () => {
        console.log('✅ Connected to game server:', socket?.id);
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from game server:', reason);
      });

      socket.on('connect_error', (error) => {
        console.error('🔴 Connection error:', error.message);
      });
      
      isInitialized = true;
    }
  }

  console.log('🔌 Returning socket, connected:', socket.connected, 'id:', socket.id);
  return socket;
}

/**
 * Disconnect and cleanup socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default getSocket;

