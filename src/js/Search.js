import { QdrantDirectClient } from "./QdrantDirectClient.js";

/**
 * @class Search
 * @param {Object} config - Configuration object
 * @param {string} [config.section] - Optional section filter
 * @param {string} [config.partition] - Optional partition filter
 * @param {Object} config.qdrantConfig - Qdrant client configuration
 */
export class Search {
  #updEvent;
  #dataVersion;
  #reqVersion;
  #debounceTimer;

  constructor({ section, partition, qdrantConfig }) {
    if (!qdrantConfig) {
      throw new Error("qdrantConfig is required");
    }

    this._input = document.querySelector("#searchInput");
    this.section = section;
    this.partition = partition;
    this._data = [];
    this._error = undefined;
    this.#updEvent = new Event("searchDataIsReady");
    this.#dataVersion = 0;
    this.#reqVersion = 0;
    this.#debounceTimer = null;

    this.qdrantClient = new QdrantDirectClient(qdrantConfig);

    this._input.addEventListener("input", (e) => {
      if (e.target.value.trim().length === 0) {
        this.clearDebounceTimer();
        this._data = [];
        document.dispatchEvent(this.#updEvent);
      } else {
        this.fetchData(e.target.value);
      }
    });
  }

  get input() {
    return this._input;
  }

  set input(newInput) {
    this._input = newInput;
  }

  get data() {
    return this._data;
  }

  set data(newData) {
    this._data = newData;
  }

  get error() {
    return this._error;
  }

  set error(newError) {
    this._error = newError;
  }

  fetchData(query) {
    if (this.input.value.trim().length === 0) {
      return;
    }

    const reqVersion = this.#reqVersion + 1;
    this.#reqVersion += 1;

    // Clear previous timer
    this.clearDebounceTimer();
    
    // Set new timer to make sure it will active since last key-press instead of first
    this.#debounceTimer = setTimeout(() => {
      if (this.#reqVersion <= reqVersion) {
        this.fetchDataFromQdrant(query, reqVersion);
      }
    }, 100);
  }

  clearDebounceTimer() {
    if (this.#debounceTimer) {
      clearTimeout(this.#debounceTimer);
      this.#debounceTimer = null;
    }
  }

  async fetchDataFromQdrant(query, reqVersion) {
    try {
      const response = await this.qdrantClient.search(
        query,
        this.section,
        this.partition,
      );
      if (reqVersion > this.#dataVersion) {
        this.#dataVersion = reqVersion;
        this.data = response.result;
        this.error = undefined;
        document.dispatchEvent(this.#updEvent);
      }
    } catch (err) {
      this.error = err.message;
      this.data = [];
      document.dispatchEvent(this.#updEvent);
    }
  }

}
