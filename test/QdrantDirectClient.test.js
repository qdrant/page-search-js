import assert from 'node:assert';
import { QdrantDirectClient } from '../src/js/QdrantDirectClient.js';
import { mockFetch, mockQdrantResponses } from './QdrantDirectClient.mocks.js';

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

let mockFetchImpl = null;
global.fetch = (...args) => {
  if (!mockFetchImpl) {
    throw new Error('fetch not mocked for this test');
  }
  return mockFetchImpl(...args);
};
test('constructor: should require qdrantUrl and collectionName', () => {
  assert.throws(() => new QdrantDirectClient({}), /qdrantUrl is required/);

  assert.throws(
    () => new QdrantDirectClient({ qdrantUrl: 'http://localhost:6333' }),
    /collectionName is required/
  );
});
test('buildFilter: should correctly build filters for all scenarios', () => {
  const client = new QdrantDirectClient({
    qdrantUrl: 'http://localhost:6333',
    collectionName: 'test',
  });
  assert.deepStrictEqual(client.buildFilter('documentation', 'qdrant'), {
    must: [
      { key: 'sections', match: { value: 'documentation' } },
      { key: 'partition', match: { value: 'qdrant' } },
    ],
  });
  assert.deepStrictEqual(client.buildFilter('documentation', null), {
    must: [{ key: 'sections', match: { value: 'documentation' } }],
  });
  assert.strictEqual(client.buildFilter(null, null), null);
});
test('transformResponse: should correctly transform Qdrant response', () => {
  const client = new QdrantDirectClient({
    qdrantUrl: 'http://localhost:6333',
    collectionName: 'test',
  });
  const result1 = client.transformResponse(
    mockQdrantResponses.searchWithResults,
    'vector database'
  );
  assert.strictEqual(result1.result.length, 2);
  assert.strictEqual(result1.result[0].score, 0.86705697);
  assert(typeof result1.result[0].highlight === 'string');
  const result2 = client.transformResponse(mockQdrantResponses.responseWithMissingFields, 'query');
  assert.strictEqual(result2.result[0].score, 0);
  assert.strictEqual(result2.result[0].highlight, '');
  assert.deepStrictEqual(client.transformResponse(null, 'query'), {
    result: [],
  });
});
test('search: should validate query input', async () => {
  const client = new QdrantDirectClient({
    qdrantUrl: 'http://localhost:6333',
    collectionName: 'test',
  });

  await assert.rejects(client.search(''), /Query must be a non-empty string/);

  await assert.rejects(client.search(null), /Query must be a non-empty string/);
});
test('search: should successfully perform search', async () => {
  mockFetchImpl = mockFetch(mockQdrantResponses.searchSingleResult);

  const client = new QdrantDirectClient({
    qdrantUrl: 'http://localhost:6333',
    collectionName: 'site',
  });

  const result = await client.search('vector search');

  assert.strictEqual(result.result.length, 1);
  assert.strictEqual(result.result[0].score, 0.8317759);
  assert(typeof result.result[0].highlight === 'string');
});
test('search: should correctly build request with filters and headers', async () => {
  let capturedUrl = null;
  let capturedBody = null;
  let capturedHeaders = null;

  mockFetchImpl = async (url, config) => {
    capturedUrl = url;
    capturedBody = JSON.parse(config.body);
    capturedHeaders = config.headers;
    return mockFetch(mockQdrantResponses.emptyResponse)(url, config);
  };

  const client = new QdrantDirectClient({
    qdrantUrl: 'http://localhost:6333',
    collectionName: 'site',
    apiKey: 'test-api-key',
  });

  await client.search('test query', 'documentation', 'qdrant');
  assert.strictEqual(capturedUrl, 'http://localhost:6333/collections/site/points/query');
  assert.strictEqual(capturedBody.query.nearest.text, 'test query');
  assert.strictEqual(capturedBody.query.nearest.model, 'sentence-transformers/all-minilm-l6-v2');
  assert.deepStrictEqual(capturedBody.filter.must[0], {
    key: 'sections',
    match: { value: 'documentation' },
  });
  assert.strictEqual(capturedHeaders['api-key'], 'test-api-key');
  assert.strictEqual(capturedHeaders['Content-Type'], 'application/json');
});
test('search: should handle all error scenarios', async () => {
  const client = new QdrantDirectClient({
    qdrantUrl: 'http://localhost:6333',
    collectionName: 'test',
  });
  mockFetchImpl = mockFetch(null, { throwError: new Error('Network error') });
  await assert.rejects(client.search('test'), /Query error: Network error/);
  mockFetchImpl = mockFetch(null, { status: 404, statusText: 'Not Found' });
  await assert.rejects(client.search('test'), /Query failed: 404 Not Found/);
  mockFetchImpl = mockFetch(null, { invalidJson: true });
  await assert.rejects(client.search('test'), /Query error: Invalid JSON/);
});
async function runTests() {
  console.log('Running optimized QdrantDirectClient tests...\n');
  let passed = 0;
  let failed = 0;

  for (const { name, fn } of tests) {
    try {
      mockFetchImpl = null;

      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${name}`);
      console.log(`  ${error.message}`);
      if (error.stack) {
        console.log(`  ${error.stack.split('\n').slice(1, 3).join('\n')}`);
      }
      console.log('');
      failed++;
    }
  }

  console.log(`\nTests: ${passed} passed, ${failed} failed, ${tests.length} total`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
