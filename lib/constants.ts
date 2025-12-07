export const MESSAGE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 day

// Get APP_URL from environment with fallback
const APP_URL: string = 
  process.env.NEXT_PUBLIC_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '') ||
  'http://localhost:3000';

// Warn if using fallback (but don't throw error during build)
if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_URL && !process.env.NEXT_PUBLIC_VERCEL_URL) {
  console.warn('⚠️ NEXT_PUBLIC_URL is not set, using fallback:', APP_URL);
}

export { APP_URL };
