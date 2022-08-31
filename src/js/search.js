(function () {
  // Modal markup string
//   const innerModalHtml = `<div class="modal fade qdr-search" id="searchModal" data-bs-keyboard="true" tabindex="-1"
//      aria-labelledby="searchModalLabel" aria-hidden="true">
//     <div class="modal-dialog modal-dialog-scrollable modal-lg qdr-search__dialog">
//         <div class="modal-content">
//
//             <div class="modal-header qdr-search__header">
//                 <div class="modal-title input-group">
//                     <div class="input-group-append">
//                         <span class="input-group-text qdr-search__icon" id="basic-addon2">
//                             <i class="fa fa-search"></i>
//                         </span>
//                     </div>
//                     <input type="text" class="form-control qdr-search__input" placeholder="Search..."
//                            id="searchInput" aria-label="Search">
//                 </div>
//
//                 <button type="button" class="close qdr-search__close" data-bs-dismiss="modal" aria-label="Close">
//                     <span aria-hidden="true">&times;</span>
//                 </button>
//             </div>
//
//             <div class="modal-body qdr-search__results"></div>
//
//             <div class="modal-footer qdr-search__footer">
//                 Powered by
//                 <span class="qdr-search__logo"></span>
//             </div>
//         </div>
//     </div>
// </div>`;

  const innerModalHtml = `<div class="qdr-search" id="searchModal" tabindex="-1"
     aria-labelledby="searchModalLabel" aria-hidden="true">
     <div class="qdr-search__dialog">
         <div class="qdr-search__content">
             <div class="qdr-search__header">
                 <div class="qdr-search__title">
                     <div class="qdr-search__icon">
                         <span class="search-icon"></span>
                     </div>
                     <input type="text" class="qdr-search__input" placeholder="Search..."
                            id="searchInput" aria-label="Search">
                 </div>

                 <button type="button" class="qdr-search__close" aria-label="Close">
                     <span aria-hidden="true">&times;</span>
                 </button>
             </div>

             <div class="qdr-search__results"></div>

             <div class="qdr-search__footer">
                 Powered by
                 <span class="qdr-search__logo"></span>
             </div>
         </div>
     </div>
 </div>`;

  /**
   * Maces DOM node from html string
   * @param {string} htmlString
   * @return {ChildNode}
   */
  function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstElementChild;
  }

  // add modal markup to the page
  document.body.appendChild(createElementFromHTML(innerModalHtml));

  /**
   * @class Modal Window
   * @param {Object} {modalOuterSelector, modalDialogSelector, closeBtnSelector, bodySelector}
   */
  class Modal {
    #showEvent
    #hideEvent

    constructor({modalOuterSelector, modalDialogSelector, closeBtnSelector, resultSelector}) {
      // an outer element
      this.modal = document.querySelector(modalOuterSelector);
      // an outer element - a dialog window
      this.dialog = document.querySelector(modalDialogSelector);
      this.openBtn = document.querySelector('[data-target="#searchModal"]');
      this.closeBtn = this.modal.querySelector(closeBtnSelector);
      this.result = this.modal.querySelector(resultSelector);
      console.log('result', this.result);

      // events
      this.#showEvent = new Event('qdrModalShow');
      this.#hideEvent = new Event('qdrModalHide');

      this.boundEventHandler1 = this.show.bind(this)
      this.boundEventHandler2 = this.hide.bind(this)

      // listens for clicks on the open button
      this.openBtn.addEventListener('click', this.boundEventHandler1);

      // listens for clicks on the modal
      this.modal.addEventListener('click', (e) => {
        const isClickInsideDialog = this.dialog.contains(e.target) || e.target === this.dialog;
        const isClickInsideCloseBtn = this.closeBtn.contains(e.target) || e.target === this.closeBtn;

        // if clicked on the close button or outside of the dialog block
        if (!isClickInsideDialog || isClickInsideCloseBtn) {
          this.boundEventHandler2(e);
        }
      });

      // listens for the Esc button is pressed
      document.addEventListener('keydown', (e) => {
        console.log('esc')
        if (e.key === "Escape") {
          console.log('esc2')
          // write your logic here.
          this.boundEventHandler2(e);
        }
      })

    }

    show() {
      this.modal.style.display = 'block';
      this.modal.classList.add('active');
      document.dispatchEvent(this.#showEvent);
    }

    hide() {
      const modal = this.modal;
      const myEvent = this.#hideEvent;
      modal.classList.remove('active');
      const t = setTimeout(function () {
        modal.style.display = 'none';
        document.dispatchEvent(myEvent);
        clearTimeout(t);
      }, 300)
    }

    /**
     * @param {Array} newResultChildren - array of DOM Nodes
     */
    updateResultChildren(newResultChildren) {
      this.result.replaceChildren(...newResultChildren);
    }

  }

  /**
   * @class Search
   * @param {String} ref - query input DOM element - DOM element
   * @param {String} apiUrl - URL of the search API
   */
  class Search {
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
      this.ref.addEventListener('keyup', this.boundEventHandler)
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

  class SearchModal {
    constructor({searchApiUrl}) {
      this.apiUrl = searchApiUrl;
      this.modal = new Modal({
        modalOuterSelector: '#searchModal',
        modalDialogSelector: '.qdr-search__dialog',
        closeBtnSelector: '.qdr-search__close',
        resultSelector: '.qdr-search__results'
      });
      this.searchInput = new Search({apiUrl: this.apiUrl})

      // when a search modal is shown
      this.boundEventHandler1 = this.setFocus.bind(this)
      document.addEventListener('qdrModalShow', this.boundEventHandler1);

      // when new search data if ready to be shown
      this.boundEventHandler2 = this.updateResult.bind(this)
      document.addEventListener('searchDataIsReady', this.boundEventHandler2);
    }

    /**
     * adds an encoded in base64 selector to the url
     * @param data
     * @return {string}
     */
    generateUrlWithSelector (data) {
      // todo: remove replace
      const url = new URL(data?.payload?.url.replace('https://qdrant.tech', 'http://localhost:1313'));
      url.searchParams.append('selector', btoa(data?.payload?.location));

      return url.toString();
    }

    /**
     * generates DOM element (<a>) with inner HTML for one result
     * @param data - an object for one result
     * @return {HTMLAnchorElement}
     */
    generateSearchResult (data) {
      const resultElem = document.createElement('a');
      resultElem.classList.add('media', 'qdr-search-result');
      resultElem.href = this.generateUrlWithSelector(data);
      resultElem.innerHTML = `<span class="align-self-center qdr-search-result__icon"><i class="fas fa-file-alt"></i></span>
                   <div class="media-body"><h5 class="mt-0">${data.payload.titles.join(' > ')}</h5>
                   <p>${data.payload.text}</p></div>`;
      return resultElem;
    }

    updateResult() {
      const newResultChildren = [];
      this.searchInput.data.forEach(res => {
        newResultChildren.push(this.generateSearchResult(res));
      });
      this.modal.updateResultChildren(newResultChildren);
    }

    setFocus() {
      this.searchInput.ref.focus();
    }
  }

  setTimeout(() => {

  new SearchModal({searchApiUrl: 'temp/data.json'});
  }, 3000)
})();


