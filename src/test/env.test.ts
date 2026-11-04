import { describe, it, expect } from 'vitest';

describe('Environment Verification', () => {
  it('should work with a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to jsdom', () => {
    const element = document.createElement('div');
    element.innerHTML = 'Hello Vitest';
    expect(element.innerHTML).toBe('Hello Vitest');
  });
});
