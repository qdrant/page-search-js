import {generateUrlWithSelector, simulateClick} from "./helpers";
import {ModalWindow} from "./ModalWindow";
import {Search} from "./Search";

export class SearchModal {
  constructor({searchApiUrl, section}) {
    this.apiUrl = searchApiUrl;
    this.section = section;
    this.modal = new ModalWindow({
      modalOuterSelector: '#searchModal',
      modalDialogSelector: '.qdr-search__dialog',
      closeBtnSelector: '.qdr-search__close',
      resultSelector: '.qdr-search__results',
    });

    this.searchInput = new Search({apiUrl: this.apiUrl, section: this.section});
    this.activeResultIdx = null;

    // when a search modal is shown
    document.addEventListener('qdrModalShow', this.setFocusToInput.bind(this));

    // when new search data if ready to be shown
    document.addEventListener('searchDataIsReady', this.updateResult.bind(this));

    // when any key pressed
    const navigateTroughResultsHandler = this.navigateTroughResults.bind(this)
    document.addEventListener('keydown', e => {
      // navigation if arrows up or down pressed
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        navigateTroughResultsHandler(e);
      }
      // on Enter - go by the active link
      if (e.key === 'Enter') {
        e.preventDefault();
        // simulate click on the active result
        simulateClick(this.modal.result.querySelector(`.qdr-search-result[data-key="${this.activeResultIdx}"]`));
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
    resultElem.href = generateUrlWithSelector(data, this.searchInput.input?.value);

    const iconClass = data.payload.tag === "p" ? "qdr-search-result__icon" : "qdr-search-result__paragraph-icon";

    resultElem.innerHTML = `<span class="${iconClass}"></span>
                   <div class="qdr-search-result__body"><h5 class="mt-0">${data?.highlight || data.payload.text}</h5>
                   <p>${data.payload.titles.join(' > ')}</p></div>`;

    return resultElem;
  }

  /**
   * updates results elements for new data
   */
  updateResult() {
    const newResultChildren = [];
    this.activeResultIdx = null;
    this.searchInput.data.forEach((result, i) => {
      const resultElement = this.generateSearchResult(result);
      resultElement.dataset.key = i;
      newResultChildren.push(resultElement);

      resultElement.addEventListener('mouseover', e => {
        this.activeResultIdx = parseInt(resultElement.dataset.key);
        this.addActiveClassToResult(this.activeResultIdx);
      });
    });
    this.modal.updateResultChildren(newResultChildren, () => {
      this.activeResultIdx = 0;
      this.addActiveClassToResult(this.activeResultIdx);
    });
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
  addActiveClassToResult(idx) {
    const results = this.modal.result.querySelectorAll('.qdr-search-result');
    if (results.length === 0) {
      return;
    }
    [...results].forEach(el => {
      if (el.classList.contains('active')) {
        el.classList.remove('active');
      }
    });
    const resultToActivate = [...results].find(el => {
      return parseInt(el.dataset.key) === parseInt(idx);
    });
    resultToActivate.classList.add('active');
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
        // set index to the last result
        this.activeResultIdx = this.searchInput.data.length - 1;
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
        // set index to the first element
        this.activeResultIdx = 0;
      }
    }

    // add an 'active' class to the element with data-key == this.activeResultIdx
    this.addActiveClassToResult(this.activeResultIdx);

  }

}
