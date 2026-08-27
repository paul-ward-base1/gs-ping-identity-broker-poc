import { describe, it, expect } from 'vitest';
import { normalizeClosingQuestions } from '@/utils/normalizeClosingQuestions';

describe('normalizeClosingQuestions', () => {
  it('returns an empty array for undefined', () => {
    expect(normalizeClosingQuestions(undefined)).toEqual([]);
  });

  it('returns an empty array for an empty string', () => {
    expect(normalizeClosingQuestions('')).toEqual([]);
  });

  it('wraps a single string into an array', () => {
    expect(normalizeClosingQuestions('What did you learn?')).toEqual(['What did you learn?']);
  });

  it('passes a multi-value array through, dropping falsy entries', () => {
    expect(normalizeClosingQuestions(['a', '', 'b'])).toEqual(['a', 'b']);
  });

  it('returns an empty array for an empty array', () => {
    expect(normalizeClosingQuestions([])).toEqual([]);
  });
});
