const DEBUG_ENABLED = process.env.DEBUG === 'true';

export function debugLog(source: string, message: string, data?: unknown) {
  if (!DEBUG_ENABLED) return;

  const tag = `[DEBUG:${source.toUpperCase()}]`;

  if (data !== undefined) {
    console.log(tag, message, data);
  } else {
    console.log(tag, message);
  }
}
