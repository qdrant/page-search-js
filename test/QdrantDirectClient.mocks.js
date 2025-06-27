export const mockQdrantResponses = {
  searchWithResults: {
    result: {
      points: [
        {
          id: '9743a44d-c338-4230-99fc-a861d07ab663',
          version: 92,
          score: 0.86705697,
          payload: {
            text: 'Vector databases are a type of database designed to store and query high-dimensional vectors',
            titles: ['What is Qdrant? - Qdrant', 'What Are Vector Databases?'],
            url: '/documentation/overview/',
            sections: ['documentation', 'documentation/overview'],
            tag: 'p',
            partition: 'qdrant',
            location: 'html > body > main > section > div > div > div:nth-of-type(2)',
          },
        },
        {
          id: '4cbdcc4c-5f23-40c1-a110-8414b3f3232c',
          version: 92,
          score: 0.86151373,
          payload: {
            text: 'Qdrant is a vector database & vector similarity search engine',
            titles: ['Qdrant Documentation'],
            url: '/documentation/',
            sections: ['documentation'],
            tag: 'h1',
            partition: 'qdrant',
          },
        },
      ],
    },
    status: 'ok',
    time: 0.5806845,
    usage: {
      inference: {
        models: {
          'sentence-transformers/all-minilm-l6-v2': {
            tokens: 4,
          },
        },
      },
    },
  },

  searchSingleResult: {
    result: {
      points: [
        {
          id: 'fd8d49c7-88e7-4050-92d9-0f2dde1214fb',
          version: 110,
          score: 0.8317759,
          payload: {
            text: 'Qdrant is a vector similarity search engine that provides a production-ready service',
            titles: ['Vector Search with Qdrant', 'Getting Started'],
            url: '/documentation/quick-start/',
            sections: ['documentation', 'documentation/quick-start'],
            tag: 'p',
            partition: 'qdrant',
            location: 'html > body > main > section > div > div > article > p:nth-of-type(1)',
          },
        },
      ],
    },
    status: 'ok',
    time: 0.123456,
  },

  emptyResponse: {
    result: {
      points: [],
    },
    status: 'ok',
    time: 0.0234567,
  },

  responseWithMissingFields: {
    result: {
      points: [
        {
          id: 'test-id-1',
          payload: null,
          score: null,
        },
        {
          id: 'test-id-2',
        },
      ],
    },
    status: 'ok',
  },
};

export const mockQdrantQueries = {
  vectorDatabase: {
    query: {
      nearest: {
        text: 'vector database',
        model: 'sentence-transformers/all-minilm-l6-v2',
      },
    },
    limit: 20,
    // biome-ignore lint/style/useNamingConvention: Qdrant API expects snake_case
    with_payload: true,
  },

  withFilters: {
    query: {
      nearest: {
        text: 'test query',
        model: 'sentence-transformers/all-minilm-l6-v2',
      },
    },
    filter: {
      must: [
        { key: 'sections', match: { value: 'documentation' } },
        { key: 'partition', match: { value: 'qdrant' } },
      ],
    },
    limit: 20,
    // biome-ignore lint/style/useNamingConvention: Qdrant API expects snake_case
    with_payload: true,
  },
};

export const mockFetch = (responseData, options = {}) => {
  return async (_url, config) => {
    if (options.delay) {
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, options.delay);
        if (config?.signal) {
          config.signal.addEventListener('abort', () => {
            clearTimeout(timer);
            resolve();
          });
        }
      });
    }

    if (config?.signal?.aborted) {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      throw error;
    }

    if (options.throwError) {
      throw options.throwError;
    }

    return {
      ok: options.status ? options.status >= 200 && options.status < 300 : true,
      status: options.status || 200,
      statusText: options.statusText || 'OK',
      json: async () => {
        if (options.invalidJson) {
          throw new Error('Invalid JSON');
        }
        return responseData || mockQdrantResponses.emptyResponse;
      },
    };
  };
};
