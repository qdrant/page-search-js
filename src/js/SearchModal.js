import {generateUrlWithSelector} from "./helpers";
import {ModalWindow} from "./ModalWindow";
import {Search} from "./Search";

export class SearchModal {
  constructor({searchApiUrl}) {
    this.apiUrl = searchApiUrl;
    this.modal = new ModalWindow({
      modalOuterSelector: '#searchModal',
      modalDialogSelector: '.qdr-search__dialog',
      closeBtnSelector: '.qdr-search__close',
      resultSelector: '.qdr-search__results',
    });
    this.searchInput = new Search({apiUrl: this.apiUrl})
    this.activeResultIdx = null;

    // when a search modal is shown
    document.addEventListener('qdrModalShow', this.setFocusToInput.bind(this));

    // when new search data if ready to be shown
    document.addEventListener('searchDataIsReady', this.updateResult.bind(this));

    // when arrows up or down pressed
    const navigateTroughResultsHandler = this.navigateTroughResults.bind(this)
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        navigateTroughResultsHandler(e);
      }
    });
  }

  set activeResultIdx(newIdx) {
    this._activeResultIdx = newIdx;
  }

  get activeResultIdx() {
    return this._activeResultIdx;
  }

  /**
   * generates DOM element (<a>) with inner HTML for one result
   * @param data - an object for one result
   * @return {HTMLAnchorElement}
   */
  generateSearchResult(data) {
    const resultElem = document.createElement('a');
    resultElem.classList.add('qdr-search-result');
    resultElem.target = '_blank';
    resultElem.href = generateUrlWithSelector(data);

    const iconClass = data.payload.tag === "p" ? "qdr-search-result__icon" : "qdr-search-result__paragraph-icon";

    resultElem.innerHTML = `<span class="${iconClass}"></span>
                   <div class="qdr-search-result__body"><h5 class="mt-0">${data?.highlight || data.payload.text}</h5>
                   <p>${data.payload.titles.join(' > ')}</p></div>`;
    return resultElem;
  }

  updateResult() {
    const newResultChildren = [];
    this.activeResultIdx = null;
    this.searchInput.data.forEach((result, i) => {
      const resultElement = this.generateSearchResult(result);
      resultElement.dataset.key = i;
      newResultChildren.push(resultElement);
    });
    this.modal.updateResultChildren(newResultChildren);
  }

  /**
   * sets focus to search input
   */
  setFocusToInput() {
    this.searchInput.input.focus();
  }

  /**
   * sets focus to the result element with data-key === idx
   * @param {number|string} idx - index
   */
  setFocusToResult(idx) {
    const results = this.modal.result.querySelectorAll('.qdr-search-result');
    if (results.length === 0) {
      return;
    }
    const resultToFocus = [...results].find(el => {
      return parseInt(el.dataset.key) === parseInt(idx);
    });
    resultToFocus.focus();
  }

  /**
   * navigates through results with keyboard keys ArrowUp and ArrowDown
   * @param {Event} e - event 'keyup' or 'keydown'
   */
  navigateTroughResults(e) {
    let tempIdx;

    if (e.key === 'ArrowUp') {
      tempIdx = this.activeResultIdx - 1;

      if (tempIdx >= 0) {
        this.activeResultIdx = tempIdx;
      } else {
        // go to the input
        this.activeResultIdx = null;
        this.setFocusToInput();
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      if (this.activeResultIdx === null) {
        tempIdx = 0;
      } else {
        tempIdx = this.activeResultIdx + 1;
      }

      if (tempIdx < this.searchInput.data.length) {
        this.activeResultIdx = tempIdx;
      } else {
        // go to the first element
        this.activeResultIdx = 0;
      }
    }

    this.setFocusToResult(this.activeResultIdx);
  }

}
