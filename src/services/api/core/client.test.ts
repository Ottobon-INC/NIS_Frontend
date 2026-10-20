import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { getAuthToken, setAuthToken, ApiError } from './client.ts';

describe('API Client Authentication Security', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset any mock tokens
    setAuthToken(null);
  });

  afterEach(() => {
    process.env = originalEnv;
    setAuthToken(null);
  });

  it('defaults to mock-admin-token in local development/test', () => {
    const token = getAuthToken();
    assert.equal(token, 'Bearer mock-admin-token');
  });

  it('prefers stored token from setAuthToken / localStorage', () => {
    setAuthToken('my-secret-jwt');
    const token = getAuthToken();
    assert.equal(token, 'Bearer my-secret-jwt');
  });

  it('preserves Bearer prefix if already present in stored token', () => {
    setAuthToken('Bearer existing-token');
    const token = getAuthToken();
    assert.equal(token, 'Bearer existing-token');
  });

  it('clears stored token when setAuthToken(null) is called', () => {
    setAuthToken('temp-jwt');
    assert.equal(getAuthToken(), 'Bearer temp-jwt');
    setAuthToken(null);
    assert.equal(getAuthToken(), 'Bearer mock-admin-token');
  });

  it('ApiError preserves status and detail payload', () => {
    const err = new ApiError(401, 'Unauthorized', { code: 'AUTH_FAILED' });
    assert.equal(err.status, 401);
    assert.equal(err.message, 'Unauthorized');
    assert.deepEqual(err.data, { code: 'AUTH_FAILED' });
  });
});
