import { generateUrlWithSelector, simulateClick } from './helpers.js';
import { ModalWindow } from './ModalWindow.js';
import { Search } from './Search.js';

export class SearchModal {
  constructor({ searchApiUrl, section, partition, useDirectQdrant = false, qdrantConfig = {} }) {
    this.apiUrl = searchApiUrl;
    this.section = section;
    this.partition = partition;
    this.useDirectQdrant = useDirectQdrant;
    this.qdrantConfig = qdrantConfig;
    this.modal = new ModalWindow({
      modalOuterSelector: '#searchModal',
      modalDialogSelector: '.qdr-search__dialog',
      closeBtnSelector: '.qdr-search__close',
      resultSelector: '.qdr-search__results',
    });

    this.searchInput = new Search({
      apiUrl: this.apiUrl,
      section: this.section,
      partition: this.partition,
      useDirectQdrant: this.useDirectQdrant,
      qdrantConfig: this.qdrantConfig,
    });
    this.activeResultIdx = null;
    this.isModalShown = false;

    this.boundHandlers = {
      modalShow: this.handleModalShow.bind(this),
      modalHide: this.handleModalHide.bind(this),
      searchReady: this.updateResult.bind(this),
      keydown: this.handleKeydown.bind(this),
    };

    this.attachEventListeners();
  }

  attachEventListeners() {
    document.addEventListener('qdrModalShow', this.boundHandlers.modalShow);
    document.addEventListener('qdrModalHide', this.boundHandlers.modalHide);
    document.addEventListener('searchDataIsReady', this.boundHandlers.searchReady);
    document.addEventListener('keydown', this.boundHandlers.keydown);
    
    if (this.modal.result) {
      this.modal.result.addEventListener('mouseover', this.handleResultHover.bind(this));
    }
  }

  detachEventListeners() {
    document.removeEventListener('qdrModalShow', this.boundHandlers.modalShow);
    document.removeEventListener('qdrModalHide', this.boundHandlers.modalHide);
    document.removeEventListener('searchDataIsReady', this.boundHandlers.searchReady);
    document.removeEventListener('keydown', this.boundHandlers.keydown);
    
    if (this.modal.result) {
      this.modal.result.removeEventListener('mouseover', this.handleResultHover.bind(this));
    }
  }

  handleModalShow() {
    this.setFocusToInput();
    this.isModalShown = true;
  }

  handleModalHide() {
    this.isModalShown = false;
  }

  handleKeydown(e) {
    if (!this.isModalShown) {
      return;
    }

    // navigation if arrows up or down pressed
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.navigateTroughResults(e);
    }
    // on Enter - go by the active link
    if (e.key === 'Enter') {
      e.preventDefault();
      // simulate click on the active result
      simulateClick(
        this.modal.result.querySelector(`.qdr-search-result[data-key="${this.activeResultIdx}"]`)
      );
    }
  }

  handleResultHover(e) {
    const resultElement = e.target.closest('.qdr-search-result');
    if (resultElement && resultElement.dataset.key) {
      this.activeResultIdx = Number.parseInt(resultElement.dataset.key);
      this.addActiveClassToResult(this.activeResultIdx);
    }
  }

  destroy() {
    this.detachEventListeners();
    this.modal = null;
    this.searchInput = null;
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

    const iconClass =
      data.payload.tag === 'p' ? 'qdr-search-result__icon' : 'qdr-search-result__paragraph-icon';

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
    // Remove active class from previously active element
    const previousActive = this.modal.result.querySelector('.qdr-search-result.active');
    if (previousActive) {
      previousActive.classList.remove('active');
    }
    
    // Add active class to new element using direct selector
    const resultToActivate = this.modal.result.querySelector(`.qdr-search-result[data-key="${idx}"]`);
    if (resultToActivate) {
      resultToActivate.classList.add('active');
    }
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
