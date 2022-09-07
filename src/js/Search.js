/**
 * @class Search
 * @param {String} input - query input DOM element - DOM element
 * @param {String} apiUrl - URL of the search API
 */
export class Search {
  #updEvent;
  #dataVersion;

  constructor({apiUrl}) {
    this._input = document.querySelector('#searchInput');
    this.apiUrl = apiUrl;
    this._data = [];
    this._error = undefined;
    this.#updEvent = new Event('searchDataIsReady');
    this.#dataVersion = 0;

    this._input.addEventListener('input', (e) => {
      if (e.target.value.trim().length === 0) {
        this._data = [];
        document.dispatchEvent(this.#updEvent);
      } else {
        this.fetchData(e.target.value);
      }
    })
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

  /**
   * request data using search string
   * await data with the next structure:
   *  {result: [
   *  {
   * "payload": {
   *   "location": "html > body > div:nth-of-type(1) > section:nth-of-type(2) > div > div > div > article > h3:nth-of-type(4)",
   *  "sections": [
   *    "documentation",
   *    "documentation/quick_start"
   *  ],
   *  "tag": "h3",
   *  "text": "Search with filtering",
   *  "titles": [
   *    "Qdrant - Quick Start",
   *    "Add points"
   *  ],
   *  "url": "https://qdrant.tech/documentation/quick_start/"
   * },
   * "score": 0.96700734
   * },
   * ...
   * ]}
   */
  fetchData(query) {
    if (this.input.value.trim().length === 0) {
      return;
    }
    
    var url = new URL(this.apiUrl, document.location);
    url.searchParams.append('q', this.input.value);

    let reqVersion = this.#dataVersion + 1;

    fetch(url)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          return {result: [], error: res.statusText};
        }
      })
      .then(data => {
        if (reqVersion > this.#dataVersion) {
          this.data = data.result;
          this.#dataVersion = reqVersion;
          this.error = data?.error;
          document.dispatchEvent(this.#updEvent);
        }
      })
      .catch(err => {
        this.error = err.message;
      })
      ;
  }
}
