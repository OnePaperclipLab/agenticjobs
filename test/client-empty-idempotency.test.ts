import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiError, BoardClient } from '../dist/client/client.js';

for (const key of ['', '   ']) {
  test(`a write with a blank idempotency key ${JSON.stringify(key)} is not retried`, async () => {
    let calls = 0;
    const client = new BoardClient('https://board.test', {
      fetch: async () => {
        calls += 1;
        // The server may have written the listing before the response was lost.
        // Empty headers do not activate its idempotency protection.
        const error = new Error('response lost');
        error.name = 'AbortError';
        throw error;
      },
    });
    await assert.rejects(
      client.postJob({ org: 'acme', title: 'A role' }, { idempotencyKey: key }),
      (error: unknown) => error instanceof ApiError && error.code === 'timeout',
    );
    assert.equal(calls, 1, 'do not repeat a possibly completed unprotected write');
  });
}
