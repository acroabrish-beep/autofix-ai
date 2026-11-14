import test from 'node:test';
import assert from 'node:assert/strict';
import { getAuthenticatedAccount } from '../auth.js';

test('does not trust x-appwrite-user-id without an injected JWT', async () => {
  let called = false;
  const account = await getAuthenticatedAccount(
    { headers: { 'x-appwrite-user-id': 'forged-user' } },
    { projectId: 'test-project', fetchImpl: async () => { called = true; } }
  );
  assert.equal(account, null);
  assert.equal(called, false);
});

test('resolves identity from Appwrite account endpoint using the injected JWT', async () => {
  const account = await getAuthenticatedAccount(
    { headers: { 'x-appwrite-user-jwt': 'signed-jwt' } },
    {
      projectId: 'test-project',
      fetchImpl: async (url, options) => {
        assert.equal(url, 'https://fra.cloud.appwrite.io/v1/account');
        assert.equal(options.headers['X-Appwrite-JWT'], 'signed-jwt');
        return new Response(JSON.stringify({ $id: 'verified-user' }), { status: 200 });
      },
    }
  );
  assert.equal(account.$id, 'verified-user');
});
