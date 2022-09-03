/**
 * @class Search
 * @param {String} ref - query input DOM element - DOM element
 * @param {String} apiUrl - URL of the search API
 */
export class Search {
  #updEvent;
  #dataVersion;

  constructor({apiUrl}) {
    this.ref = document.querySelector('#searchInput');
    this.apiUrl = apiUrl;
    this.data = [];
    this.#updEvent = new Event('searchDataIsReady');
    this.#dataVersion = 0;

    // listens when user types in the search input
    this.boundEventHandler = this.fetchData.bind(this)
    // todo: only on chars
    this.ref.addEventListener('keyup', (e) => {
      if (/['^+%&/()=?_\-~`;#$½{[\]}\\|<>@,]/gi.test(e.key)) {
        console.log('key')
        this.boundEventHandler();
      }
    })
  }

  get ref() {
    return this._ref;
  }

  set ref(newRef) {
    this._ref = newRef;
  }

  get data() {
    return this._data;
  }

  set data(newData) {
    this._data = newData;
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
  fetchData() {
    console.log('fetch')
    if (this.ref.value.trim().length === 0) {
      return;
    }

    const url = this.apiUrl + '/?q=' + this.ref.value;
    let reqVersion = this.#dataVersion + 1;

    fetch(url)
      .then(res => res.json())
      .then(data => {

        if (reqVersion > this.#dataVersion) {
          this.data = data.result;
          this.#dataVersion = reqVersion;
          document.dispatchEvent(this.#updEvent);
        }
      });
  }
}
