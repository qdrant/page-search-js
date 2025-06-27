/**
 * Direct client for Qdrant vector database using Query API with inference integration
 * @class QdrantDirectClient
 */
export class QdrantDirectClient {
  /**
   * @param {Object} config - Configuration object
   * @param {string} config.qdrantUrl - Qdrant server URL
   * @param {string} config.collectionName - Name of the collection
   * @param {string} [config.apiKey] - Optional API key for authentication
   */
  constructor(config) {
    if (!config.qdrantUrl) {
      throw new Error('qdrantUrl is required in config');
    }
    if (!config.collectionName) {
      throw new Error('collectionName is required in config');
    }

    this.qdrantUrl = config.qdrantUrl.replace(/\/$/, '');
    this.collectionName = config.collectionName;
    this.apiKey = config.apiKey;
    this.timeout = 30000;
  }

  /**
   * Search in Qdrant using Query API with inference
   * @param {string} query - Search query text
   * @param {string} [section] - Optional section filter
   * @param {string} [partition] - Optional partition filter
   * @returns {Promise<Object>} Search results in legacy API format
   */
  async search(query, section, partition) {
    if (!query || typeof query !== 'string') {
      throw new Error('Query must be a non-empty string');
    }

    // Clean and validate query
    const cleanedQuery = query.trim();

    // Check if query is too short
    if (cleanedQuery.length < 1) {
      return { result: [] };
    }

    // Check if query contains only punctuation/special chars
    if (!/[a-zA-Z0-9]/.test(cleanedQuery)) {
      return { result: [] };
    }

    const queryRequest = {
      query: {
        nearest: {
          text: cleanedQuery,
          model: 'sentence-transformers/all-minilm-l6-v2',
        },
      },
      filter: this.buildFilter(section, partition),
      limit: 20,
      // biome-ignore lint/style/useNamingConvention: Qdrant API expects snake_case
      with_payload: true,
    };

    const url = `${this.qdrantUrl}/collections/${this.collectionName}/points/query`;

    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['api-key'] = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(queryRequest),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Query failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformResponse(data, cleanedQuery);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Query request timed out after 30 seconds');
      }

      throw new Error(`Query error: ${error.message}`);
    }
  }

  /**
   * Build filter object for Qdrant query
   * @param {string} [section] - Section to filter by
   * @param {string} [partition] - Partition to filter by
   * @returns {Object|null} Filter object or null if no filters
   */
  buildFilter(section, partition) {
    const conditions = [];

    if (section) {
      conditions.push({
        key: 'sections',
        match: { value: section },
      });
    }

    if (partition) {
      conditions.push({
        key: 'partition',
        match: { value: partition },
      });
    }

    return conditions.length > 0 ? { must: conditions } : null;
  }

  /**
   * Transform Qdrant response to legacy API format
   * @param {Object} qdrantResponse - Response from Qdrant
   * @param {string} query - Original query
   * @returns {Object} Response in legacy format
   */
  transformResponse(qdrantResponse, query) {
    if (!qdrantResponse || !qdrantResponse.result || !qdrantResponse.result.points) {
      return { result: [] };
    }

    // Post-filter results to remove noise
    const filteredResults = qdrantResponse.result.points
      .filter((point) => {
        const text = point.payload?.text || '';

        // Skip empty or very short text
        if (text.length < 10) {
          return false;
        }

        // Skip if text is mostly punctuation
        const alphanumericRatio = (text.match(/[a-zA-Z0-9]/g) || []).length / text.length;
        if (alphanumericRatio < 0.5) {
          return false;
        }

        // For short queries, require higher relevance score
        if (query.length <= 3 && point.score < 0.7) {
          return false;
        }

        return true;
      })
      .slice(0, 10); // Limit to top 10 results after filtering (make it configurable?)

    const transformedResults = filteredResults.map((point) => ({
      payload: point.payload || {},
      score: point.score || 0,
      highlight: this.truncateText(point.payload?.text || ''),
    }));

    return { result: transformedResults };
  }

  /**
   * Truncate text to maximum length with ellipsis
   * @private
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncateText(text, maxLength = 200) {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.substring(0, maxLength)}...`;
  }
}
