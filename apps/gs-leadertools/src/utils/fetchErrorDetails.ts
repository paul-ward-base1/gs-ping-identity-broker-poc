type FetchErrorCause = {
  message?: string;
  code?: string;
  syscall?: string;
  address?: string;
  port?: number;
};

export type FetchErrorDetails = {
  message: string;
  code?: string;
  syscall?: string;
  address?: string;
  port?: number;
};

/**
 * Extracts the network-level fields from a TypeError thrown by global fetch().
 *
 * undici (Node's built-in fetch backend) wraps the underlying network error
 * in `err.cause`. JSON-serialising the raw error object loses those fields
 * because they live on a non-enumerable property chain. This helper returns
 * a plain object that can be safely passed to `console.error`/`console.warn`.
 */
export const fetchErrorDetails = (err: unknown): FetchErrorDetails => {
  const e = err as (Error & { cause?: FetchErrorCause }) | null | undefined;
  return {
    message: e?.message ?? String(err),
    code: e?.cause?.code,
    syscall: e?.cause?.syscall,
    address: e?.cause?.address,
    port: e?.cause?.port,
  };
};
