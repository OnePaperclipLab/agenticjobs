import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BoardClient } from '../dist/client/client.js';

test('network search treats explicitly undefined optional filters as omitted', async () => {
  const requests: string[] = [];
  const client = new BoardClient('https://board.test', {
    fetch: async (input) => {
      requests.push(String(input));
      return Response.json({ items: [] });
    },
  });
  await client.searchNetwork({ q: 'typescript' });
  await client.searchNetwork({
    q: 'typescript',
    tags: undefined,
    salaryMin: undefined,
    sort: undefined,
    limit: undefined,
    offset: undefined,
  });
  assert.equal(requests.length, 2);
  assert.equal(requests[1], requests[0]);
});

test('network search preserves explicit filters and zero salary', async () => {
  let requested = '';
  const client = new BoardClient('https://board.test', {
    fetch: async (input) => {
      requested = String(input);
      return Response.json({ items: [] });
    },
  });
  await client.searchNetwork({
    tags: ['typescript'],
    salaryMin: 0,
    sort: 'salary',
    limit: 10,
    offset: 5,
  });
  const url = new URL(requested);
  assert.equal(url.pathname, '/api/v1/directory/search');
  assert.equal(url.searchParams.get('tags'), 'typescript');
  assert.equal(url.searchParams.get('salaryMin'), '0');
  assert.equal(url.searchParams.get('sort'), 'salary');
  assert.equal(url.searchParams.get('limit'), '10');
  assert.equal(url.searchParams.get('offset'), '5');
});
