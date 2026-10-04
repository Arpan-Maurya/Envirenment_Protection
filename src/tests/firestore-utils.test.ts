import { describe, it, expect, vi } from 'vitest';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

describe('firestore-utils', () => {
  it('logs errors safely', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => handleFirestoreError(new Error('test'), OperationType.GET, 'path')).toThrow();
    consoleSpy.mockRestore();
  });
});
