// Runs once per server process on boot; warms each task's image cache.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.IMAGE_WARM_ON_STARTUP === 'false') return;

  const { warmImageCaches } = await import('@/utils/warmImageCaches');
  warmImageCaches().catch(err => console.error('[startup] image warm-up error:', err));
}
