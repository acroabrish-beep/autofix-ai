import test from 'node:test';
import assert from 'node:assert/strict';
import { equalQuery, tableRowsPath, tableRowPath } from './tablesdb.js';

test('builds Appwrite TablesDB equal query syntax', () => {
  const encoded = equalQuery('userId', 'user-123');
  assert.equal(decodeURIComponent(encoded), 'equal("userId", ["user-123"])');
});

test('encodes query values safely', () => {
  const encoded = equalQuery('email', 'a+b@example.com');
  assert.equal(decodeURIComponent(encoded), 'equal("email", ["a+b@example.com"])');
});

test('rejects invalid column names', () => {
  assert.throws(() => equalQuery('userId) OR true', 'x'), TypeError);
});

test('builds TablesDB row collection paths', () => {
  assert.equal(tableRowsPath('autofix-ai-db', 'profiles'), '/tablesdb/autofix-ai-db/tables/profiles/rows');
});

test('encodes row IDs in TablesDB paths', () => {
  assert.equal(tableRowPath('db', 'profiles', 'user/id'), '/tablesdb/db/tables/profiles/rows/user%2Fid');
});
